// Função para aplicar máscara de CPF
export function cpfMask(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

// Função para validar CPF
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, "")

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  let digit = remainder > 9 ? 0 : remainder

  if (Number.parseInt(cpf.charAt(9)) !== digit) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  digit = remainder > 9 ? 0 : remainder

  if (Number.parseInt(cpf.charAt(10)) !== digit) return false

  return true
}

// Função para aplicar máscara de placa
export function placaMask(value: string): string {
  // Remove caracteres não alfanuméricos e converte para maiúsculas
  value = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()

  // Verifica se é uma placa no formato Mercosul (ABC1D23)
  if (value.length >= 4 && /[A-Z]/.test(value.charAt(3))) {
    return value
      .replace(/([A-Z]{3})([0-9])([A-Z])([0-9]{2}).*/, "$1$2$3$4")
      .replace(/([A-Z]{3})([0-9])([A-Z])?/, "$1-$2$3")
  }

  // Formato antigo (ABC1234)
  return value.replace(/([A-Z]{3})([0-9]{4}).*/, "$1$2").replace(/([A-Z]{3})([0-9]{1,4})?/, "$1-$2")
}

// Função para validar placa
export function validatePlaca(placa: string): boolean {
  // Remove caracteres não alfanuméricos
  placa = placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()

  // Verifica se é uma placa no formato antigo (ABC1234)
  const regexPlacaAntiga = /^[A-Z]{3}[0-9]{4}$/

  // Verifica se é uma placa no formato Mercosul (ABC1D23)
  const regexPlacaNova = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/

  return regexPlacaAntiga.test(placa) || regexPlacaNova.test(placa)
}

// Função para aplicar máscara de RENAVAM
export function renavamMask(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{4})(\d)/, "$1.$2")
    .replace(/(\d{4})(\d)/, "$1.$2")
    .replace(/(\d{4})(\d{3})/, "$1.$2")
    .replace(/(\.\d{3})\d+?$/, "$1")
}

// Função para validar RENAVAM
export function validateRenavam(renavam: string): boolean {
  // Remove caracteres não numéricos
  renavam = renavam.replace(/\D/g, "")

  // Verifica se tem 11 dígitos
  if (renavam.length !== 11) return false

  // Verifica se todos os dígitos são iguais (caso inválido comum)
  if (/^(\d)\1+$/.test(renavam)) return false

  // Algoritmo de validação do RENAVAM
  const renavamSemDigito = renavam.substring(0, 10)
  const digito = Number.parseInt(renavam.substring(10, 11))

  const pesos = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0

  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(renavamSemDigito.charAt(i)) * pesos[i]
  }

  const mod11 = soma % 11
  const calculado = mod11 === 10 ? 0 : mod11

  return digito === calculado
}
