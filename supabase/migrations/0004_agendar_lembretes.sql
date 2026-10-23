-- Agendamento diário dos lembretes por e-mail (8h no horário de Brasília = 11h UTC).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Segredo aleatório que só o banco conhece: o cron manda no cabeçalho,
-- e a Edge Function confere chamando cron_segredo_valido().
create table privado.configuracoes (chave text primary key, valor text not null);
revoke all on privado.configuracoes from public, anon, authenticated;
insert into privado.configuracoes (chave, valor)
values ('cron_segredo', encode(extensions.gen_random_bytes(32), 'hex'));

create function public.cron_segredo_valido(p_segredo text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from privado.configuracoes where chave = 'cron_segredo' and valor = p_segredo);
$$;
revoke execute on function public.cron_segredo_valido(text) from public, anon, authenticated;
grant execute on function public.cron_segredo_valido(text) to service_role;

select cron.schedule(
  'enviar-lembretes-diario',
  '0 11 * * *',
  $$
  select net.http_post(
    url := 'https://ygahwxxzzqmqcdenjqiz.supabase.co/functions/v1/enviar-lembretes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select valor from privado.configuracoes where chave = 'cron_segredo')
    ),
    body := '{}'::jsonb
  );
  $$
);
