-- =====================================================================
-- 0003 — Turmas viram SALAS (estilo Among Us): código + senha.
-- Quem cria é o LÍDER; todo mundo que entra é aluno.
-- =====================================================================

-- ---------- Renomeações (os dados existentes são preservados) ----------
alter table public.turmas        rename to salas;
alter table public.turma_membros rename to sala_membros;
alter table public.salas         rename column codigo_convite to codigo;
alter table public.sala_membros  rename column turma_id to sala_id;
alter table public.materias      rename column turma_id to sala_id;
alter table public.eventos       rename column turma_id to sala_id;
alter table public.materiais     rename column turma_id to sala_id;
alter index public.eventos_turma_prazo_idx rename to eventos_sala_prazo_idx;
alter type public.papel_membro rename value 'admin' to 'lider';

drop function public.criar_turma(text);
drop function public.entrar_na_turma(text);

-- ---------- Funções auxiliares (schema "privado" não aparece na API) ----------

-- Corpo atualizado para o novo nome da tabela (o parâmetro mantém o nome antigo
-- porque as políticas de segurança já dependem desta função).
create or replace function privado.eh_membro(p_turma uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.sala_membros where sala_id = p_turma and user_id = auth.uid());
$$;

create function privado.eh_lider(p_sala uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.sala_membros where sala_id = p_sala and user_id = auth.uid() and papel = 'lider');
$$;

-- Versão que aceita texto (caminho de arquivo no Storage); devolve false se não for um uuid
create function privado.eh_membro_texto(p text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select case when p ~ '^[0-9a-f-]{36}$' then privado.eh_membro(p::uuid) else false end;
$$;

-- Código de 6 caracteres sem letras que confundem (sem O/0, I/1)
create function privado.gerar_codigo()
returns text language plpgsql volatile security definer set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.salas where codigo = c);
  end loop;
  return c;
end;
$$;

alter table public.salas alter column codigo set default privado.gerar_codigo();
alter table public.salas add constraint salas_nome_tamanho check (char_length(nome) between 1 and 60);

-- Senha da sala: só o hash (bcrypt), numa tabela que nenhum usuário consegue ler
create table privado.salas_senhas (
  sala_id    uuid primary key references public.salas (id) on delete cascade,
  senha_hash text not null
);

-- Tentativas erradas de entrar (proteção contra "chute" de senha)
create table privado.tentativas_entrada (
  user_id   uuid not null,
  criado_em timestamptz not null default now()
);
create index tentativas_entrada_idx on privado.tentativas_entrada (user_id, criado_em);

revoke all on privado.salas_senhas, privado.tentativas_entrada from public, anon, authenticated;

-- ---------- Ações das salas (RPC) ----------

create function public.criar_sala(p_nome text, p_senha text)
returns public.salas language plpgsql security definer set search_path = ''
as $$
declare nova public.salas;
begin
  if auth.uid() is null then raise exception 'Faça login para criar uma sala'; end if;
  if char_length(coalesce(p_senha, '')) < 4 then raise exception 'A senha da sala precisa ter pelo menos 4 caracteres'; end if;

  insert into public.salas (nome, criado_por) values (trim(p_nome), auth.uid()) returning * into nova;
  insert into privado.salas_senhas (sala_id, senha_hash) values (nova.id, extensions.crypt(p_senha, extensions.gen_salt('bf')));
  insert into public.sala_membros (sala_id, user_id, papel) values (nova.id, auth.uid(), 'lider');
  return nova;
end;
$$;

-- Devolve a sala se código e senha baterem; devolve NULL se não baterem
-- (não usa "raise" no erro para a tentativa errada ficar registrada).
create function public.entrar_na_sala(p_codigo text, p_senha text)
returns public.salas language plpgsql security definer set search_path = ''
as $$
declare
  s public.salas;
  h text;
begin
  if auth.uid() is null then raise exception 'Faça login para entrar numa sala'; end if;

  if (select count(*) from privado.tentativas_entrada
      where user_id = auth.uid() and criado_em > now() - interval '10 minutes') >= 8 then
    raise exception 'Muitas tentativas erradas. Espere alguns minutos e tente de novo.';
  end if;

  select * into s from public.salas where codigo = upper(regexp_replace(coalesce(p_codigo, ''), '[\s-]', '', 'g'));
  select senha_hash into h from privado.salas_senhas where sala_id = s.id;

  if s.id is null or (h is not null and h <> extensions.crypt(coalesce(p_senha, ''), h)) then
    insert into privado.tentativas_entrada (user_id) values (auth.uid());
    return null;
  end if;

  insert into public.sala_membros (sala_id, user_id) values (s.id, auth.uid()) on conflict do nothing;
  return s;
