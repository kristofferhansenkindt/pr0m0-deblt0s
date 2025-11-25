"use client"

import { useState } from "react"
import {
  BarChart3,
  Users,
  Car,
  CreditCard,
  Activity,
  LogOut,
  RefreshCw,
  Home,
  Eye,
  Search,
  Filter,
  Download,
  TrendingUp,
  Database,
  Menu,
  X,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { EnhancedSessionsTable } from "./enhanced-sessions-table"
import { EnhancedCampaignsTab } from "./enhanced-campaigns-tab"
import { GeographicMap } from "./geographic-map"

interface AdminDashboardProps {
  dashboardData: any
  loading: boolean
  apiError: string | null
  lastUpdate: Date | null
  onRefresh: () => void
  onLogout: () => void
}

export function AdminDashboard({
  dashboardData,
  loading: initialLoading,
  apiError,
  lastUpdate,
  onRefresh,
  onLogout,
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Função para extrair TODOS os dados das APIs dinamicamente
  const extractAllApiData = (session: any) => {
    const allData: any = {}
    Object.keys(session).forEach((key) => {
      if (session[key] !== null && session[key] !== undefined && session[key] !== "") {
        allData[key] = session[key]
      }
    })
    return allData
  }

  // Processar usuários (apenas com CPF válido)
  const processedUsers = () => {
    if (!dashboardData?.recentSessions) return []

    const userMap = new Map()

    dashboardData.recentSessions.forEach((session: any) => {
      if (!session.cpf || session.cpf === "CPF não informado" || session.cpf.length < 11) return

      const allApiData = extractAllApiData(session)
      const userId = session.cpf

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...allApiData,
          displayData: {
            nome: session.nome || session.name || session.full_name || "Nome não informado",
            cpf: session.cpf,
            data_nascimento: session.data_nascimento || session.nascimento || session.birth_date,
            idade: session.idade || session.age,
            rg: session.rg || session.identity,
            endereco: session.endereco || session.address,
            cidade: session.cidade || session.city_name || session.city,
            uf: session.uf || session.state,
            telefone: session.telefone || session.phone,
            email: session.email,
            ip_address: session.ip_address || session.ip,
            country: session.country,
            session_id: session.session_id,
            created_at: session.created_at,
            completed: session.completed,
          },
          sessions: [session],
          vehicles: [],
          debitos: [],
          rawApiData: [allApiData],
          totalSessions: 1,
          lastAccess: session.created_at,
          firstAccess: session.created_at,
        })
      } else {
        const user = userMap.get(userId)
        user.sessions.push(session)
        user.rawApiData.push(allApiData)
        user.totalSessions++

        if (new Date(session.created_at) > new Date(user.lastAccess)) {
          user.lastAccess = session.created_at
          Object.assign(user.displayData, extractAllApiData(session))
        }
        if (new Date(session.created_at) < new Date(user.firstAccess)) {
          user.firstAccess = session.created_at
        }
      }

      const user = userMap.get(userId)
      if (session.placa && !user.vehicles.find((v: any) => v.placa === session.placa)) {
        user.vehicles.push(extractAllApiData(session))
      }

      if (session.debitos && Array.isArray(session.debitos)) {
        user.debitos = [...user.debitos, ...session.debitos]
      } else if (session.debito) {
        user.debitos.push(session.debito)
      }
    })

    return Array.from(userMap.values())
  }

  // Processar veículos (apenas consultados)
  const processedVehicles = () => {
    if (!dashboardData?.recentSessions) return []

    const vehicleMap = new Map()

    dashboardData.recentSessions.forEach((session: any) => {
      if (!session.placa || session.placa.length < 7) return

      const vehicleId = session.placa
      if (!vehicleMap.has(vehicleId)) {
        const allApiData = extractAllApiData(session)
        vehicleMap.set(vehicleId, {
          ...allApiData,
          rawApiData: [allApiData],
          sessions: [session],
          consultCount: 1,
        })
      } else {
        const vehicle = vehicleMap.get(vehicleId)
        vehicle.sessions.push(session)
        vehicle.rawApiData.push(extractAllApiData(session))
        vehicle.consultCount++
        Object.assign(vehicle, extractAllApiData(session))
      }
    })

    return Array.from(vehicleMap.values())
  }

  const users = processedUsers()
  const vehicles = processedVehicles()

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.displayData.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayData.cpf?.includes(searchTerm) ||
      user.vehicles?.some((v: any) => v.placa?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "completed" && user.displayData.completed) ||
      (filterStatus === "active" && !user.displayData.completed) ||
      (filterStatus === "with_vehicles" && user.vehicles?.length > 0) ||
      (filterStatus === "with_debts" && user.debitos?.length > 0)

    return matchesSearch && matchesFilter
  })

  const menuItems = [
    { id: "overview", label: "Visão Geral", icon: Home, count: null },
    { id: "users", label: "Usuários", icon: Users, count: users.length },
    { id: "vehicles", label: "Veículos", icon: Car, count: vehicles.length },
    { id: "campaigns", label: "Campanhas", icon: TrendingUp, count: null },
    { id: "sessions", label: "Sessões", icon: Activity, count: dashboardData?.stats?.totalSessions || 0 },
    { id: "geographic", label: "Mapa", icon: MapPin, count: null },
    { id: "raw_data", label: "Dados Brutos", icon: Database, count: null },
  ]

  const formatCpf = (cpf: string) => {
    if (!cpf || cpf === "CPF não informado") return cpf
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatDate = (date: string) => {
    if (!date) return "Não informado"
    return new Date(date).toLocaleString("pt-BR")
  }

  const formatDateOnly = (date: string) => {
    if (!date) return "Não informado"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando dados...</p>
          </div>
        </div>
      )
    }

    if (apiError) {
      return (
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erro no Sistema</h3>
            <p className="text-red-700 mb-6">{apiError}</p>
            <Button onClick={onRefresh} variant="destructive">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total de Usuários",
                  value: users.length.toLocaleString(),
                  description: "Usuários com CPF válido",
                  icon: Users,
                },
                {
                  title: "Veículos Consultados",
                  value: vehicles.length.toLocaleString(),
                  description: "Consultas realizadas",
                  icon: Car,
                },
                {
                  title: "Débitos Encontrados",
                  value: vehicles.filter((v) => v.debitos?.length > 0).length.toString(),
                  description: "Veículos com pendências",
                  icon: CreditCard,
                },
                {
                  title: "Sessões Ativas",
                  value: (dashboardData?.stats?.totalSessions || 0).toLocaleString(),
                  description: "Total de acessos",
                  icon: Activity,
                },
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                          <p className="text-xs text-slate-500">{stat.description}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-slate-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações no sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {users.slice(0, 5).map((user: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{user.displayData.nome}</p>
                        <p className="text-sm text-slate-500">
                          {user.vehicles?.length > 0
                            ? `Consultou ${user.vehicles.length} veículo(s)`
                            : "Iniciou sessão"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          {new Date(user.lastAccess).toLocaleTimeString("pt-BR")}
                        </p>
                        <Badge variant={user.displayData.completed ? "default" : "secondary"} className="text-xs">
                          {user.displayData.completed ? "Completo" : "Ativo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Distribuição Geográfica</CardTitle>
                  <CardDescription>Origem dos acessos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.sessionsByCountry?.slice(0, 6).map((country: any, index: number) => {
                    const percentage =
                      dashboardData?.stats?.totalSessions > 0
                        ? ((country.count / dashboardData.stats.totalSessions) * 100).toFixed(1)
                        : "0.0"

                    return (
                      <div
                        key={country.country}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                          <span className="font-medium text-slate-700">{country.country || "Não identificado"}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-slate-600">{country.count}</span>
                          <Badge variant="outline" className="text-xs">
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "users":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Usuários Cadastrados</h2>
                <p className="text-slate-600">Gerenciar usuários com CPF válido</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  {filteredUsers.length} usuários
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input
                        placeholder="Buscar por nome, CPF ou placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrar por..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Completos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="with_vehicles">Com Veículos</SelectItem>
                      <SelectItem value="with_debts">Com Débitos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="font-semibold">Usuário</TableHead>
                    <TableHead className="font-semibold">Documentação</TableHead>
                    <TableHead className="font-semibold">Localização</TableHead>
                    <TableHead className="font-semibold">Veículos</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any, index: number) => (
                    <TableRow key={user.displayData.cpf || index} className="border-b">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.displayData.nome}</p>
                            {user.displayData.data_nascimento && (
                              <p className="text-sm text-slate-500">
                                {formatDateOnly(user.displayData.data_nascimento)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{formatCpf(user.displayData.cpf)}</p>
                          {user.displayData.rg && <p className="text-sm text-slate-600">RG: {user.displayData.rg}</p>}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 font-mono">{user.displayData.ip_address || "N/A"}</p>
                          {user.displayData.cidade && (
                            <p className="text-sm text-slate-500">
                              {user.displayData.cidade}, {user.displayData.country}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {user.vehicles?.length > 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {user.vehicles.length} veículo(s)
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Nenhum</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant={user.displayData.completed ? "default" : "secondary"}>
                          {user.displayData.completed ? "Completo" : "Em andamento"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Dados Completos - {selectedUser?.displayData.nome}</DialogTitle>
                              <DialogDescription>Informações detalhadas do usuário</DialogDescription>
                            </DialogHeader>

                            {selectedUser && (
                              <div className="space-y-6">
                                {/* Dados Pessoais */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-slate-600">Nome Completo</label>
                                      <p className="text-slate-900">{selectedUser.displayData.nome}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-600">CPF</label>
                                      <p className="text-slate-900">{formatCpf(selectedUser.displayData.cpf)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-600">Data de Nascimento</label>
                                      <p className="text-slate-900">
                                        {formatDateOnly(selectedUser.displayData.data_nascimento)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-600">RG</label>
                                      <p className="text-slate-900">{selectedUser.displayData.rg || "Não informado"}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Dados Brutos */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Dados Brutos das APIs</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="max-h-96 overflow-y-auto">
                                      <pre className="text-xs bg-slate-100 p-4 rounded-lg overflow-x-auto">
                                        {JSON.stringify(selectedUser.rawApiData, null, 2)}
                                      </pre>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">Nenhum usuário encontrado</p>
                  <p className="text-slate-500">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </Card>
          </div>
        )

      case "vehicles":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Veículos Consultados</h2>
                <p className="text-slate-600">Veículos com consultas realizadas</p>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {vehicles.length} veículos
              </Badge>
            </div>

            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificação</TableHead>
                    <TableHead>Especificações</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Consultas</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle: any, index: number) => (
                    <TableRow key={vehicle.placa || index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Car className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{vehicle.placa}</p>
                            {vehicle.renavam && <p className="text-sm text-slate-500">RENAVAM: {vehicle.renavam}</p>}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {vehicle.marca} {vehicle.modelo}
                          </p>
                          {vehicle.cor && <p className="text-sm text-slate-500">Cor: {vehicle.cor}</p>}
                          {vehicle.ano_fabricacao && (
                            <p className="text-sm text-slate-500">Ano: {vehicle.ano_fabricacao}</p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          {vehicle.proprietario_nome && (
                            <p className="font-medium text-slate-900">{vehicle.proprietario_nome}</p>
                          )}
                          {vehicle.proprietario_cpf && (
                            <p className="text-sm text-slate-500">{formatCpf(vehicle.proprietario_cpf)}</p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{vehicle.consultCount} consulta(s)</Badge>
                      </TableCell>

                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(vehicle)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Dados Completos - {selectedVehicle?.placa}</DialogTitle>
                              <DialogDescription>Informações detalhadas do veículo</DialogDescription>
                            </DialogHeader>

                            {selectedVehicle && (
                              <div className="space-y-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Dados Brutos das APIs</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="max-h-96 overflow-y-auto">
                                      <pre className="text-xs bg-slate-100 p-4 rounded-lg overflow-x-auto">
                                        {JSON.stringify(selectedVehicle.rawApiData, null, 2)}
                                      </pre>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )

      case "sessions":
        return (
          <div className="space-y-6">
            <EnhancedSessionsTable sessions={dashboardData?.recentSessions || []} />
          </div>
        )

      case "campaigns":
        return (
          <div className="space-y-6">
            <EnhancedCampaignsTab loading={loading} />
          </div>
        )

      case "geographic":
        return (
          <div className="space-y-6">
            <GeographicMap loading={loading} />
          </div>
        )

      case "raw_data":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Dados Brutos das APIs</h2>
              <p className="text-slate-600">Todos os dados originais capturados</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-slate-900">Total de Registros</h3>
                  <p className="text-2xl font-bold text-slate-700">
                    {users.reduce((acc, user) => acc + user.rawApiData.length, 0) +
                      vehicles.reduce((acc, vehicle) => acc + vehicle.rawApiData.length, 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-slate-900">Usuários</h3>
                  <p className="text-2xl font-bold text-slate-700">{users.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-slate-900">Veículos</h3>
                  <p className="text-2xl font-bold text-slate-700">{vehicles.length}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>JSON Completo - Todos os Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-xs bg-slate-100 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(
                      {
                        usuarios: users.flatMap((user) => user.rawApiData),
                        veiculos: vehicles.flatMap((vehicle) => vehicle.rawApiData),
                        estatisticas: {
                          total_usuarios: users.length,
                          total_veiculos: vehicles.length,
                          total_registros:
                            users.reduce((acc, user) => acc + user.rawApiData.length, 0) +
                            vehicles.reduce((acc, vehicle) => acc + vehicle.rawApiData.length, 0),
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Seção em Desenvolvimento</h3>
            <p className="text-slate-500">Esta funcionalidade estará disponível em breve</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm z-40 transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Gov.br Admin</h1>
              <p className="text-sm text-slate-500">Sistema de Monitoramento</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          {lastUpdate && (
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
              Atualizado às {lastUpdate.toLocaleTimeString("pt-BR")}
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={onRefresh} disabled={loading} variant="outline" size="sm" className="flex-1">
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Atualizar
            </Button>

            <Button onClick={onLogout} variant="destructive" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h2 className="text-xl font-semibold text-slate-900">
                {menuItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {activeSection === "overview" && "Visão geral do sistema"}
                {activeSection === "users" && "Gerenciar usuários cadastrados"}
                {activeSection === "vehicles" && "Veículos consultados"}
                {activeSection === "raw_data" && "Dados brutos das APIs"}
                {activeSection === "campaigns" && "Gerenciar campanhas"}
                {activeSection === "sessions" && "Gerenciar sessões"}
                {activeSection === "geographic" && "Visualização Geográfica"}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{users.length} usuários</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4" />
                  <span>{vehicles.length} veículos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
