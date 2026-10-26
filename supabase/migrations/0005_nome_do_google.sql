-- Quem entra pelo Google não preenche "nome": usa o nome da conta Google.
create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
    values (new.id, coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ));
  insert into public.preferencias_lembrete (user_id) values (new.id);
  return new;
end;
$$;
