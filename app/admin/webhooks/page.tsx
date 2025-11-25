"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Webhook {
  id: number
  transaction_id: string | null
  status: string | null
  event_type: string
  headers: any
  body: any
  client_ip: string
  user_agent: string
  processed: boolean
  error_message: string | null
  created_at: string
  updated_at: string
}

interface WebhookStats {
  total: number
  processed: number
  paid: number
  pending: number
  errors: number
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [stats, setStats] = useState<WebhookStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/webhooks")
      const data = await response.json()

      if (data.success) {
        setWebhooks(data.webhooks)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Erro ao buscar webhooks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">N/A</Badge>

    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        )
      case "failed":
      case "error":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Webhooks SkalePay</h1>
        <Button onClick={fetchWebhooks} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.processed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* URL do Webhook */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">URL do Webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
            {typeof window !== "undefined" ? `${window.location.origin}/api/payment/webhook` : "/api/payment/webhook"}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Use esta URL como postbackUrl na SkalePay para receber notificações automáticas.
          </p>
        </CardContent>
      </Card>

      {/* Lista de Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Webhooks Recebidos</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhum webhook recebido ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">#{webhook.id}</span>
                      {webhook.transaction_id && <Badge variant="outline">{webhook.transaction_id}</Badge>}
                      {getStatusBadge(webhook.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{formatDate(webhook.created_at)}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Webhook #{webhook.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Informações Gerais</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>ID:</strong> {webhook.id}
                                </div>
                                <div>
                                  <strong>Transaction ID:</strong> {webhook.transaction_id || "N/A"}
                                </div>
                                <div>
                                  <strong>Status:</strong> {webhook.status || "N/A"}
                                </div>
                                <div>
                                  <strong>Evento:</strong> {webhook.event_type}
                                </div>
                                <div>
                                  <strong>IP:</strong> {webhook.client_ip}
                                </div>
                                <div>
                                  <strong>Processado:</strong> {webhook.processed ? "Sim" : "Não"}
                                </div>
                              </div>
                            </div>

                            {webhook.error_message && (
                              <div>
                                <h4 className="font-medium mb-2 text-red-600">Erro</h4>
                                <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                                  {webhook.error_message}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Headers</h4>
                              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {JSON.stringify(webhook.headers, null, 2)}
                              </pre>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Body</h4>
                              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {JSON.stringify(webhook.body, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div>
                      <strong>Evento:</strong> {webhook.event_type}
                    </div>
                    <div>
                      <strong>IP:</strong> {webhook.client_ip}
                    </div>
                    {webhook.error_message && (
                      <div className="text-red-600">
                        <strong>Erro:</strong> {webhook.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
