import { describe, expect, it } from 'vitest'
import { linkConvite, linkWhatsApp, textoConvite } from './convite'

describe('convite', () => {
  it('monta o link com o código, descartando o que vier depois do #', () => {
    expect(linkConvite('K7QX2M', 'https://victin7.github.io/Turma-ADS/#/sala/123')).toBe(
      'https://victin7.github.io/Turma-ADS/#/?codigo=K7QX2M',
    )
  })

  it('só coloca a senha no texto quando o líder escolhe', () => {
    expect(textoConvite('ADS', 'K7QX2M', 'link', 'segredo')).toContain('Senha: *segredo*')
    expect(textoConvite('ADS', 'K7QX2M', 'link')).toContain('pede pro líder')
  })

  it('codifica o texto para o WhatsApp', () => {
    expect(linkWhatsApp('olá mundo')).toBe('https://wa.me/?text=ol%C3%A1%20mundo')
  })
})
