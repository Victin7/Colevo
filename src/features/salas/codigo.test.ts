import { describe, expect, it } from 'vitest'
import { codigoValido, normalizarCodigo } from './codigo'

describe('normalizarCodigo', () => {
  it('aceita o código do jeito que o colega mandar no WhatsApp', () => {
    expect(normalizarCodigo(' k7qx2m ')).toBe('K7QX2M')
    expect(normalizarCodigo('k7q-x2m')).toBe('K7QX2M')
    expect(normalizarCodigo('K7 QX 2M')).toBe('K7QX2M')
  })
})

describe('codigoValido', () => {
  it('valida o formato antes de ir ao servidor', () => {
    expect(codigoValido('k7qx2m')).toBe(true)
    expect(codigoValido('A1B2C3')).toBe(true)    // salas antigas (hexadecimal)
    expect(codigoValido('K7QX2')).toBe(false)    // curto
    expect(codigoValido('K7QX2MZ')).toBe(false)  // longo
    expect(codigoValido('K7QX2!')).toBe(false)   // caractere inválido
  })
})
