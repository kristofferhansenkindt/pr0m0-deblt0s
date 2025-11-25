"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, TrendingUp, RefreshCw } from "lucide-react"

interface GeographicMapProps {
  loading: boolean
}

export function GeographicMap({ loading }: GeographicMapProps) {
  const [mapData, setMapData] = useState<any[]>([])
  const [mapLoading, setMapLoading] = useState(true)

  const fetchMapData = async () => {
    try {
      setMapLoading(true)
      const response = await fetch("/api/admin/geographic-map", {
        headers: {
          Authorization: "Bearer admin1234554321",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMapData(data.data)
      }
    } catch (error) {
      console.error("Erro ao buscar dados do mapa:", error)
    } finally {
      setMapLoading(false)
    }
  }

  useEffect(() => {
    fetchMapData()
  }, [])

  const getIntensityColor = (sessionCount: number, maxSessions: number) => {
    if (sessionCount === 0) return "bg-gray-100"
    const intensity = sessionCount / maxSessions
    if (intensity > 0.8) return "bg-blue-800"
    if (intensity > 0.6) return "bg-blue-600"
    if (intensity > 0.4) return "bg-blue-400"
    if (intensity > 0.2) return "bg-blue-300"
    return "bg-blue-200"
  }

  const maxSessions = Math.max(...mapData.map((state) => state.session_count))

  if (mapLoading || loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Distribuição Geográfica</h2>
          <p className="text-slate-500">Mapa de calor dos acessos por estado brasileiro</p>
        </div>
        <Button onClick={fetchMapData} disabled={mapLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${mapLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{mapData.length}</div>
            <div className="text-sm text-gray-600">Estados com Dados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {mapData.reduce((acc, state) => acc + state.session_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total de Sessões</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mapData.reduce((acc, state) => acc + state.user_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Usuários Únicos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {mapData.reduce((acc, state) => acc + state.conversions, 0)}
            </div>
            <div className="text-sm text-gray-600">Conversões</div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Visual Simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Mapa de Calor - Brasil</span>
          </CardTitle>
          <CardDescription>Intensidade de acessos por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legenda */}
            <div className="flex items-center space-x-4 text-sm">
              <span>Intensidade:</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Sem dados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span>Baixa</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span>Média</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Alta</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-800 rounded"></div>
                <span>Muito Alta</span>
              </div>
            </div>

            {/* Grid de Estados por Região */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Norte */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-green-700">Norte</h3>
                <div className="space-y-2">
                  {mapData
                    .filter((state) => state.region === "Norte")
                    .map((state) => (
                      <div key={state.state_code} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${getIntensityColor(state.session_count, maxSessions)}`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{state.state_code}</div>
                          <div className="text-xs text-gray-500">{state.session_count} sessões</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Nordeste */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-yellow-700">Nordeste</h3>
                <div className="space-y-2">
                  {mapData
                    .filter((state) => state.region === "Nordeste")
                    .map((state) => (
                      <div key={state.state_code} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${getIntensityColor(state.session_count, maxSessions)}`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{state.state_code}</div>
                          <div className="text-xs text-gray-500">{state.session_count} sessões</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Centro-Oeste */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-orange-700">Centro-Oeste</h3>
                <div className="space-y-2">
                  {mapData
                    .filter((state) => state.region === "Centro-Oeste")
                    .map((state) => (
                      <div key={state.state_code} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${getIntensityColor(state.session_count, maxSessions)}`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{state.state_code}</div>
                          <div className="text-xs text-gray-500">{state.session_count} sessões</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Sudeste */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-blue-700">Sudeste</h3>
                <div className="space-y-2">
                  {mapData
                    .filter((state) => state.region === "Sudeste")
                    .map((state) => (
                      <div key={state.state_code} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${getIntensityColor(state.session_count, maxSessions)}`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{state.state_code}</div>
                          <div className="text-xs text-gray-500">{state.session_count} sessões</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Sul */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-purple-700">Sul</h3>
                <div className="space-y-2">
                  {mapData
                    .filter((state) => state.region === "Sul")
                    .map((state) => (
                      <div key={state.state_code} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${getIntensityColor(state.session_count, maxSessions)}`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{state.state_code}</div>
                          <div className="text-xs text-gray-500">{state.session_count} sessões</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Estados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Top 10 Estados</span>
          </CardTitle>
          <CardDescription>Estados com maior número de acessos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mapData
              .sort((a, b) => b.session_count - a.session_count)
              .slice(0, 10)
              .map((state, index) => {
                const conversionRate =
                  state.session_count > 0 ? ((state.conversions / state.session_count) * 100).toFixed(1) : "0.0"

                return (
                  <div key={state.state_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {state.state_name} ({state.state_code})
                        </div>
                        <div className="text-sm text-gray-500">{state.region}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{state.session_count}</div>
                        <div className="text-xs text-gray-500">Sessões</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{state.user_count}</div>
                        <div className="text-xs text-gray-500">Usuários</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{state.conversions}</div>
                        <div className="text-xs text-gray-500">Conversões</div>
                      </div>
                      <Badge variant={Number.parseFloat(conversionRate) > 3 ? "default" : "secondary"}>
                        {conversionRate}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
