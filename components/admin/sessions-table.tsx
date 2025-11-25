"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface Session {
  id: number
  session_id: string
  nome?: string
  cpf?: string
  placa?: string
  modelo?: string
  marca?: string
  ip_address: string
  country?: string
  city?: string
  current_step: number
  completed: boolean
  created_at: string
}

interface SessionsTableProps {
  sessions: Session[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStep, setFilterStep] = useState<number | null>(null)
  const itemsPerPage = 20

  // Filtrar sessões
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      !searchTerm ||
      session.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.cpf?.includes(searchTerm) ||
      session.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip_address.includes(searchTerm)

    const matchesStep = filterStep === null || session.current_step === filterStep

    return matchesSearch && matchesStep
  })

  // Paginação
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage)

  const getStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return "Login"
      case 2:
        return "Placa"
      case 3:
        return "Débitos"
      case 4:
        return "Concluído"
      default:
        return "Desconhecido"
    }
  }

  const getStepColor = (step: number, completed: boolean) => {
    if (completed) return "bg-green-100 text-green-800"
    switch (step) {
      case 1:
        return "bg-gray-100 text-gray-800"
      case 2:
        return "bg-blue-100 text-blue-800"
      case 3:
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Sessões Recentes</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, CPF, placa ou IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1351B4] w-full md:w-64"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              value={filterStep || ""}
              onChange={(e) => setFilterStep(e.target.value ? Number.parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
            >
              <option value="">Todos os steps</option>
              <option value="1">Login</option>
              <option value="2">Placa</option>
              <option value="3">Débitos</option>
              <option value="4">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSessions.map((session, index) => (
              <motion.tr
                key={session.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{session.nome || "Não informado"}</div>
                    <div className="text-sm text-gray-500">
                      {session.cpf
                        ? `CPF: ${session.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}`
                        : "CPF não informado"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{session.placa || "Não informado"}</div>
                    <div className="text-sm text-gray-500">
                      {session.marca && session.modelo ? `${session.marca} ${session.modelo}` : "Modelo não informado"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {session.city && session.country ? `${session.city}, ${session.country}` : "Não identificado"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStepColor(session.current_step, session.completed)}`}
                  >
                    {session.completed ? "Concluído" : getStepLabel(session.current_step)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(session.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{session.ip_address}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredSessions.length)} de{" "}
            {filteredSessions.length} resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
