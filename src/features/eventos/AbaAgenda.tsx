import { useState, type FormEvent } from 'react'
import { AreaTexto, atraso, BarraProgresso, Botao, Campo, Cartao, Erro, Seletor, Vazio } from '../../components/ui'
import { deCampos } from '../../lib/datas'
import type { Enums } from '../../lib/database.types'
import { useAgora } from '../../lib/useAgora'
import { usePreferencias } from '../lembretes/api'
import { eventosParaLembrar } from '../lembretes/lembretes'
import { useMaterias } from '../materias/api'
import { baixarArquivo, gerarIcs } from './agenda-externa'
import { useAlternarConcluido, useApagarEvento, useConcluidos, useCriarEvento, useEventos } from './api'
import { CardEvento, rotulosTipo } from './CardEvento'
import { ordenarPorPrazo } from './prazo'

type Filtro = 'pendentes' | 'todos' | 'feitos'

export function AbaAgenda({ salaId, nomeSala, euId, lider }: { salaId: string; nomeSala: string; euId?: string; lider: boolean }) {
  const eventos = useEventos(salaId)
  const concluidos = useConcluidos(salaId)
  const prefs = usePreferencias()
  const alternar = useAlternarConcluido(salaId)
  const apagar = useApagarEvento(salaId)
  const agora = useAgora()
  const [filtro, setFiltro] = useState<Filtro>('pendentes')
  const [materiaFiltro, setMateriaFiltro] = useState<string>('')

  const feitos = concluidos.data ?? new Set<string>()
  const todos = eventos.data ?? []
  const lembretes = eventosParaLembrar(todos, feitos, prefs.data?.dias_antes ?? [1, 3], agora)
  const totalFeitos = todos.filter((e) => feitos.has(e.id)).length

  const visiveis = ordenarPorPrazo(todos, agora)
    .filter((e) => !materiaFiltro || e.materia_id === materiaFiltro)
    .filter((e) => {
      if (filtro === 'feitos') return feitos.has(e.id)
      if (filtro === 'pendentes') return !feitos.has(e.id) && e.prazo >= new Date(agora.getTime() - 86_400_000 * 2)
      return true
    })

  const materiasUsadas = [...new Map(todos.filter((e) => e.materia).map((e) => [e.materia!.id, e.materia!])).values()]

  return (
    <div className="space-y-6">
      {lembretes.length > 0 && (
        <Cartao className="entrar-3d border-fuchsia-400/30 bg-fuchsia-500/5">
          <p className="mb-2 font-semibold">🔔 Chegando aí</p>
          <ul className="space-y-1 text-sm">
            {lembretes.slice(0, 4).map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span className="truncate">{l.titulo}</span>
                <span className="shrink-0 font-medium text-fuchsia-300">{l.dias === 0 ? 'hoje' : l.dias === 1 ? 'amanhã' : `em ${l.dias} dias`}</span>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      {todos.length > 0 && (
        <Cartao className="entrar-3d space-y-2" style={atraso(1)}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Seu progresso</span>
            <span className="text-zinc-400">{totalFeitos} de {todos.length} feitos</span>
          </div>
          <BarraProgresso valor={totalFeitos} total={todos.length} />
        </Cartao>
      )}

      <NovoEventoForm salaId={salaId} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-lg border border-white/10 p-0.5 text-sm">
            {(['pendentes', 'todos', 'feitos'] as Filtro[]).map((f) => (
              <button key={f} onClick={() => setFiltro(f)} className={`rounded-md px-3 py-1 capitalize transition ${filtro === f ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {materiasUsadas.length > 0 && (
              <select value={materiaFiltro} onChange={(e) => setMateriaFiltro(e.target.value)} className="rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-sm" aria-label="Filtrar por matéria">
                <option value="">Todas as matérias</option>
                {materiasUsadas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            )}
            {todos.length > 0 && (
              <Botao variante="contorno" className="px-3 py-1.5 text-sm" title="Baixar todas as provas para o calendário do celular" onClick={() => baixarArquivo(gerarIcs(todos.map((e) => ({ ...e, materia: e.materia?.nome })), nomeSala), `${nomeSala}.ics`)}>
                📲 Exportar
              </Botao>
            )}
          </div>
        </div>

        {eventos.isPending && <p className="text-zinc-500">Carregando…</p>}
        <Erro erro={eventos.error ?? apagar.error ?? alternar.error} />
        {eventos.data && visiveis.length === 0 && (
          <Vazio icone={filtro === 'feitos' ? '🏁' : '🎉'} titulo={filtro === 'feitos' ? 'Nada marcado como feito ainda' : 'Nenhuma prova ou entrega por aqui'}>
            {filtro === 'pendentes' && 'Adicione a próxima prova no formulário acima.'}
          </Vazio>
        )}
        <ul className="space-y-4">
          {visiveis.map((ev, i) => (
            <li key={ev.id} className="entrar-3d" style={atraso(i)}>
              <CardEvento
                evento={ev}
                agora={agora}
                nomeSala={nomeSala}
                feito={feitos.has(ev.id)}
                podeApagar={lider || ev.criado_por === euId}
                aoAlternarFeito={() => alternar.mutate({ eventoId: ev.id, feito: !feitos.has(ev.id) })}
                aoApagar={() => confirm(`Apagar "${ev.titulo}" para toda a sala?`) && apagar.mutate(ev.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function NovoEventoForm({ salaId }: { salaId: string }) {
  const criar = useCriarEvento()
  const materias = useMaterias(salaId)
  const [aberto, setAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<Enums<'tipo_evento'>>('prova')
  const [materiaId, setMateriaId] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [descricao, setDescricao] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    await criar.mutateAsync({ salaId, titulo, tipo, prazo: deCampos(data, hora || undefined), materiaId: materiaId || null, descricao })
    setTitulo('')
    setData('')
    setHora('')
    setDescricao('')
    setAberto(false)
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="vidro entrar-3d flex w-full items-center justify-center gap-2 rounded-2xl border-dashed p-4 text-zinc-300 transition hover:border-indigo-400/50 hover:text-white" style={atraso(2)}>
        <span className="text-xl">＋</span> Adicionar prova, entrega ou apresentação
      </button>
    )
  }

  return (
    <Cartao className="entrar-3d">
      <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="O que é" placeholder="P1 — capítulos 1 a 4" value={titulo} onChange={(e) => setTitulo(e.target.value)} required autoFocus className="sm:col-span-2" />
        <Seletor rotulo="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as Enums<'tipo_evento'>)}>
          {Object.entries(rotulosTipo).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </Seletor>
        <Seletor rotulo="Matéria" value={materiaId} onChange={(e) => setMateriaId(e.target.value)}>
          <option value="">Sem matéria</option>
          {materias.data?.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </Seletor>
        <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        <Campo rotulo="Hora (opcional)" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        <div className="sm:col-span-2">
          <AreaTexto rotulo="Detalhes (opcional)" placeholder="O que cai, onde entregar, em dupla…" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div className="sm:col-span-2"><Erro erro={criar.error} /></div>
        <div className="flex gap-2 sm:col-span-2">
          <Botao type="submit" disabled={criar.isPending} className="flex-1">{criar.isPending ? 'Salvando…' : 'Adicionar'}</Botao>
          <Botao type="button" variante="fantasma" onClick={() => setAberto(false)}>Cancelar</Botao>
        </div>
      </form>
    </Cartao>
  )
}
