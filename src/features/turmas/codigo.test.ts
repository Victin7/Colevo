import { describe, expect, it } from 'vitest'
import { codigoValido, normalizarCodigo } from './codigo'

describe('normalizarCodigo', () => {
  it('aceita o código do jeito que o colega mandar no WhatsApp', () => {
    expect(normalizarCodigo(' a1b2c3 ')).toBe('A1B2C3')
    expect(normalizarCodigo('a1b-2c3')).toBe('A1B2C3')
    expect(normalizarCodigo('A1 B2 C3')).toBe('A1B2C3')
  })
})

describe('codigoValido', () => {
  it('valida formato antes de ir ao servidor', () => {
    expect(codigoValido('a1b2c3')).toBe(true)
    expect(codigoValido('A1B2C')).toBe(false)     // curto
    expect(codigoValido('A1B2C3D')).toBe(false)   // longo
    expect(codigoValido('ZZZZZZ')).toBe(false)    // fora do hexadecimal
  })
})
