export const formatPrice = (value: string) => {
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  const numericValue = Number(numbers) / 100

  if (Number.isNaN(numericValue)) return ''

  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export const getNumericPrice = (value: string) => {
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return Number.NaN

  return Number(numbers) / 100
}
