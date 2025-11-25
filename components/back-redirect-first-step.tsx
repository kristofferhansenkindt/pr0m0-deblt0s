"use client"

import { motion } from "framer-motion"
import { useBackRedirect } from "./back-redirect-provider"
import { Header } from "./header"
import { SecurityBadge } from "./security-badge"

export function BackRedirectFirstStep() {
  const { hideBackRedirect, userData } = useBackRedirect()

  const prosseguirConsulta = () => {
    hideBackRedirect()
    // Fecha o modal e permite que o usuário continue na página de placa
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          className="bg-white p-6 rounded-sm border-2 border-[#D4000F] shadow-lg mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start mb-4">
            <div className="bg-[#D4000F] rounded-full p-2 mr-4 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#D4000F] mb-2">ALERTA: RESTRIÇÕES NO CPF IMINENTES</h2>
              <p className="text-[#333333] mb-2">
                Identificamos que você está tentando sair sem consultar os débitos do seu veículo. É importante alertar
                que débitos não regularizados podem resultar em restrições graves ao seu CPF.
              </p>
            </div>
          </div>

          {userData && (
            <div className="bg-[#F0F8FF] p-4 mb-6 border border-[#1351B4] rounded-sm">
              <h3 className="text-base font-bold text-[#071D41] mb-3">Seus Dados:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#555555]">Nome Completo:</p>
                  <p className="text-sm font-medium text-[#333333]">{userData.nome || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">CPF:</p>
                  <p className="text-sm font-medium text-[#333333]">{userData.cpf || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Data de Nascimento:</p>
                  <p className="text-sm font-medium text-[#333333]">{userData.dataNascimento || "Não informado"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#F8F8F8] p-4 mb-6 border border-gray-300 rounded-sm">
            <h3 className="text-base font-bold text-[#071D41] mb-3">Consequências da Não Regularização no seu CPF:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">Inclusão no SERASA e SPC</p>
                  <p className="text-xs text-[#555555]">
                    Seu CPF será negativado nos órgãos de proteção ao crédito, dificultando financiamentos e compras a
                    prazo.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">Bloqueio no CADIN Federal</p>
                  <p className="text-xs text-[#555555]">
                    Cadastro Informativo de Créditos não Quitados impedirá empréstimos e participação em concursos
                    públicos.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">Restrição de Crédito</p>
                  <p className="text-xs text-[#555555]">
                    Impossibilidade de obter cartões de crédito, financiamentos imobiliários e empréstimos bancários.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">Protesto em Cartório</p>
                  <p className="text-xs text-[#555555]">
                    Débitos protestados em cartório vinculados ao seu CPF, gerando mais custas e honorários
                    advocatícios.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">Acúmulo Progressivo de Juros</p>
                  <p className="text-xs text-[#555555]">
                    Os valores aumentarão mensalmente com juros, multas e correção monetária vinculados ao seu CPF.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#E6F2FF] p-4 mb-6 border-l-4 border-[#1351B4] rounded-sm">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#1351B4]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#071D41]">
                  <strong>Oportunidade Única:</strong> Continue a consulta e aproveite o programa de regularização de
                  débitos com até 89% de desconto. Esta é uma chance única de regularizar sua situação e evitar as
                  consequências graves listadas acima.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prosseguirConsulta}
              className="bg-[#1351B4] text-white py-4 px-8 rounded-sm hover:bg-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-bold text-lg"
            >
              CONTINUAR CONSULTA
            </motion.button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-[#555555]">
              Procedimento amparado pela Lei Federal nº 14.999/2023 e Resolução CONTRAN nº 918/2022
            </p>
          </div>
        </motion.div>

        <SecurityBadge />
      </div>
    </div>
  )
}
