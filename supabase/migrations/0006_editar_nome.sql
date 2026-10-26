-- Perfil editável: cada um pode trocar o próprio nome, e só o nome.
-- (A política "perfis: edita o próprio" já limita a linha; aqui limitamos a coluna e o tamanho.)

revoke update on public.perfis from anon, authenticated;
grant update (nome) on public.perfis to authenticated;

-- "not valid": vale para toda alteração daqui em diante sem travar nomes antigos
alter table public.perfis
  add constraint perfis_nome_tamanho check (char_length(btrim(nome)) between 2 and 40) not valid;
