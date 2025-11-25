"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, Car, Activity, TrendingUp, Clock, MapPin, Target, DollarSign } from "lucide-react"

interface OverviewTabProps {
  data: any
  loading: boolean
}

export function OverviewTab({ data, loading }: OverviewTabProps) {
  if (loading || !data) {
    return (
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
    )
  }

  const stats = [
    {
      title: "Total de Usuários",
      value: data.stats?.totalUsers?.toLocaleString() || "0",
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Sessões Totais",
      value: data.stats?.totalSessions?.toLocaleString() || "0",
      change: "+8%",
      changeType: "positive",
      icon: Activity,
      color: "bg-green-500",
    },
    {
      title: "Veículos Consultados",
      value: data.recentSessions?.filter((s: any) => s.placa)?.length?.toString() || "0",
      change: "+15%",
      changeType: "positive",
      icon: Car,
      color: "bg-purple-500",
    },
    {
      title: "Taxa de Conversão",
      value: `${data.stats?.conversionRate || 0}%`,
      change: "+3%",
      changeType: "positive",
      icon: Target,
      color: "bg-orange-500",
    },
    {
      title: "Sessões Hoje",
      value: data.stats?.todaySessions?.toLocaleString() || "0",
      change: "+5%",
      changeType: "positive",
      icon: Clock,
      color: "bg-indigo-500",
    },
    {
      title: "Conversões",
      value: data.stats?.completedSessions?.toLocaleString() || "0",
      change: "+18%",
      changeType: "positive",
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
    {
      title: "Países Ativos",
      value: data.sessionsByCountry?.length?.toString() || "0",
      change: "+2%",
      changeType: "positive",
      icon: MapPin,
      color: "bg-rose-500",
    },
    {
      title: "Receita Potencial",
      value: "R$ 45.2K",
      change: "+22%",
      changeType: "positive",
      icon: DollarSign,
      color: "bg-amber-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                      {stat.change}
                    </Badge>
                    <p className="text-xs text-slate-500">vs mês anterior</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Acompanhe o progresso dos usuários através dos steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.sessionsByStep?.map((step: any, index: number) => {
              const percentage =
                data.stats?.totalSessions > 0 ? ((step.count / data.stats.totalSessions) * 100).toFixed(1) : "0.0"

              const stepNames = ["", "Login", "Placa", "Débitos", "Concluído"]
              const colors = ["", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"]

              return (
                <div key={step.current_step} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {stepNames[step.current_step] || `Step ${step.current_step}`}
                    </span>
                    <span className="text-sm text-slate-500">
                      {step.count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={Number.parseFloat(percentage)} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Sessões por País */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Geográfica</CardTitle>
            <CardDescription>Origem das sessões por país</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sessionsByCountry?.slice(0, 8).map((country: any, index: number) => {
                const percentage =
                  data.stats?.totalSessions > 0 ? ((country.count / data.stats.totalSessions) * 100).toFixed(1) : "0.0"

                return (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">
                        {country.country || "Não identificado"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500">{country.count}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentSessions?.slice(0, 5).map((session: any, index: number) => (
              <div key={session.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{session.nome || "Usuário não identificado"}</p>
                  <p className="text-xs text-slate-500">
                    {session.placa ? `Consultou veículo ${session.placa}` : "Iniciou sessão"}
                  </p>
                </div>
                <div className="text-xs text-slate-500">{new Date(session.created_at).toLocaleTimeString("pt-BR")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
