"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Eye, MapPin, Clock, MousePointer, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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
  time_on_site?: number
  pages_visited?: number
  last_page_slug?: string
  utm_source?: string
  utm_campaign?: string
  created_at: string
}

interface SessionsTableProps {
  sessions: Session[]
}

export function EnhancedSessionsTable({ sessions }: SessionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStep, setFilterStep] = useState<number | null>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
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

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0s"
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getExitReason = (session: Session) => {
    if (session.completed) return "Concluído com sucesso"
    if (session.current_step === 1) return "Abandonou no login"
    if (session.current_step === 2) return "Abandonou na consulta de placa"
    if (session.current_step === 3) return "Abandonou na visualização de débitos"
    return "Saída não identificada"
  }

  const fetchSessionDetails = async (sessionId: string) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/session-details/${sessionId}`, {
        headers: {
          Authorization: "Bearer admin1234554321",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSessionDetails(data.data)
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da sessão:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session)
    fetchSessionDetails(session.session_id)
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
          <h2 className="text-xl font-bold text-gray-900">Sessões Detalhadas</h2>

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
                Progresso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engajamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campanha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
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
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{session.nome || "Não informado"}</div>
                      <div className="text-sm text-gray-500">
                        {session.cpf
                          ? `CPF: ${session.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}`
                          : "CPF não informado"}
                      </div>
                      {session.placa && <div className="text-xs text-gray-400">Placa: {session.placa}</div>}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStepColor(session.current_step, session.completed)}`}
                      >
                        {session.completed ? "Concluído" : getStepLabel(session.current_step)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${session.completed ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${(session.current_step / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{getExitReason(session)}</div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatTime(session.time_on_site)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <MousePointer className="w-4 h-4 text-gray-400" />
                      <span>{session.pages_visited || 0} páginas</span>
                    </div>
                    {session.last_page_slug && (
                      <div className="text-xs text-gray-500">Saiu em: {session.last_page_slug}</div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {session.utm_source ? (
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {session.utm_source}
                      </Badge>
                      {session.utm_campaign && <div className="text-xs text-gray-500">{session.utm_campaign}</div>}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Tráfego direto</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-900">
                        {session.city && session.country ? `${session.city}, ${session.country}` : "Não identificado"}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{session.ip_address}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(session)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Análise Detalhada da Sessão</DialogTitle>
                        <DialogDescription>
                          Jornada completa do usuário {selectedSession?.nome || "Anônimo"}
                        </DialogDescription>
                      </DialogHeader>

                      {loadingDetails ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        </div>
                      ) : sessionDetails ? (
                        <div className="space-y-6">
                          {/* Resumo da Sessão */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {sessionDetails.session?.current_step || 0}/3
                                </div>
                                <div className="text-sm text-gray-600">Etapas Concluídas</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {formatTime(sessionDetails.session?.time_on_site)}
                                </div>
                                <div className="text-sm text-gray-600">Tempo no Site</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {sessionDetails.pageVisits?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Páginas Visitadas</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                  {sessionDetails.userActions?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Ações Realizadas</div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Funil de Conversão */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Funil de Conversão</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {[
                                  {
                                    step: 1,
                                    label: "Login/Identificação",
                                    completed: sessionDetails.session?.current_step >= 1,
                                  },
                                  {
                                    step: 2,
                                    label: "Consulta de Placa",
                                    completed: sessionDetails.session?.current_step >= 2,
                                  },
                                  {
                                    step: 3,
                                    label: "Visualização de Débitos",
                                    completed: sessionDetails.session?.current_step >= 3,
                                  },
                                  {
                                    step: 4,
                                    label: "Conversão Completa",
                                    completed: sessionDetails.session?.completed,
                                  },
                                ].map((item) => (
                                  <div key={item.step} className="flex items-center space-x-4">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        item.completed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                                      }`}
                                    >
                                      {item.completed ? "✓" : item.step}
                                    </div>
                                    <div className="flex-1">
                                      <div
                                        className={`font-medium ${item.completed ? "text-green-700" : "text-gray-500"}`}
                                      >
                                        {item.label}
                                      </div>
                                      <Progress value={item.completed ? 100 : 0} className="h-2 mt-1" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Timeline de Ações */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Timeline de Ações</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {sessionDetails.userActions?.map((action: any, index: number) => (
                                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{action.action_type}</div>
                                      <div className="text-xs text-gray-600">{action.element_id}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(action.timestamp).toLocaleString("pt-BR")}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Dados da Campanha */}
                          {sessionDetails.session?.utm_source && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Dados da Campanha</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Fonte</label>
                                    <p className="text-gray-900">{sessionDetails.session.utm_source}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Meio</label>
                                    <p className="text-gray-900">{sessionDetails.session.utm_medium || "N/A"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Campanha</label>
                                    <p className="text-gray-900">{sessionDetails.session.utm_campaign || "N/A"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Conteúdo</label>
                                    <p className="text-gray-900">{sessionDetails.session.utm_content || "N/A"}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Não foi possível carregar os detalhes da sessão</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </td>
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
