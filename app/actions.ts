"use server"

// Função para simular um atraso de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Interface flexível para a resposta da API de CPF
interface CPFResponse {
  [key: string]: any // Aceita qualquer estrutura
}

interface WorkBuscasResponse {
  status: number
  data: {
    cpf: string
    nome: string
    sexo: string
    nasc: string
    nome_mae: string
    nome_pai: string
    dados_score: any
    escolaridade: any
    parentes: any
    telefones: Array<{
      telefone: string
      nome: string
      operadora: string
    }>
    emails: any
    enderecos: any
    empregos: any[]
    interesses: {
      [key: string]: string
    }
  }
}

// Interface para a resposta da API de Placa
interface PlacaResponse {
  status: boolean
  message: string
  placa: string
  modelo: string
  marca: string
  cor: string
  ano: string
  anoModelo: string
  chassi: string
  renavam: string
  municipio: string
  uf: string
  dataAtualizacaoCaracteristicasVeiculo: string
  dataAtualizacaoRouboFurto: string
  dataAtualizacaoAlarme: string
  situacao: string
  proprietarioNome?: string
  proprietarioCpf?: string
  proprietarioTipo?: string
  proprietarioDataNascimento?: string
  proprietarioEndereco?: string
  proprietarioBairro?: string
  proprietarioCidade?: string
  proprietarioUf?: string
  proprietarioCep?: string
}

interface MagmaDataHubResponse {
  cpf: string
  nome: string
  sexo: string
  nascimento: string
  nome_mae: string
}

function formatarDataNascimento(dataString: string): string {
  if (!dataString) return "Não informado"

  try {
    // Remove escaped slashes if present
    const dataLimpa = dataString.replace(/\\/g, "")

    // Check if it's already in DD/MM/YYYY format
    if (dataLimpa.includes("/")) {
      return dataLimpa
    }

    // Otherwise, convert from YYYY-MM-DD format
    const dataParte = dataLimpa.split(" ")[0]
    const [ano, mes, dia] = dataParte.split("-")
    return `${dia}/${mes}/${ano}`
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return "Não informado"
  }
}

// Função para consultar CPF na API do Hub do Desenvolvedor
export async function consultarCPF(cpf: string, dataNascimento?: string) {
  try {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, "")

    // Verifica se o CPF é válido antes de fazer a requisição
    if (!validarCPF(cpfLimpo)) {
      return {
        success: false,
        error: "CPF inválido",
      }
    }

    const apiUrl = `https://magmadatahub.com/api.php?token=bbb5ae61c582f687adeb6ebad0964ce1a9f6ece8faffd28cce682a2f262dfe67&cpf=${cpfLimpo}`

    console.log("Consultando API MagmaDataHub:", apiUrl)

    // Faz a requisição para a API
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    // Se a resposta não for ok, lança um erro
    if (!response.ok) {
      throw new Error(`Erro na consulta de CPF: ${response.status}`)
    }

    // Converte a resposta para JSON
    const data: MagmaDataHubResponse = await response.json()

    console.log("Resposta da API MagmaDataHub:", JSON.stringify(data, null, 2))

    if (data && data.cpf && data.nome) {
      // Formata a data de nascimento (já vem no formato DD/MM/YYYY)
      const dataFormatada = formatarDataNascimento(data.nascimento)

      console.log("✅ API MagmaDataHub retornou dados válidos")
      return {
        success: true,
        data: {
          nome: data.nome || "",
          cpf: data.cpf || cpfLimpo,
          dataNascimento: dataFormatada,
          situacao: "Regular",
          sexo: data.sexo || "",
          mae: data.nome_mae || "",
          pai: "",
          telefones: [],
          emails: [],
          enderecos: [],
          empregos: [],
          interesses: {},
          dataInscricao: "",
          digitoVerificador: "",
          comprovanteEmitido: "",
          comprovanteEmitidoData: "",
        },
      }
    } else {
      // Se a API não retornou sucesso, usa simulação
      console.warn("⚠️ API MagmaDataHub não retornou dados válidos, usando simulação")
      console.log("Dados recebidos:", data)
      return consultarCPFSimulado(cpfLimpo)
    }
  } catch (error) {
    // Em caso de erro na requisição, usa a simulação
    console.error("❌ Erro ao consultar CPF na API MagmaDataHub:", error)
    const cpfLimpo = cpf.replace(/\D/g, "")
    return consultarCPFSimulado(cpfLimpo)
  }
}

