"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Car, Activity, FileText, LogOut, RefreshCw } from "lucide-react"
import { OverviewTab } from "./tabs/overview-tab"
import { UsersTab } from "./tabs/users-tab"
import { VehiclesTab } from "./tabs/vehicles-tab"
import { SessionsTab } from "./tabs/sessions-tab"
import { ReportsTab } from "./tabs/reports-tab"

interface DashboardLayoutProps {
  dashboardData: any
  loading: boolean
  onRefresh: () => void
  onLogout: () => void
  lastUpdate: Date | null
}

export function DashboardLayout({ dashboardData, loading, onRefresh, onLogout, lastUpdate }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    {
      id: "overview",
      label: "Visão Geral",
      icon: BarChart3,
      count: null,
    },
    {
      id: "users",
      label: "Usuários",
      icon: Users,
      count: dashboardData?.stats?.totalUsers || 0,
    },
    {
      id: "vehicles",
      label: "Veículos",
      icon: Car,
      count: dashboardData?.recentSessions?.filter((s: any) => s.placa)?.length || 0,
    },
    {
      id: "sessions",
      label: "Sessões",
      icon: Activity,
      count: dashboardData?.stats?.totalSessions || 0,
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: FileText,
      count: null,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Dashboard Admin</h1>
                  <p className="text-sm text-slate-500">Sistema de Monitoramento Gov.br</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {lastUpdate && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Atualizado às {lastUpdate.toLocaleTimeString("pt-BR")}</span>
                </div>
              )}

              <Button onClick={onRefresh} disabled={loading} variant="outline" size="sm" className="relative">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Atualizando..." : "Atualizar"}
              </Button>

              <Button onClick={onLogout} variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
            <TabsList className="grid w-full grid-cols-5 bg-slate-50">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count !== null && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="space-y-6">
            <TabsContent value="overview" className="space-y-6">
              <OverviewTab data={dashboardData} loading={loading} />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UsersTab data={dashboardData} loading={loading} />
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-6">
              <VehiclesTab data={dashboardData} loading={loading} />
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <SessionsTab data={dashboardData} loading={loading} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <ReportsTab data={dashboardData} loading={loading} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
