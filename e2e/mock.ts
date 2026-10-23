import type { BrowserContext, Page, Route } from '@playwright/test'

/**
 * "Banco de mentira" para os testes de ponta a ponta.
 * Intercepta as chamadas ao Supabase e responde com dados fixos,
 * assim os testes rodam no CI sem tocar no banco de verdade.
 */

const EU = '11111111-1111-1111-1111-111111111111'
const COLEGA = '22222222-2222-2222-2222-222222222222'

const hoje = new Date()
const dia = (n: number, h = 23, m = 59) => new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + n, h, m).toISOString()
const emHoras = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString()

export const materias = [
  { id: 'm1', sala_id: 's1', nome: 'Modelagem de Banco de Dados', professor: 'Prof. Andrea', cor: '#f0abfc' },
  { id: 'm2', sala_id: 's1', nome: 'Engenharia de Software', professor: 'Prof. Carlos', cor: '#7dd3fc' },
  { id: 'm3', sala_id: 's1', nome: 'Fundamentos da Web', professor: 'Prof. Marina', cor: '#86efac' },
]
const m = (id: string) => {
  const x = materias.find((y) => y.id === id)!
  return { id: x.id, nome: x.nome, cor: x.cor, professor: x.professor }
}

export const eventos = [
  { id: 'e1', titulo: 'P1 — Modelagem de dados', tipo: 'prova', prazo: emHoras(4.2), descricao: 'Capítulos 1 a 4, diagrama ER', criado_por: EU, materia_id: 'm1', materias: m('m1') },
  { id: 'e2', titulo: 'Projeto integrador — site da ONG', tipo: 'entrega', prazo: dia(2), descricao: null, criado_por: COLEGA, materia_id: 'm3', materias: m('m3') },
  { id: 'e3', titulo: 'Seminário de requisitos', tipo: 'apresentacao', prazo: dia(6, 19, 0), descricao: null, criado_por: COLEGA, materia_id: 'm2', materias: m('m2') },
  { id: 'e4', titulo: 'Lista de exercícios 4', tipo: 'entrega', prazo: dia(12), descricao: null, criado_por: EU, materia_id: 'm1', materias: m('m1') },
  { id: 'e5', titulo: 'Prova substitutiva', tipo: 'prova', prazo: dia(12, 19, 30), descricao: null, criado_por: EU, materia_id: 'm2', materias: m('m2') },
]

const sala = { id: 's1', nome: 'ADS 3º sem — Noite', codigo: 'K7QX2M', criado_por: EU, criado_em: '2026-10-01T00:00:00Z' }

const membros = [
  { user_id: EU, papel: 'lider', entrou_em: '2026-10-01T00:00:00Z', perfis: { nome: 'Victin' } },
  { user_id: COLEGA, papel: 'membro', entrou_em: '2026-10-02T00:00:00Z', perfis: { nome: 'Carol' } },
  { user_id: '33333333-3333-3333-3333-333333333333', papel: 'membro', entrou_em: '2026-10-03T00:00:00Z', perfis: { nome: 'Rafael' } },
]

const materiais = [
  { id: 'x1', sala_id: 's1', materia_id: 'm1', tipo: 'nota', titulo: 'Resumo: formas normais', conteudo: '1FN: valores atômicos\n2FN: sem dependência parcial\n3FN: sem dependência transitiva', url: null, arquivo_path: null, criado_por: COLEGA, criado_em: '2026-10-20T00:00:00Z', materias: { nome: 'Modelagem de Banco de Dados', cor: '#f0abfc' }, perfis: { nome: 'Carol' }, materiais_curtidas: [{ user_id: EU }, { user_id: COLEGA }] },
  { id: 'x2', sala_id: 's1', materia_id: 'm3', tipo: 'link', titulo: 'Guia de Flexbox', conteudo: null, url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', arquivo_path: null, criado_por: EU, criado_em: '2026-10-21T00:00:00Z', materias: { nome: 'Fundamentos da Web', cor: '#86efac' }, perfis: { nome: 'Victin' }, materiais_curtidas: [] },
]

export interface OpcoesMock {
  logado?: boolean
  semSalas?: boolean
  concluidos?: string[]
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) })

export async function prepararMock(alvo: Page | BrowserContext, opcoes: OpcoesMock = {}) {
  const { logado = true, semSalas = false } = opcoes
  const concluidos = new Set(opcoes.concluidos ?? ['e3'])

  if (logado) {
    const user = { id: EU, aud: 'authenticated', role: 'authenticated', email: 'victin@exemplo.com', user_metadata: { nome: 'Victin' }, app_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
    const sessao = { access_token: 'token-de-teste', refresh_token: 'r', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600 * 24, user }
    await alvo.addInitScript((s) => localStorage.setItem('sb-exemplo-auth-token', s), JSON.stringify(sessao))
  }

  await alvo.route('https://exemplo.supabase.co/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const metodo = req.method()
    const umObjeto = (req.headers()['accept'] ?? '').includes('vnd.pgrst.object')
    const caminho = url.pathname

    if (metodo === 'OPTIONS') return json(route, {})
    if (caminho.startsWith('/auth/v1/user')) return json(route, { id: EU, email: 'victin@exemplo.com', user_metadata: { nome: 'Victin' } })
    if (caminho.startsWith('/auth/v1/')) return json(route, {})

    if (caminho === '/rest/v1/rpc/entrar_na_sala') {
      const corpo = req.postDataJSON() as { p_codigo: string; p_senha: string }
      return json(route, corpo.p_codigo === 'K7QX2M' && corpo.p_senha === 'amongus' ? sala : null)
    }
    if (caminho === '/rest/v1/rpc/criar_sala') {
      const corpo = req.postDataJSON() as { p_nome: string }
      return json(route, { ...sala, id: 's2', nome: corpo.p_nome, codigo: 'NEW4ZZ' })
    }
    if (caminho.startsWith('/rest/v1/rpc/')) return json(route, null)

    const tabela = caminho.replace('/rest/v1/', '')
    if (metodo !== 'GET' && metodo !== 'HEAD') {
      if (tabela === 'eventos_concluidos') {
        const id = metodo === 'POST' ? (req.postDataJSON() as { evento_id: string }).evento_id : url.searchParams.get('evento_id')?.replace('eq.', '')
        if (id) (metodo === 'POST' ? concluidos.add(id) : concluidos.delete(id))
      }
      return route.fulfill({ status: metodo === 'POST' ? 201 : 204, headers: { 'access-control-allow-origin': '*', 'content-range': '*/1' } })
    }

    const dados: Record<string, unknown[]> = {
      salas: semSalas ? [] : [{ ...sala, sala_membros: [{ count: 24 }] }],
      sala_membros: membros,
      eventos,
      eventos_concluidos: [...concluidos].map((id) => ({ evento_id: id, eventos: { sala_id: 's1' } })),
      materias,
      materiais,
      preferencias_lembrete: [{ email_ativo: true, dias_antes: [1, 3] }],
    }
    const lista = dados[tabela] ?? []
    if (umObjeto) return lista.length ? json(route, tabela === 'salas' ? sala : lista[0]) : json(route, null, 406)
    return json(route, lista)
  })
}
