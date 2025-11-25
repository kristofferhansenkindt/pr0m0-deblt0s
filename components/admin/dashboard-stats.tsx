"use client"

import { motion } from "framer-motion"

interface DashboardStatsProps {
  stats: {
    totalUsers: number
    totalSessions: number
    completedSessions: number
    todaySessions: number
    conversionRate: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toLocaleString(),
      icon: "👥",
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Sessões Totais",
      value: stats.totalSessions.toLocaleString(),
      icon: "📊",
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Conversões",
      value: stats.completedSessions.toLocaleString(),
      icon: "✅",
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Sessões Hoje",
      value: stats.todaySessions.toLocaleString(),
      icon: "📈",
      color: "bg-orange-500",
      change: "+5%",
    },
    {
      title: "Taxa de Conversão",
      value: `${stats.conversionRate}%`,
      icon: "🎯",
      color: "bg-red-500",
      change: "+3%",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change} vs mês anterior</p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
