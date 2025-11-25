"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, User, Car, Calendar, MapPin, Activity, CreditCard, Clock, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface UsersPageProps {
  data: any
  loading: boolean
}

export function UsersPage({ data, loading }: UsersPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [deleteReason, setDeleteReason] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Processa os dados dos usuários
  const users = useMemo(() => {
    if (!data?.recentSessions) return []

    const userMap = new Map()

    data.recentSessions.forEach((session: any) => {
      if (!session.cpf) return

      const userId = session.cpf
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          cpf: session.cpf,
          nome: session.nome || "Nome não informado",
          user_id: session.user_id,
          sessions: [],
          vehicles: [],
          lastAccess: session.created_at,
          firstAccess: session.created_at,
          totalSessions: 0,
          completedSessions: 0,
          city: session.city,
          region: session.region,
          country: session.country,
          ip_address: session.ip_address,
          user_agent: session.user_agent,
          latitude: session.latitude,
          longitude: session.longitude,
        })
      }

      const user = userMap.get(userId)
      user.sessions.push(session)
      user.totalSessions++

      if (session.completed) {
        user.completedSessions++
      }

      // Atualiza último acesso
      if (new Date(session.created_at) > new Date(user.lastAccess)) {
        user.lastAccess = session.created_at
      }

      // Atualiza primeiro acesso
      if (new Date(session.created_at) < new Date(user.firstAccess)) {
        user.firstAccess = session.created_at
      }

      // Adiciona veículo se existir
      if (session.placa && !user.vehicles.find((v: any) => v.placa === session.placa)) {
        user.vehicles.push({
          placa: session.placa,
          modelo: session.modelo,
          marca: session.marca,
          session_id: session.session_id,
        })
      }
    })

    return Array.from(userMap.values())
  }, [data])

  // Filtros e busca
  const filteredUsers = useMemo(() => {
    let filtered = users

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user: any) => {
        if (statusFilter === "completed") return user.completedSessions > 0
        if (statusFilter === "active") return user.completedSessions === 0 && user.totalSessions > 0
        return true
      })
    }

    // Busca
    if (searchTerm) {
      filtered = filtered.filter(
        (user: any) =>
          user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.cpf?.includes(searchTerm) ||
          user.vehicles?.some((v: any) => v.placa?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          user.city?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Ordenação
    filtered.sort((a: any, b: any) => {
      if (sortBy === "recent") return new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime()
      if (sortBy === "name") return a.nome.localeCompare(b.nome)
      if (sortBy === "sessions") return b.totalSessions - a.totalSessions
      return 0
    })

    return filtered
  }, [users, searchTerm, statusFilter, sortBy])

  const formatCpf = (cpf: string) => {
    return cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || ""
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR")
  }

  const handleDeleteUser = async (user: any) => {
    if (!deleteReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, informe o motivo da exclusão",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: user.cpf,
          reason: deleteReason,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Usuário excluído",
          description: `${user.nome} foi excluído permanentemente do sistema`,
        })

        // Recarrega a página para atualizar a lista
        window.location.reload()
      } else {
        toast({
          title: "Erro ao excluir",
          description: result.error || "Erro interno do servidor",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteReason("")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u: any) => u.completedSessions === 0 && u.totalSessions > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Concluídos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u: any) => u.completedSessions > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Com Veículos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u: any) => u.vehicles.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>Visualize e gerencie todos os usuários cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, CPF, placa ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="active">Em Andamento</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recente</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="sessions">Mais Sessões</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Sessões</TableHead>
                <TableHead>Veículos</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: any, index: number) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-50"
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.nome}</p>
                        <p className="text-sm text-slate-500">ID: {user.user_id || "N/A"}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">{formatCpf(user.cpf)}</code>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        {user.city && user.country ? `${user.city}, ${user.country}` : "Não identificado"}
                      </span>
                    </div>
                    {user.ip_address && <p className="text-xs text-slate-400 mt-1">IP: {user.ip_address}</p>}
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{user.totalSessions}</span>
                      <span className="text-slate-500"> total</span>
                    </div>
                    <div className="text-xs text-slate-500">{user.completedSessions} concluídas</div>
                  </TableCell>

                  <TableCell>
                    {user.vehicles.length > 0 ? (
                      <div className="flex items-center space-x-1 text-sm">
                        <Car className="w-4 h-4 text-slate-400" />
                        <span>{user.vehicles[0].placa}</span>
                        {user.vehicles.length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.vehicles.length - 1}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Nenhum</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-slate-600">{formatDate(user.lastAccess)}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.completedSessions > 0 ? "default" : "secondary"} className="text-xs">
                      {user.completedSessions > 0 ? "Concluído" : "Em andamento"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes Completos do Usuário</DialogTitle>
                            <DialogDescription>Informações detalhadas sobre {selectedUser?.nome}</DialogDescription>
                          </DialogHeader>

                          {selectedUser && (
                            <div className="space-y-6">
                              {/* Informações Pessoais */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Informações Pessoais
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Nome Completo</label>
                                    <p className="text-slate-900 font-medium">{selectedUser.nome}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">CPF</label>
                                    <p className="text-slate-900 font-mono">{formatCpf(selectedUser.cpf)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">ID do Usuário</label>
                                    <p className="text-slate-900">{selectedUser.user_id || "Não atribuído"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Status</label>
                                    <Badge
                                      variant={selectedUser.completedSessions > 0 ? "default" : "secondary"}
                                      className="mt-1"
                                    >
                                      {selectedUser.completedSessions > 0 ? "Processo Concluído" : "Em Andamento"}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Informações de Localização */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Localização e Acesso
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">País</label>
                                    <p className="text-slate-900">{selectedUser.country || "Não identificado"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Região/Estado</label>
                                    <p className="text-slate-900">{selectedUser.region || "Não identificado"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Cidade</label>
                                    <p className="text-slate-900">{selectedUser.city || "Não identificado"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Endereço IP</label>
                                    <p className="text-slate-900 font-mono">
                                      {selectedUser.ip_address || "Não disponível"}
                                    </p>
                                  </div>
                                  {selectedUser.latitude && selectedUser.longitude && (
                                    <>
                                      <div>
                                        <label className="text-sm font-medium text-slate-600">Latitude</label>
                                        <p className="text-slate-900 font-mono">{selectedUser.latitude}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-slate-600">Longitude</label>
                                        <p className="text-slate-900 font-mono">{selectedUser.longitude}</p>
                                      </div>
                                    </>
                                  )}
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-600">User Agent</label>
                                    <p className="text-slate-900 text-sm break-all">
                                      {selectedUser.user_agent || "Não disponível"}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Estatísticas de Uso */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <Activity className="w-5 h-5 mr-2" />
                                    Estatísticas de Uso
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Total de Sessões</label>
                                    <p className="text-2xl font-bold text-slate-900">{selectedUser.totalSessions}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Sessões Concluídas</label>
                                    <p className="text-2xl font-bold text-green-600">
                                      {selectedUser.completedSessions}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Primeiro Acesso</label>
                                    <p className="text-slate-900">{formatDate(selectedUser.firstAccess)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600">Último Acesso</label>
                                    <p className="text-slate-900">{formatDate(selectedUser.lastAccess)}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Veículos Consultados */}
                              {selectedUser.vehicles.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                      <Car className="w-5 h-5 mr-2" />
                                      Veículos Consultados ({selectedUser.vehicles.length})
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {selectedUser.vehicles.map((vehicle: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg"
                                        >
                                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Car className="w-6 h-6 text-blue-600" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium text-slate-900">{vehicle.placa}</p>
                                            <p className="text-sm text-slate-500">
                                              {vehicle.marca} {vehicle.modelo}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                              Sessão: {vehicle.session_id?.slice(0, 8)}...
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Histórico de Sessões */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <Clock className="w-5 h-5 mr-2" />
                                    Histórico de Sessões ({selectedUser.sessions.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {selectedUser.sessions
                                      .sort(
                                        (a: any, b: any) =>
                                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                                      )
                                      .map((session: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                              <Calendar className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">
                                                Sessão {session.session_id.slice(0, 8)}...
                                              </p>
                                              <p className="text-xs text-slate-500">{formatDate(session.created_at)}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Badge
                                              variant={session.completed ? "default" : "secondary"}
                                              className="text-xs"
                                            >
                                              Step {session.current_step}
                                            </Badge>
                                            {session.completed && (
                                              <Badge variant="default" className="text-xs bg-green-600">
                                                Concluído
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>⚠️ Excluir Usuário Permanentemente</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                              <p>
                                Você está prestes a excluir <strong>{user.nome}</strong> (CPF: {formatCpf(user.cpf)})
                                permanentemente do sistema.
                              </p>
                              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <p className="text-red-800 font-medium text-sm">Esta ação irá apagar:</p>
                                <ul className="text-red-700 text-sm mt-2 space-y-1">
                                  <li>• {user.totalSessions} sessão(ões)</li>
                                  <li>• {user.vehicles.length} veículo(s)</li>
                                  <li>• Todos os débitos associados</li>
                                  <li>• Todos os eventos de tracking</li>
                                  <li>• Dados pessoais e histórico completo</li>
                                </ul>
                              </div>
                              <p className="text-red-600 font-medium">
                                ⚠️ Esta ação é IRREVERSÍVEL e não pode ser desfeita!
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700">
                              Motivo da exclusão (obrigatório):
                            </label>
                            <Textarea
                              placeholder="Ex: Solicitação do usuário, dados incorretos, violação de termos..."
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>

                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteReason("")}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user)}
                              disabled={!deleteReason.trim() || isDeleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isDeleting ? "Excluindo..." : "Excluir Permanentemente"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-900 mb-2">Nenhum usuário encontrado</p>
              <p className="text-slate-500">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Ainda não há usuários cadastrados"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