// Função para consultar placa na API
export async function consultarPlaca(placa: string) {
  try {
    // Remove caracteres não alfanuméricos e converte para maiúsculas
    const placaLimpa = placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()

    // URL da API com a placa
    const apiUrl = `https://wdapi2.com.br/consulta/${placaLimpa}/c7f5738ba3901484ddb55aa550f1346b`

    console.log("Consultando API de placa:", apiUrl)

    // Faz a requisição para a API
    const response = await fetch(apiUrl, { cache: "no-store" })

    // Se a resposta não for ok, lança um erro
    if (!response.ok) {
      throw new Error(`Erro na consulta de placa: ${response.status}`)
    }

    // Converte a resposta para JSON
    const data = await response.json()

    console.log("Resposta da API de placa:", data)

    // A API retornou dados, consideramos como sucesso independente do status
    console.log("API retornou dados do veículo com sucesso")
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    // Em caso de erro na requisição, usa a simulação
    console.error("Erro ao consultar placa na API:", error)
    return consultarPlacaSimulada(placa)
  }
}

// Função para simular consulta de placa (fallback)
export async function consultarPlacaSimulada(placa: string) {
  // Simula um atraso de rede reduzido (entre 200ms e 600ms)
  await delay(Math.random() * 400 + 200)

  // Dados simulados do veículo
  const veiculoSimulado = {
    status: true,
    message: "Consulta realizada com sucesso",
    placa: placa.toUpperCase(),
    modelo: "GOL 1.0 FLEX",
    marca: "VW - VOLKSWAGEN",
    cor: "PRATA",
    ano: "2018",
    anoModelo: "2019",
    chassi: "9BWAA05U6AP000123",
    renavam: "00123456789",
    municipio: "SÃO PAULO",
    uf: "SP",
    dataAtualizacaoCaracteristicasVeiculo: "16/05/2025",
    dataAtualizacaoRouboFurto: "16/05/2025",
    dataAtualizacaoAlarme: "16/05/2025",
    situacao: "NORMAL",
    proprietarioNome: "NOME SIMULADO",
    proprietarioCpf: "***.***.***-**",
    proprietarioTipo: "FISICA",
    proprietarioDataNascimento: "**/**/****",
    proprietarioEndereco: "RUA EXEMPLO, 123",
    proprietarioBairro: "CENTRO",
    proprietarioCidade: "SÃO PAULO",
    proprietarioUf: "SP",
    proprietarioCep: "01000-000",
  }

  return {
    success: true,
    data: veiculoSimulado,
  }
}

