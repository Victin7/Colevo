-- Ajustes apontados pelo verificador de segurança do Supabase.

-- A função de checagem fica num schema que a API não expõe
create schema if not exists privado;
grant usage on schema privado to authenticated;
alter function public.eh_membro(uuid) set schema privado;

-- Ninguém chama direto: só o trigger de cadastro usa
revoke execute on function public.ao_criar_usuario() from public, anon, authenticated;

-- Só usuários logados podem criar/entrar em turma
revoke execute on function public.criar_turma(text) from public, anon;
revoke execute on function public.entrar_na_turma(text) from public, anon;
revoke execute on function privado.eh_membro(uuid) from public, anon;
grant execute on function public.criar_turma(text) to authenticated;
grant execute on function public.entrar_na_turma(text) to authenticated;
grant execute on function privado.eh_membro(uuid) to authenticated;