end;
$$;

create function public.sair_da_sala(p_sala uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare era_lider boolean;
begin
  delete from public.sala_membros where sala_id = p_sala and user_id = auth.uid()
    returning papel = 'lider' into era_lider;

  if not exists (select 1 from public.sala_membros where sala_id = p_sala) then
    delete from public.salas where id = p_sala;              -- sala vazia some
  elsif era_lider and not exists (select 1 from public.sala_membros where sala_id = p_sala and papel = 'lider') then
    update public.sala_membros set papel = 'lider'            -- o mais antigo vira líder
      where (sala_id, user_id) = (
        select sala_id, user_id from public.sala_membros where sala_id = p_sala order by entrou_em limit 1);
  end if;
end;
$$;

-- Funções só do líder
create function public.lider_definir_senha(p_sala uuid, p_senha text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not privado.eh_lider(p_sala) then raise exception 'Só o líder da sala pode fazer isso'; end if;
  if char_length(coalesce(p_senha, '')) < 4 then raise exception 'A senha precisa ter pelo menos 4 caracteres'; end if;
  insert into privado.salas_senhas (sala_id, senha_hash) values (p_sala, extensions.crypt(p_senha, extensions.gen_salt('bf')))
    on conflict (sala_id) do update set senha_hash = excluded.senha_hash;
end;
$$;

create function public.lider_novo_codigo(p_sala uuid)
returns text language plpgsql security definer set search_path = ''
as $$
declare c text;
begin
  if not privado.eh_lider(p_sala) then raise exception 'Só o líder da sala pode fazer isso'; end if;
  c := privado.gerar_codigo();
  update public.salas set codigo = c where id = p_sala;
  return c;
end;
$$;

create function public.lider_renomear(p_sala uuid, p_nome text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not privado.eh_lider(p_sala) then raise exception 'Só o líder da sala pode fazer isso'; end if;
  update public.salas set nome = trim(p_nome) where id = p_sala;
end;
$$;

create function public.lider_remover_membro(p_sala uuid, p_user uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not privado.eh_lider(p_sala) then raise exception 'Só o líder da sala pode fazer isso'; end if;
  if p_user = auth.uid() then raise exception 'Para sair da sala, use o botão Sair'; end if;
  delete from public.sala_membros where sala_id = p_sala and user_id = p_user;
end;
$$;

create function public.lider_tornar_lider(p_sala uuid, p_user uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not privado.eh_lider(p_sala) then raise exception 'Só o líder da sala pode fazer isso'; end if;
  update public.sala_membros set papel = 'lider' where sala_id = p_sala and user_id = p_user;
end;
$$;

create function public.lider_excluir_sala(p_sala uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not privado.eh_lider(p_sala) then raise exception 'Só o líder da sala pode fazer isso'; end if;
  delete from public.salas where id = p_sala;
end;
$$;

-- Só quem está logado chama as funções
do $$
declare f text;
begin
  foreach f in array array[
    'criar_sala(text, text)', 'entrar_na_sala(text, text)', 'sair_da_sala(uuid)',
    'lider_definir_senha(uuid, text)', 'lider_novo_codigo(uuid)', 'lider_renomear(uuid, text)',
    'lider_remover_membro(uuid, uuid)', 'lider_tornar_lider(uuid, uuid)', 'lider_excluir_sala(uuid)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
revoke execute on function privado.eh_lider(uuid), privado.eh_membro_texto(text), privado.gerar_codigo() from public, anon;
grant execute on function privado.eh_lider(uuid), privado.eh_membro_texto(text) to authenticated;

-- ---------- Ajustes de permissões ----------

-- Nomes de perfil: só você e quem divide sala com você
drop policy "perfis: leitura" on public.perfis;
create policy "perfis: você e colegas" on public.perfis for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.sala_membros a join public.sala_membros b on a.sala_id = b.sala_id
    where a.user_id = auth.uid() and b.user_id = perfis.id
  )
);

-- Criar sala só pela função (que também grava a senha)
drop policy "turmas: criar" on public.salas;

-- Eventos: quem criou ou o líder edita/apaga
drop policy "eventos: autor edita" on public.eventos;
drop policy "eventos: autor apaga" on public.eventos;
create policy "eventos: autor ou líder edita" on public.eventos for update to authenticated
  using (criado_por = auth.uid() or privado.eh_lider(sala_id));
create policy "eventos: autor ou líder apaga" on public.eventos for delete to authenticated
  using (criado_por = auth.uid() or privado.eh_lider(sala_id));

-- Materiais: arquivos enviados ficam no Storage
alter table public.materiais add column arquivo_path text;
alter table public.materiais drop constraint material_tem_conteudo;
alter table public.materiais add constraint material_tem_conteudo check (
  (tipo = 'nota' and conteudo is not null) or
  (tipo = 'link' and url is not null) or
  (tipo = 'arquivo' and arquivo_path is not null)
);
drop policy "materiais: autor apaga" on public.materiais;
create policy "materiais: autor ou líder apaga" on public.materiais for delete to authenticated
  using (criado_por = auth.uid() or privado.eh_lider(sala_id));

alter table public.materias add constraint materias_nome_tamanho check (char_length(nome) between 1 and 60);

-- ---------- Novas tabelas ----------

-- "Já fiz ✓" — cada aluno marca as suas
create table public.eventos_concluidos (
  evento_id    uuid not null references public.eventos (id) on delete cascade,
  user_id      uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  concluido_em timestamptz not null default now(),
  primary key (evento_id, user_id)
);
alter table public.eventos_concluidos enable row level security;
create policy "concluidos: só os seus" on public.eventos_concluidos for select to authenticated using (user_id = auth.uid());
create policy "concluidos: marcar" on public.eventos_concluidos for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.eventos e where e.id = evento_id and privado.eh_membro(e.sala_id))
);
create policy "concluidos: desmarcar" on public.eventos_concluidos for delete to authenticated using (user_id = auth.uid());

-- Curtidas nos materiais
create table public.materiais_curtidas (
  material_id uuid not null references public.materiais (id) on delete cascade,
  user_id     uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  primary key (material_id, user_id)
);
alter table public.materiais_curtidas enable row level security;
create policy "curtidas: membros veem" on public.materiais_curtidas for select to authenticated using (
  exists (select 1 from public.materiais m where m.id = material_id and privado.eh_membro(m.sala_id))
);
create policy "curtidas: curtir" on public.materiais_curtidas for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.materiais m where m.id = material_id and privado.eh_membro(m.sala_id))
);
create policy "curtidas: descurtir" on public.materiais_curtidas for delete to authenticated using (user_id = auth.uid());

-- ---------- Storage: PDFs e imagens da sala (pasta = id da sala) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materiais', 'materiais', false, 10485760,
        array['application/pdf', 'image/png', 'image/jpeg', 'image/webp',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do nothing;

create policy "materiais: membros baixam" on storage.objects for select to authenticated
  using (bucket_id = 'materiais' and privado.eh_membro_texto((storage.foldername(name))[1]));
create policy "materiais: membros enviam" on storage.objects for insert to authenticated
  with check (bucket_id = 'materiais' and privado.eh_membro_texto((storage.foldername(name))[1]));
create policy "materiais: dono apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'materiais' and owner_id = auth.uid()::text);

-- ---------- Tempo real ----------
alter publication supabase_realtime add table public.eventos, public.materias, public.materiais;

-- ---------- Lembretes por e-mail (usado pela Edge Function, só com a chave de serviço) ----------
create function public.lembretes_pendentes()
returns table (
  user_id uuid, email text, nome text, evento_id uuid, titulo text, tipo public.tipo_evento,
  prazo timestamptz, sala_nome text, materia_nome text, dias_antes int
)
language sql stable security definer set search_path = ''
as $$
  with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d)
  select m.user_id, u.email::text, p.nome, e.id, e.titulo, e.tipo, e.prazo, s.nome, ma.nome,
         ((e.prazo at time zone 'America/Sao_Paulo')::date - hoje.d)::int
  from hoje, public.eventos e
  join public.salas s           on s.id = e.sala_id
  join public.sala_membros m    on m.sala_id = e.sala_id
  join public.perfis p          on p.id = m.user_id
  join auth.users u             on u.id = m.user_id
  join public.preferencias_lembrete pr on pr.user_id = m.user_id and pr.email_ativo
  left join public.materias ma  on ma.id = e.materia_id
  where ((e.prazo at time zone 'America/Sao_Paulo')::date - hoje.d) = any (pr.dias_antes)
    and not exists (select 1 from public.eventos_concluidos c where c.evento_id = e.id and c.user_id = m.user_id)
    and not exists (select 1 from public.lembretes_enviados l
                    where l.evento_id = e.id and l.user_id = m.user_id
                      and l.dias_antes = ((e.prazo at time zone 'America/Sao_Paulo')::date - hoje.d));
$$;
revoke execute on function public.lembretes_pendentes() from public, anon, authenticated;
grant execute on function public.lembretes_pendentes() to service_role;
