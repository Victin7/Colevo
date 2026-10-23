// Edge Function: roda todo dia de manhã (pg_cron) e manda um e-mail para cada aluno
// com as provas/entregas que estão chegando e que ele ainda não marcou como feitas.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

type Pendente = {
  user_id: string
  email: string
  nome: string
  evento_id: string
  titulo: string
  tipo: 'prova' | 'entrega' | 'apresentacao'
  prazo: string
  sala_nome: string
  materia_nome: string | null
  dias_antes: number
}

const APP_URL = 'https://victin7.github.io/Turma-ADS/'
const ICONE = { prova: '📝', entrega: '📦', apresentacao: '🎤' } as const

const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })

const quando = (dias: number) => (dias === 0 ? 'HOJE' : dias === 1 ? 'amanhã' : `em ${dias} dias`)

const escapar = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

function montarEmail(nome: string, itens: Pendente[]) {
  const linhas = itens
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .map((i) => {
      const data = new Date(i.prazo).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #27272a">
          <div style="font-size:16px;color:#f4f4f5">${ICONE[i.tipo]} <b>${escapar(i.titulo)}</b></div>
          <div style="font-size:13px;color:#a1a1aa">${i.materia_nome ? escapar(i.materia_nome) + ' · ' : ''}${escapar(i.sala_nome)} · ${data}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #27272a;text-align:right;color:#f0abfc;font-weight:bold;white-space:nowrap">${quando(i.dias_antes)}</td>
      </tr>`
    })
    .join('')

  const html = `<div style="background:#09090b;padding:32px 16px;font-family:Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#18181b;border:1px solid #3f3f46;border-radius:16px;padding:24px">
      <h1 style="margin:0 0 4px;font-size:22px;color:#a5b4fc">Turma ADS</h1>
      <p style="margin:0 0 16px;color:#d4d4d8">Oi, ${escapar(nome)}! Isso está chegando:</p>
      <table style="width:100%;border-collapse:collapse">${linhas}</table>
      <a href="${APP_URL}" style="display:inline-block;margin-top:20px;background:#a5b4fc;color:#09090b;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:bold">Abrir o app</a>
      <p style="margin-top:20px;font-size:12px;color:#71717a">Você recebe isso porque ativou lembretes por e-mail. Dá para mudar em 🔔 Lembretes no app.</p>
    </div>
  </div>`

  const assunto = itens.length === 1 ? `${ICONE[itens[0].tipo]} ${itens[0].titulo} é ${quando(itens[0].dias_antes)}` : `🔔 ${itens.length} provas/entregas chegando`
  return { html, assunto }
}

Deno.serve(async (req) => {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // Só o agendamento do banco conhece este segredo (gerado e guardado no próprio banco).
  const { data: autorizado } = await admin.rpc('cron_segredo_valido', { p_segredo: req.headers.get('x-cron-secret') ?? '' })
  if (!autorizado) return resposta({ erro: 'não autorizado' }, 401)

  const { data, error } = await admin.rpc('lembretes_pendentes')
  if (error) return resposta({ erro: error.message }, 500)
  const pendentes = (data ?? []) as Pendente[]

  const chave = Deno.env.get('RESEND_API_KEY')
  if (!chave) return resposta({ pendentes: pendentes.length, enviados: 0, aviso: 'RESEND_API_KEY não configurada' })
  const remetente = Deno.env.get('EMAIL_REMETENTE') ?? 'Turma ADS <onboarding@resend.dev>'

  // Um e-mail por aluno, juntando tudo o que está chegando para ele.
  const porAluno = new Map<string, Pendente[]>()
  for (const p of pendentes) porAluno.set(p.user_id, [...(porAluno.get(p.user_id) ?? []), p])

  let enviados = 0
  const falhas: string[] = []
  for (const itens of porAluno.values()) {
    const { html, assunto } = montarEmail(itens[0].nome, itens)
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: remetente, to: itens[0].email, subject: assunto, html }),
    })
    if (!r.ok) {
      falhas.push(`${r.status} ${await r.text()}`)
      continue
    }
    enviados++
    // Registra para não mandar o mesmo lembrete de novo
    await admin.from('lembretes_enviados').insert(itens.map((i) => ({ evento_id: i.evento_id, user_id: i.user_id, dias_antes: i.dias_antes })))
  }

  return resposta({ pendentes: pendentes.length, alunos: porAluno.size, enviados, falhas: falhas.slice(0, 3) })
})
