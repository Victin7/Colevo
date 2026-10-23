import { describe, expect, it } from 'vitest'
import { nomeSeguro } from './api'

describe('nomeSeguro', () => {
  it('remove acentos, espaços e símbolos mantendo a extensão', () => {
    expect(nomeSeguro('Resumo Modelagem — Aula 3 (versão final).PDF')).toBe('resumo-modelagem-aula-3-versao-final.pdf')
  })
  it('lida com nome só de símbolos', () => {
    expect(nomeSeguro('###.png')).toBe('arquivo.png')
  })
})
