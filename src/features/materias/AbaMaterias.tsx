import { useState, type FormEvent } from 'react'
import { Tilt } from '../../components/Tilt'
import { atraso, Botao, Campo, Cartao, Erro, Vazio } from '../../components/ui'
import { useEventos } from '../eventos/api'
import { CORES_MATERIA, useApagarMateria, useCriarMateria, useEditarMateria, useMaterias } from './api'

type Edicao = { id?: string; nome: string; professor: string; cor: string }

export function AbaMaterias({ salaId }: { salaId: string }) {
  const materias = useMaterias(salaId)
  const eventos = useEventos(salaId)
  const apagar = useApagarMateria(salaId)
  const [edicao, setEdicao] = useState<Edicao | null>(null)

  const proximas = (id: string) => (eventos.data ?? []).filter((e) => e.materia_id === id && e.prazo > new Date()).length

  return (
    <div className="space-y-6">
      {edicao ? (
        <FormMateria salaId={salaId} inicial={edicao} aoTerminar={() => setEdicao(null)} />
      ) : (
        <button
          onClick={() => setEdicao({ nome: '', professor: '', cor: CORES_MATERIA[(materias.data?.length ?? 0) % CORES_MATERIA.length] })}
          className="vidro entrar-3d flex w-full items-center justify-center gap-2 rounded-2xl border-dashed p-4 text-zinc-300 transition hover:border-blue-400/50 hover:text-white"
        >
          <span className="text-xl">＋</span> Nova matéria
        </button>
      )}

      <Erro erro={materias.error ?? apagar.error} />
      {materias.data?.length === 0 && !edicao && (
        <Vazio icone="📚" titulo="Nenhuma matéria ainda">Cadastre as matérias do semestre com o nome do professor e uma cor.</Vazio>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {materias.data?.map((m, i) => (
          <li key={m.id} className="entrar-3d" style={atraso(i)}>
            <Tilt className="rounded-2xl">
              <Cartao className="relative overflow-hidden">
                {/* faixa de cor da matéria, em profundidade */}
                <div className="profundidade-1 absolute inset-y-0 left-0 w-1.5" style={{ background: m.cor, boxShadow: `0 0 20px ${m.cor}` }} />
                <div className="pl-3">
                  <p className="profundidade-1 text-lg font-bold" style={{ color: m.cor }}>{m.nome}</p>
                  <p className="text-sm text-zinc-400">{m.professor ? `👤 ${m.professor}` : 'Professor não informado'}</p>
                  <p className="mt-2 text-xs text-zinc-500">{proximas(m.id)} {proximas(m.id) === 1 ? 'prova/entrega chegando' : 'provas/entregas chegando'}</p>
                  <div className="mt-3 flex gap-3 text-xs">
                    <button className="text-zinc-400 hover:text-blue-300" onClick={() => setEdicao({ id: m.id, nome: m.nome, professor: m.professor ?? '', cor: m.cor })}>✏️ Editar</button>
                    <button
                      className="text-zinc-400 hover:text-red-300"
                      onClick={() => confirm(`Apagar "${m.nome}"? As provas continuam, mas os materiais desta matéria serão apagados.`) && apagar.mutate(m.id)}
                    >
                      🗑 Apagar
                    </button>
                  </div>
                </div>
              </Cartao>
            </Tilt>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FormMateria({ salaId, inicial, aoTerminar }: { salaId: string; inicial: Edicao; aoTerminar: () => void }) {
  const criar = useCriarMateria(salaId)
  const editar = useEditarMateria(salaId)
  const [m, setM] = useState(inicial)
  const salvando = criar.isPending || editar.isPending

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (m.id) await editar.mutateAsync({ ...m, id: m.id })
    else await criar.mutateAsync(m)
    aoTerminar()
  }

  return (
    <Cartao className="entrar-3d">
      <form onSubmit={enviar} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Matéria" placeholder="Modelagem de Banco de Dados" maxLength={60} value={m.nome} onChange={(e) => setM({ ...m, nome: e.target.value })} required autoFocus />
          <Campo rotulo="Professor(a)" placeholder="Prof. Andrea" value={m.professor} onChange={(e) => setM({ ...m, professor: e.target.value })} />
        </div>
        <fieldset>
          <legend className="mb-1 text-sm text-zinc-400">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {CORES_MATERIA.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => setM({ ...m, cor })}
                aria-label={`Cor ${cor}`}
                aria-pressed={m.cor === cor}
                className={`size-8 rounded-lg transition ${m.cor === cor ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-105'}`}
                style={{ background: cor, boxShadow: `0 4px 14px -4px ${cor}` }}
              />
            ))}
          </div>
        </fieldset>
        <Erro erro={criar.error ?? editar.error} />
        <div className="flex gap-2">
          <Botao type="submit" disabled={salvando} className="flex-1">{salvando ? 'Salvando…' : m.id ? 'Salvar' : 'Adicionar matéria'}</Botao>
          <Botao type="button" variante="fantasma" onClick={aoTerminar}>Cancelar</Botao>
        </div>
      </form>
    </Cartao>
  )
}
