import { describe, expect, it, vi } from 'vitest'

// O módulo importa o cliente do Supabase; nos testes ele não é usado.
vi.mock('../../lib/supabase', () => ({ supabase: {} }))
const { codigoNoEndereco, enderecoDeRetorno, nomeDoUsuario } = await import('./loginGoogle')

describe('login com Google', () => {
  it('volta para a raiz do app, sem o #', () => {
    expect(enderecoDeRetorno({ origin: 'https://victin7.github.io', pathname: '/Colevo/' })).toBe('https://victin7.github.io/Colevo/')
  })

  it('reconhece o código de convite no endereço, inclusive como o roteador escreve', () => {
    expect(codigoNoEndereco('#/?codigo=K7QX2M')).toBe('K7QX2M')
    expect(codigoNoEndereco('#/?codigo=%22K7QX2M%22')).toBe('K7QX2M')
    expect(codigoNoEndereco('#/sala/123')).toBeNull()
  })

  it('usa o nome do cadastro, senão o da conta Google, senão o começo do e-mail', () => {
    expect(nomeDoUsuario({ nome: 'Victin' }, 'v@x.com')).toBe('Victin')
    expect(nomeDoUsuario({ full_name: 'Victor Anjos' }, 'v@x.com')).toBe('Victor Anjos')
    expect(nomeDoUsuario({}, 'victor.anjos@gmail.com')).toBe('victor.anjos')
  })
})
