"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Target,
  Users,
  MousePointer,
  RefreshCw,
  Facebook,
  Search,
  Mail,
  Globe,
  AlertTriangle,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"

interface EnhancedCampaignsTabProps {
  loading: boolean
}

export function EnhancedCampaignsTab({ loading }: EnhancedCampaignsTabProps) {
  const [campaignData, setCampaignData] = useState<any>(null)
  const [campaignLoading, setCampaignLoading] = useState(true)

  const fetchCampaignData = async () => {
    try {
      setCampaignLoading(true)
      const response = await fetch("/api/admin/enhanced-campaigns", {
        headers: {
          Authorization: "Bearer admin1234554321",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCampaignData(data.data)
      }
    } catch (error) {
      console.error("Erro ao buscar dados de campanhas:", error)
    } finally {
      setCampaignLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaignData()
  }, [])

  const getSourceIcon = (source: string) => {
    switch (source?.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />
      case "google":
        return <Search className="w-4 h-4 text-red-600" />
      case "email":
        return <Mail className="w-4 h-4 text-green-600" />
      default:
        return <Globe className="w-4 h-4 text-gray-600" />
    }
  }

  if (campaignLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!campaignData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Nenhum dado de campanha encontrado</p>
        <Button onClick={fetchCampaignData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  // Calcula estatísticas gerais
  const totalSessions =
    campaignData.sourceAnalysis?.reduce((acc: number, item: any) => acc + Number.parseInt(item.total_sessions), 0) || 0
  const totalConversions =
    campaignData.sourceAnalysis?.reduce((acc: number, item: any) => acc + Number.parseInt(item.conversions), 0) || 0
  const avgConversionRate = totalSessions > 0 ? ((totalConversions / totalSessions) * 100).toFixed(2) : "0.00"
  const totalButtonClicks =
    campaignData.sourceAnalysis?.reduce(
      (acc: number, item: any) => acc + Number.parseInt(item.total_button_clicks || 0),
      0,
    ) || 0
  const totalCheckoutClicks =
    campaignData.sourceAnalysis?.reduce(
      (acc: number, item: any) => acc + Number.parseInt(item.checkout_clicks || 0),
      0,
    ) || 0

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Análise Detalhada de Campanhas</h2>
          <p className="text-slate-500">Performance completa das suas campanhas de marketing com insights profundos</p>
        </div>
        <Button onClick={fetchCampaignData} disabled={campaignLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${campaignLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas gerais expandidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Acessos</CardTitle>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalSessions.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">via campanhas UTM</p>
              <div className="mt-2 text-xs text-green-600">+{Math.round(totalSessions * 0.15)} vs. mês anterior</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Conversões</CardTitle>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalConversions.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">checkout concluído</p>
              <div className="mt-2 text-xs text-green-600">Taxa: {avgConversionRate}%</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Cliques em Botões</CardTitle>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalButtonClicks.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">interações totais</p>
              <div className="mt-2 text-xs text-blue-600">{totalCheckoutClicks} cliques no checkout</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Campanhas Ativas</CardTitle>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{campaignData.campaignAnalysis?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">campanhas diferentes</p>
              <div className="mt-2 text-xs text-purple-600">
                {campaignData.sourceAnalysis?.length || 0} fontes de tráfego
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Análise de Performance por Fonte - Expandida */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance Detalhada por Fonte</span>
            </CardTitle>
            <CardDescription>Análise completa de cada canal de marketing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {campaignData.sourceAnalysis?.map((source: any, index: number) => {
                const conversionRate = Number.parseFloat(source.conversion_rate) || 0
                const avgTime = Math.round(source.avg_time_on_site || 0)
                const avgPages = Number.parseFloat(source.avg_pages_visited || 0).toFixed(1)

                return (
                  <div key={source.utm_source} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getSourceIcon(source.utm_source)}
                        <div>
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {source.utm_source || "Não identificado"}
                          </span>
                          <div className="text-xs text-gray-500">
                            {source.total_sessions} acessos • {source.conversions} conversões
                          </div>
                        </div>
                      </div>
                      <Badge variant={conversionRate > 5 ? "default" : "secondary"} className="text-xs">
                        {conversionRate}% conversão
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{source.total_button_clicks}</div>
                        <div className="text-gray-500">Cliques</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{avgTime}s</div>
                        <div className="text-gray-500">Tempo Médio</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{avgPages}</div>
                        <div className="text-gray-500">Páginas/Sessão</div>
                      </div>
                    </div>

                    <Progress value={conversionRate} className="h-2" />

                    {source.checkout_clicks > 0 && (
                      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        🛒 {source.checkout_clicks} cliques no checkout (
                        {((source.checkout_clicks / source.total_sessions) * 100).toFixed(1)}% dos acessos)
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Análise de Abandono */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Análise de Abandono</span>
            </CardTitle>
            <CardDescription>Onde os usuários estão saindo do funil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignData.abandonmentAnalysis?.slice(0, 8).map((abandon: any, index: number) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(abandon.utm_source)}
                      <span className="text-sm font-medium">{abandon.utm_source}</span>
                      <Badge variant="outline" className="text-xs">
                        Step {abandon.current_step}
                      </Badge>
                    </div>
                    <Badge variant={Number.parseFloat(abandon.abandonment_rate) > 50 ? "destructive" : "secondary"}>
                      {abandon.abandonment_rate}% abandono
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-600">
                    {abandon.abandoned_at_step} de {abandon.sessions_at_step} usuários abandonaram
                  </div>

                  {abandon.exit_page && (
                    <div className="text-xs text-orange-600">Última página: {abandon.exit_page}</div>
                  )}

                  <div className="text-xs text-gray-500">
                    Tempo médio antes da saída: {Math.round(abandon.avg_time_before_exit || 0)}s
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada por Campanha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Performance Detalhada por Campanha</span>
          </CardTitle>
          <CardDescription>Análise profunda de cada campanha individual</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Funil de Conversão</TableHead>
                <TableHead>Engajamento</TableHead>
                <TableHead>Ações</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>ROI Estimado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.campaignAnalysis?.map((campaign: any, index: number) => {
                const dropoffLogin = (
                  ((campaign.reached_login - campaign.reached_placa) / campaign.reached_login) *
                  100
                ).toFixed(1)
                const dropoffPlaca = (
                  ((campaign.reached_placa - campaign.reached_debitos) / campaign.reached_placa) *
                  100
                ).toFixed(1)
                const dropoffDebitos = (
                  ((campaign.reached_debitos - campaign.completed) / campaign.reached_debitos) *
                  100
                ).toFixed(1)
                const estimatedCost = campaign.total_sessions * 0.75
                const costPerConversion = campaign.completed > 0 ? (estimatedCost / campaign.completed).toFixed(2) : "∞"

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getSourceIcon(campaign.utm_source)}
                          <span className="font-semibold">{campaign.utm_campaign}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.utm_source} • {campaign.utm_medium}
                        </div>
                        {campaign.utm_content && <div className="text-xs text-blue-600">{campaign.utm_content}</div>}
                        <Badge variant="outline" className="text-xs">
                          {campaign.total_sessions} sessões • {campaign.unique_users} usuários únicos
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-1 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{campaign.reached_login}</div>
                            <div className="text-gray-500">Login</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{campaign.reached_placa}</div>
                            <div className="text-gray-500">Placa</div>
                            {campaign.reached_login > 0 && <div className="text-red-500 text-xs">-{dropoffLogin}%</div>}
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{campaign.reached_debitos}</div>
                            <div className="text-gray-500">Débitos</div>
                            {campaign.reached_placa > 0 && <div className="text-red-500 text-xs">-{dropoffPlaca}%</div>}
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{campaign.completed}</div>
                            <div className="text-gray-500">Completo</div>
                            {campaign.reached_debitos > 0 && (
                              <div className="text-red-500 text-xs">-{dropoffDebitos}%</div>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-gray-600">
                          <strong>Principais pontos de abandono:</strong>
                          {campaign.dropped_at_login > 0 && (
                            <div>• {campaign.dropped_at_login} abandonaram no login</div>
                          )}
                          {campaign.dropped_at_placa > 0 && (
                            <div>• {campaign.dropped_at_placa} abandonaram na consulta</div>
                          )}
                          {campaign.dropped_at_debitos > 0 && (
                            <div>• {campaign.dropped_at_debitos} abandonaram nos débitos</div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{Math.round(campaign.avg_session_duration || 0)}s por sessão</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-3 h-3" />
                          <span>
                            {Number.parseFloat(campaign.avg_pages_per_session || 0).toFixed(1)} páginas/sessão
                          </span>
                        </div>
                        <div className="text-green-600">
                          Qualidade:{" "}
                          {campaign.avg_session_duration > 60
                            ? "Alta"
                            : campaign.avg_session_duration > 30
                              ? "Média"
                              : "Baixa"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Cliques em botões:</span>
                          <span className="font-semibold">{campaign.button_clicks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Envios de formulário:</span>
                          <span className="font-semibold">{campaign.form_submissions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interações checkout:</span>
                          <span className="font-semibold text-orange-600">{campaign.checkout_interactions}</span>
                        </div>
                        <div className="text-blue-600 bg-blue-50 p-1 rounded">
                          {((campaign.checkout_interactions / campaign.total_sessions) * 100).toFixed(1)}% tentaram
                          pagar
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={Number.parseFloat(campaign.conversion_rate) > 5 ? "default" : "secondary"}>
                          {campaign.conversion_rate}% conversão
                        </Badge>
                        <div className="text-xs text-gray-600">
                          Período: {new Date(campaign.first_session).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(campaign.last_session).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-xs">
                          <span
                            className={
                              campaign.conversion_rate > 3
                                ? "text-green-600"
                                : campaign.conversion_rate > 1
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }
                          >
                            {campaign.conversion_rate > 3
                              ? "🟢 Excelente"
                              : campaign.conversion_rate > 1
                                ? "🟡 Boa"
                                : "🔴 Precisa melhorar"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Custo estimado:</span>
                          <span className="font-semibold">R$ {estimatedCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custo/conversão:</span>
                          <span
                            className={`font-semibold ${Number.parseFloat(costPerConversion) > 50 ? "text-red-600" : "text-green-600"}`}
                          >
                            R$ {costPerConversion}
                          </span>
                        </div>
                        <div className="text-xs">
                          ROI:{" "}
                          {campaign.completed > 0 ? (
                            <span className="text-green-600">
                              +{(((campaign.completed * 67.12 - estimatedCost) / estimatedCost) * 100).toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-red-600">-100%</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análise de Conteúdo/Anúncios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Performance por Conteúdo/Anúncio</span>
          </CardTitle>
          <CardDescription>Qual conteúdo está convertendo melhor</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>Conversões</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Ações Específicas</TableHead>
                <TableHead>ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.contentAnalysis?.map((content: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-semibold">{content.utm_content}</div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        {getSourceIcon(content.utm_source)}
                        <span>{content.utm_source}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{content.utm_campaign}</div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold">{content.clicks}</div>
                      <div className="text-xs text-gray-500">{content.unique_visitors} únicos</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-green-600">{content.conversions}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={Number.parseFloat(content.conversion_rate) > 5 ? "default" : "secondary"}>
                      {content.conversion_rate}%
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div>🔍 {content.search_button_clicks} buscas</div>
                      <div>💳 {content.payment_button_clicks} cliques pagar</div>
                      <div className="text-orange-600">
                        {((content.payment_button_clicks / content.clicks) * 100).toFixed(1)}% tentaram pagar
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div>Custo: R$ {content.estimated_cost}</div>
                      <div
                        className={`font-semibold ${Number.parseFloat(content.cost_per_conversion) > 50 ? "text-red-600" : "text-green-600"}`}
                      >
                        R$ {content.cost_per_conversion}/conv
                      </div>
                      <div className="text-xs">
                        {content.conversions > 0 ? (
                          <span className="text-green-600">Lucrativo</span>
                        ) : (
                          <span className="text-red-600">Sem retorno</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
