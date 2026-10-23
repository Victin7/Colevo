/** "2026-11-10" + "19:30" → Date no horário local. Sem hora = 23:59 (vale o dia todo). */
export function deCampos(data: string, hora?: string): Date {
  const [a, m, d] = data.split('-').map(Number)
  const [h, min] = hora ? hora.split(':').map(Number) : [23, 59]
  return new Date(a, m - 1, d, h, min)
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** Date → "2026-11-10" no horário local (para <input type="date">). */
export function paraCampoData(d: Date): string {
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}

/** true quando o prazo é o "fim do dia" padrão (não mostra hora). */
export function semHora(d: Date): boolean {
  return d.getHours() === 23 && d.getMinutes() === 59
}

export function horaCurta(d: Date): string {
  return `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
}

export function mesmoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
