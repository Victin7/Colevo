import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Tilt } from '../../components/Tilt'
import { AreaTexto, atraso, Botao, Campo, Cartao, Erro, PontoCor, Seletor, Vazio } from '../../components/ui'
import type { Enums } from '../../lib/database.types'
import { useMaterias } from '../materias/api'
import { abrirArquivo, TAMANHO_MAXIMO, useApagarMaterial, useCriarMaterial, useCurtir, useMateriais, type Material } from './api'

const icones: Record<Enums<'tipo_material'>, string> = { link: '🔗', arquivo: '📄', nota: '🗒️' }

export function AbaMateriais({ salaId, euId, lider }: { salaId: string; euId?: string; lider: boolean }) {
  const materiais = useMateriais(salaId)
  const materias = useMaterias(salaId)
  const curtir = useCurtir(salaId)
  const apagar = useApagarMaterial(salaId)
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('')
  const [abrindo, setAbrindo] = useState(false)
  const [erroAbrir, setErroAbrir] = useState<unknown>(null)

  // Mais curtidos primeiro; empate = mais novo primeiro (a lista já vem do mais novo)
  const lista = (materiais.data ?? [])
    .filter((m) => !filtro || m.materia_id === filtro)
    .sort((a, b) => b.curtidas.length - a.curtidas.length)

  if (materias.data?.length === 0) {
    return (
      <Vazio icone="📚" titulo="Cadastre as matérias primeiro">
        Os materiais ficam organizados por matéria.{' '}
        <button className="text-indigo-300 underline" onClick={() => navigate({ to: '/sala/$salaId', params: { salaId }, search: { aba: 'materias' } })}>
          Ir para Matérias
        </button>
      </Vazio>
    )
  }

  async function abrir(m: Material) {
    setErroAbrir(null)
    try {
      setAbrindo(true)
      await abrirArquivo(m.arquivo_path!)
    } catch (e) {
      setErroAbrir(e)
    } finally {
      setAbrindo(false)
    }
  }

  return (
    <div className="space-y-6">
      <NovoMaterial salaId={salaId} />
      {abrindo && <p className="text-sm text-zinc-400">Abrindo arquivo…</p>}

      {materias.data && materias.data.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Chip ativo={!filtro} onClick={() => setFiltro('')}>Todas</Chip>
          {materias.data.map((m) => (
            <Chip key={m.id} ativo={filtro === m.id} onClick={() => setFiltro(m.id)} cor={m.cor}>{m.nome}</Chip>
          ))}
        </div>
      )}

      <Erro erro={materiais.error ?? curtir.error ?? apagar.error ?? erroAbrir} />
      {materiais.data && lista.length === 0 && <Vazio icone="🗂️" titulo="Nenhum material ainda">Compartilhe resumos, slides e links úteis com a turma.</Vazio>}

      <ul className="space-y-3">
        {lista.map((m, i) => {
          const curti = !!euId && m.curtidas.includes(euId)
          return (
            <li key={m.id} className="entrar-3d" style={atraso(i)}>
              <Tilt className="rounded-2xl" max={6}>
                <Cartao className="flex gap-3">
                  <span className="profundidade-2 text-3xl">{icones[m.tipo]}</span>
                  <div className="profundidade-1 min-w-0 flex-1">
                    <p className="font-semibold">{m.titulo}</p>
                    <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                      {m.materias && <><PontoCor cor={m.materias.cor} /> <span style={{ color: m.materias.cor }}>{m.materias.nome}</span> ·</>}
                      por {m.autor}
                    </p>
                    {m.tipo === 'nota' && <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{m.conteudo}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      {m.tipo === 'link' && m.url && (
                        <a href={m.url} target="_blank" rel="noreferrer noopener" className="text-indigo-300 hover:underline">Abrir link ↗</a>
                      )}
                      {m.tipo === 'arquivo' && m.arquivo_path && (
                        <button onClick={() => abrir(m)} className="text-indigo-300 hover:underline">Abrir arquivo ↗</button>
                      )}
                      <button
                        onClick={() => curtir.mutate({ materialId: m.id, curtir: !curti })}
                        aria-pressed={curti}
                        className={`rounded-full px-2.5 py-0.5 text-xs transition ${curti ? 'bg-fuchsia-400/20 text-fuchsia-300' : 'bg-white/5 text-zinc-400 hover:text-fuchsia-300'}`}
                      >
                        {curti ? '💜' : '🤍'} {m.curtidas.length}
                      </button>
                      {(lider || m.criado_por === euId) && (
                        <button onClick={() => confirm(`Apagar "${m.titulo}"?`) && apagar.mutate(m)} className="text-xs text-zinc-500 hover:text-red-300">🗑 Apagar</button>
                      )}
                    </div>
                  </div>
                </Cartao>
              </Tilt>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Chip({ ativo, onClick, cor, children }: { ativo: boolean; onClick: () => void; cor?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${ativo ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-zinc-400 hover:text-zinc-200'}`}
    >
      {cor && <PontoCor cor={cor} />} {children}
    </button>
  )
}

function NovoMaterial({ salaId }: { salaId: string }) {
  const criar = useCriarMaterial(salaId)
  const materias = useMaterias(salaId)
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState<Enums<'tipo_material'>>('link')
  const [materiaId, setMateriaId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [url, setUrl] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [arquivo, setArquivo] = useState<File | undefined>()

  async function enviar(e: FormEvent) {
    e.preventDefault()
    await criar.mutateAsync({ materiaId: materiaId || materias.data![0].id, tipo, titulo, url, conteudo, arquivo })
    setTitulo('')
    setUrl('')
    setConteudo('')
    setArquivo(undefined)
    setAberto(false)
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="vidro entrar-3d flex w-full items-center justify-center gap-2 rounded-2xl border-dashed p-4 text-zinc-300 transition hover:border-indigo-400/50 hover:text-white">
        <span className="text-xl">＋</span> Compartilhar material
      </button>
    )
  }

  return (
    <Cartao className="entrar-3d">
      <form onSubmit={enviar} className="space-y-3">
        <div className="flex rounded-lg border border-white/10 p-0.5 text-sm" role="radiogroup" aria-label="Tipo de material">
          {(['link', 'arquivo', 'nota'] as const).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={tipo === t} onClick={() => setTipo(t)} className={`flex-1 rounded-md px-3 py-1.5 capitalize transition ${tipo === t ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
              {icones[t]} {t}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Título" placeholder="Resumo da aula 3" value={titulo} onChange={(e) => setTitulo(e.target.value)} required autoFocus />
          <Seletor rotulo="Matéria" value={materiaId} onChange={(e) => setMateriaId(e.target.value)}>
            {materias.data?.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </Seletor>
        </div>
        {tipo === 'link' && <Campo rotulo="Link" type="text" inputMode="url" placeholder="youtube.com/…" value={url} onChange={(e) => setUrl(e.target.value)} required />}
        {tipo === 'nota' && <AreaTexto rotulo="Anotação" placeholder="Fórmulas, dicas, o que o professor falou…" value={conteudo} onChange={(e) => setConteudo(e.target.value)} required />}
        {tipo === 'arquivo' && (
          <label className="block space-y-1">
            <span className="text-sm text-zinc-400">Arquivo (PDF, imagem, Word ou PowerPoint — até {TAMANHO_MAXIMO / 1024 / 1024} MB)</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx"
              onChange={(e) => setArquivo(e.target.files?.[0])}
              required
              className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-zinc-100"
            />
          </label>
        )}
        <Erro erro={criar.error} />
        <div className="flex gap-2">
          <Botao type="submit" disabled={criar.isPending} className="flex-1">{criar.isPending ? 'Enviando…' : 'Compartilhar'}</Botao>
          <Botao type="button" variante="fantasma" onClick={() => setAberto(false)}>Cancelar</Botao>
        </div>
      </form>
    </Cartao>
  )
}
