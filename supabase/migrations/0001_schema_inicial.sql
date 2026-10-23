-- =====================================================================
-- Turma ADS — schema inicial
-- Ideia central: tudo pertence a uma TURMA. Quem é membro da turma
-- vê e edita o que é dela; quem não é, não vê nada (RLS).
-- =====================================================================

-- Perfil público de cada usuário (o auth.users é privado do Supabase)
create table public.perfis (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null,
  criado_em  timestamptz not null default now()
);

create table public.turmas (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,                         -- ex: "ADS 3º semestre — Noite"
  codigo_convite  text not null unique
                  default upper(substr(md5(random()::text), 1, 6)),
  criado_por      uuid not null references public.perfis (id),
  criado_em       timestamptz not null default now()
);

create type public.papel_membro as enum ('admin', 'membro');

create table public.turma_membros (
  turma_id  uuid not null references public.turmas (id) on delete cascade,
  user_id   uuid not null references public.perfis (id) on delete cascade,
  papel     public.papel_membro not null default 'membro',
  entrou_em timestamptz not null default now(),
  primary key (turma_id, user_id)
);

create table public.materias (
  id         uuid primary key default gen_random_uuid(),
  turma_id   uuid not null references public.turmas (id) on delete cascade,
  nome       text not null,                              -- ex: "Modelagem de Banco de Dados"
  professor  text,
  cor        text not null default '#a5b4fc'             -- cor da matéria no calendário
);

create type public.tipo_evento as enum ('prova', 'entrega', 'apresentacao');

create table public.eventos (
  id          uuid primary key default gen_random_uuid(),
  turma_id    uuid not null references public.turmas (id) on delete cascade,
  materia_id  uuid references public.materias (id) on delete set null,
  tipo        public.tipo_evento not null,
  titulo      text not null,
  descricao   text,
  prazo       timestamptz not null,
  criado_por  uuid not null references public.perfis (id),
  criado_em   timestamptz not null default now()
);
create index eventos_turma_prazo_idx on public.eventos (turma_id, prazo);

create type public.tipo_material as enum ('link', 'arquivo', 'nota');

create table public.materiais (
  id          uuid primary key default gen_random_uuid(),
  turma_id    uuid not null references public.turmas (id) on delete cascade,
  materia_id  uuid not null references public.materias (id) on delete cascade,
  tipo        public.tipo_material not null,
  titulo      text not null,
  url         text,          -- para 'link' e 'arquivo' (Storage)
  conteudo    text,          -- para 'nota'
  criado_por  uuid not null references public.perfis (id),
  criado_em   timestamptz not null default now(),
  constraint material_tem_conteudo check (
    (tipo = 'nota' and conteudo is not null) or
    (tipo in ('link', 'arquivo') and url is not null)
  )
);

-- Preferências de lembrete de cada usuário
create table public.preferencias_lembrete (
  user_id      uuid primary key references public.perfis (id) on delete cascade,
  email_ativo  boolean not null default true,
  dias_antes   int[] not null default '{1,3}'             -- avisar 1 e 3 dias antes
);

-- Controle para não mandar o mesmo lembrete duas vezes
create table public.lembretes_enviados (
  evento_id   uuid not null references public.eventos (id) on delete cascade,
  user_id     uuid not null references public.perfis (id) on delete cascade,
  dias_antes  int  not null,
  enviado_em  timestamptz not null default now(),
  primary key (evento_id, user_id, dias_antes)
);

-- =====================================================================
-- Segurança (Row Level Security)
-- =====================================================================

-- Função auxiliar: o usuário logado é membro dessa turma?
-- "security definer" evita recursão infinita nas políticas de turma_membros.
create function public.eh_membro(p_turma uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.turma_membros
    where turma_id = p_turma and user_id = auth.uid()
  );
$$;

alter table public.perfis                enable row level security;
alter table public.turmas                enable row level security;
alter table public.turma_membros         enable row level security;
alter table public.materias              enable row level security;
alter table public.eventos               enable row level security;
alter table public.materiais             enable row level security;
alter table public.preferencias_lembrete enable row level security;
alter table public.lembretes_enviados    enable row level security;

-- Perfis: qualquer logado vê nomes (para mostrar "criado por"); só edita o seu
create policy "perfis: leitura" on public.perfis for select to authenticated using (true);
create policy "perfis: edita o próprio" on public.perfis for update to authenticated using (id = auth.uid());

-- Turmas: membros veem; qualquer logado cria
create policy "turmas: membros veem" on public.turmas for select to authenticated using (public.eh_membro(id));
create policy "turmas: criar" on public.turmas for insert to authenticated with check (criado_por = auth.uid());

-- Membros: vê os colegas da própria turma
create policy "membros: ver colegas" on public.turma_membros for select to authenticated using (public.eh_membro(turma_id));

-- Matérias, eventos e materiais: tudo liberado para membros da turma
create policy "materias: membros" on public.materias for all to authenticated
  using (public.eh_membro(turma_id)) with check (public.eh_membro(turma_id));

create policy "eventos: membros veem" on public.eventos for select to authenticated using (public.eh_membro(turma_id));
create policy "eventos: membros criam" on public.eventos for insert to authenticated
  with check (public.eh_membro(turma_id) and criado_por = auth.uid());
create policy "eventos: autor edita" on public.eventos for update to authenticated using (criado_por = auth.uid());
create policy "eventos: autor apaga" on public.eventos for delete to authenticated using (criado_por = auth.uid());

create policy "materiais: membros veem" on public.materiais for select to authenticated using (public.eh_membro(turma_id));
create policy "materiais: membros criam" on public.materiais for insert to authenticated
  with check (public.eh_membro(turma_id) and criado_por = auth.uid());
create policy "materiais: autor apaga" on public.materiais for delete to authenticated using (criado_por = auth.uid());

create policy "lembrete: só o seu" on public.preferencias_lembrete for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- lembretes_enviados: sem políticas = só o servidor (service role) acessa.

-- =====================================================================
-- Ações que precisam de regra de negócio ficam em funções (RPC)
-- =====================================================================

-- Cria a turma e já coloca quem criou como admin, numa operação só
create function public.criar_turma(p_nome text)
returns public.turmas
language plpgsql security definer set search_path = ''
as $$
declare nova public.turmas;
begin
  insert into public.turmas (nome, criado_por) values (p_nome, auth.uid()) returning * into nova;
  insert into public.turma_membros (turma_id, user_id, papel) values (nova.id, auth.uid(), 'admin');
  return nova;
end;
$$;

-- Entra numa turma usando o código de convite
create function public.entrar_na_turma(p_codigo text)
returns public.turmas
language plpgsql security definer set search_path = ''
as $$
declare t public.turmas;
begin
  select * into t from public.turmas where codigo_convite = upper(trim(p_codigo));
  if not found then
    raise exception 'Código de convite inválido';
  end if;
  insert into public.turma_membros (turma_id, user_id) values (t.id, auth.uid())
    on conflict do nothing;
  return t;
end;
$$;

-- Cria perfil + preferências automaticamente quando alguém se cadastra
create function public.ao_criar_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)));
  insert into public.preferencias_lembrete (user_id) values (new.id);
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.ao_criar_usuario();
