"use client"

import type React from "react"

import { useState } from "react"
import { Trash2, Calendar, Car, Eye } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TableCell } from "@/components/ui/table"
import { formatCpf } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UsersTabProps {
  users: any[]
  setSelectedUser: (user: any) => void
}

const UsersTab: React.FC<UsersTabProps> = ({ users, setSelectedUser }) => {
  const [deleteReason, setDeleteReason] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedUser, setSelectedUserLocal] = useState<any>(null)

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

  return (
    <>
      {users.map((user) => (
        <tr key={user.cpf}>
          <TableCell className="font-medium">{user.nome}</TableCell>
          <TableCell>{formatCpf(user.cpf)}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.telefone}</TableCell>
          <TableCell>{user.totalSessions}</TableCell>
          <TableCell>{user.vehicles.length}</TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user)
                      setSelectedUserLocal(user)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Detalhes do Usuário</DialogTitle>
                    <DialogDescription>Informações completas sobre {user.nome}</DialogDescription>
                  </DialogHeader>

                  {selectedUser && (
                    <div className="space-y-6">
                      {/* Informações Pessoais */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-600">Nome Completo</label>
                            <p className="text-slate-900">{selectedUser.nome || "Não informado"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">CPF</label>
                            <p className="text-slate-900">{formatCpf(selectedUser.cpf)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Localização</label>
                            <p className="text-slate-900">
                              {selectedUser.city && selectedUser.country
                                ? `${selectedUser.city}, ${selectedUser.country}`
                                : "Não identificado"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Status</label>
                            <Badge variant={selectedUser.completed ? "default" : "secondary"} className="mt-1">
                              {selectedUser.completed ? "Processo Concluído" : "Em Andamento"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Veículos */}
                      {selectedUser.vehicles.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Veículos Consultados</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedUser.vehicles.map((vehicle: any, idx: number) => (
                                <div key={idx} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                                  <Car className="w-8 h-8 text-slate-400" />
                                  <div>
                                    <p className="font-medium">{vehicle.placa}</p>
                                    <p className="text-sm text-slate-500">
                                      {vehicle.marca} {vehicle.modelo}
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
                          <CardTitle className="text-lg">Histórico de Sessões</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedUser.sessions.map((session: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Sessão {session.session_id.slice(0, 8)}...</p>
                                    <p className="text-xs text-slate-500">
                                      {new Date(session.created_at).toLocaleString("pt-BR")}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                                  Step {session.current_step}
                                </Badge>
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
                          <li>• {user.sessions.length} sessão(ões)</li>
                          <li>• {user.vehicles.length} veículo(s)</li>
                          <li>• Todos os débitos associados</li>
                          <li>• Todos os eventos de tracking</li>
                          <li>• Dados pessoais e histórico completo</li>
                        </ul>
                      </div>
                      <p className="text-red-600 font-medium">⚠️ Esta ação é IRREVERSÍVEL e não pode ser desfeita!</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Motivo da exclusão (obrigatório):</label>
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
        </tr>
      ))}
    </>
  )
}

export default UsersTab
