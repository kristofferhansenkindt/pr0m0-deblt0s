import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCpf(cpf: string): string {
  if (!cpf) return ""

  // Remove todos os caracteres não numéricos
  const cleanCpf = cpf.replace(/\D/g, "")

  // Aplica a máscara XXX.XXX.XXX-XX
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}