// Função para simular consulta de CPF (fallback)
export async function consultarCPFSimulado(cpf: string) {
  // Simulação de banco de dados de CPFs com datas de nascimento
  const cpfDatabase = {
    "12345678909": {
      nome: "Maria Silva Santos",
      dataNascimento: "15/05/1985",
      situacao: "Regular",
    },
    "98765432100": {
      nome: "João Pereira da Costa",
      dataNascimento: "22/07/1990",
      situacao: "Regular",
    },
    "11122233344": {
      nome: "Ana Carolina Oliveira",
      dataNascimento: "10/03/1982",
      situacao: "Regular",
    },
    "44433322211": {
      nome: "Pedro Henrique Souza",
      dataNascimento: "05/12/1978",
      situacao: "Regular",
    },
    "55566677788": {
      nome: "Juliana Ferreira Lima",
      dataNascimento: "30/09/1995",
      situacao: "Regular",
    },
    "99988877766": {
      nome: "Carlos Eduardo Almeida",
      dataNascimento: "18/04/1987",
      situacao: "Regular",
    },
    "77788899900": {
      nome: "Fernanda Rodrigues Gomes",
      dataNascimento: "25/11/1992",
      situacao: "Regular",
    },
    "33322211100": {
      nome: "Roberto Martins Ribeiro",
      dataNascimento: "14/08/1975",
      situacao: "Regular",
    },
    "22211133344": {
      nome: "Patrícia Carvalho Mendes",
      dataNascimento: "03/06/1988",
      situacao: "Regular",
    },
    "66677788899": {
      nome: "Lucas Barbosa Teixeira",
      dataNascimento: "27/01/1993",
      situacao: "Regular",
    },
    // CPFs de pessoas famosas (apenas para demonstração)
    "05384585604": {
      nome: "Ayrton Senna da Silva",
      dataNascimento: "21/03/1960",
      situacao: "Regular",
    },
    "01636633883": {
      nome: "Pelé (Edson Arantes do Nascimento)",
      dataNascimento: "23/10/1940",
      situacao: "Regular",
    },
    "18825053153": {
      nome: "Silvio Santos (Senor Abravanel)",
      dataNascimento: "12/12/1930",
      situacao: "Regular",
    },
  }

  // Simula um atraso de rede reduzido (entre 200ms e 600ms)
  await delay(Math.random() * 400 + 200)

  // Verifica se o CPF existe no banco de dados
  if (cpfDatabase[cpf]) {
    return {
      success: true,
      data: cpfDatabase[cpf],
    }
  }

  // Se o CPF não existir no banco de dados, mas for válido, gera um nome aleatório
  if (validarCPF(cpf)) {
    const nomes = [
      "Silva",
      "Santos",
      "Oliveira",
      "Souza",
      "Pereira",
      "Lima",
      "Costa",
      "Rodrigues",
      "Almeida",
      "Nascimento",
    ]
    const sobrenomes = [
      "Ferreira",
      "Ribeiro",
      "Carvalho",
      "Gomes",
      "Martins",
      "Araújo",
      "Barbosa",
      "Cardoso",
      "Teixeira",
      "Moreira",
    ]
    const primeirosNomes = [
      "Maria",
      "João",
      "Ana",
      "Pedro",
      "Juliana",
      "Carlos",
      "Fernanda",
      "Roberto",
      "Patrícia",
      "Lucas",
    ]

    const primeiroNome = primeirosNomes[Math.floor(Math.random() * primeirosNomes.length)]
    const nome = nomes[Math.floor(Math.random() * nomes.length)]
    const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)]

    // Gera uma data de nascimento aleatória
    const dia = Math.floor(Math.random() * 28) + 1
    const mes = Math.floor(Math.random() * 12) + 1
    const ano = Math.floor(Math.random() * 40) + 1960

    return {
      success: true,
      data: {
        nome: `${primeiroNome} ${nome} ${sobrenome}`,
        dataNascimento: `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}/${ano}`,
        situacao: "Regular",
      },
    }
  }

  // Se o CPF não for válido, retorna erro
  return {
    success: false,
    error: "CPF não encontrado ou inválido",
  }
}

// Função para validar CPF
function validarCPF(cpf: string): boolean {
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
  const remainder1 = 11 - (sum % 11)
  const digit1 = remainder1 > 9 ? 0 : remainder1

  if (Number.parseInt(cpf.charAt(9)) !== digit1) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  const remainder2 = 11 - (sum % 11)
  const digit2 = remainder2 > 9 ? 0 : remainder2

  if (Number.parseInt(cpf.charAt(10)) !== digit2) return false

  return true
}

// Função para consultar CEP na API ViaCEP
export async function consultarCEP(cep: string) {
  try {
    const cepLimpo = cep.replace(/\D/g, "")

    if (cepLimpo.length !== 8) {
      return {
        success: false,
        error: "CEP inválido",
      }
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Erro ao consultar CEP")
    }

    const data = await response.json()

    if (data.erro) {
      return {
        success: false,
        error: "CEP não encontrado",
      }
    }

    return {
      success: true,
      data: {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
      },
    }
  } catch (error) {
    console.error("Erro ao consultar CEP:", error)
    return {
      success: false,
      error: "Erro ao consultar CEP",
    }
  }
}
