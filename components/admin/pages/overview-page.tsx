"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Activity, TrendingUp } from "lucide-react"

interface OverviewPageProps {
  data: any
  loading: boolean
}

export function OverviewPage({ data, loading }: OverviewPageProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.completedSessions || 0}</div>
            <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats?.totalSessions > 0
                ? `${((data.stats.completedSessions / data.stats.totalSessions) * 100).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">+3% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Progresso dos usuários através das etapas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.sessionsByStep?.map((step: any, index: number) => {
                const percentage =
                  data.stats.totalSessions > 0 ? ((step.count / data.stats.totalSessions) * 100).toFixed(1) : "0.0"

                const stepNames = ["", "Login", "Placa", "Débitos", "Concluído"]

                return (
                  <div key={step.current_step} className="flex items-center">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {stepNames[step.current_step] || `Step ${step.current_step}`}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {step.count} ({percentage}%)
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sessões por País */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões por País</CardTitle>
            <CardDescription>Distribuição geográfica dos acessos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.sessionsByCountry?.slice(0, 8).map((country: any, index: number) => {
                const percentage =
                  data.stats.totalSessions > 0 ? ((country.count / data.stats.totalSessions) * 100).toFixed(1) : "0.0"

                return (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">{country.country || "Não identificado"}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {country.count} ({percentage}%)
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
