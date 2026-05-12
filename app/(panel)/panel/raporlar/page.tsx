'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type ReportData = {
  msgByDay: { date: string; messages: number }[]
  leadsByDay: { date: string; leads: number }[]
  employeePerf: { name: string; replies: number }[]
  totals: { messages: number; leads: number; replies: number; conversionRate: number }
}

const PERIODS = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
  { value: 'yearly', label: 'Yıllık' },
]

export default function RaporlarPage() {
  const [period, setPeriod] = useState('weekly')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load(p: string) {
    setLoading(true)
    const res = await fetch(`/api/reports?period=${p}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { load(period) }, [period])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Raporlar</h1>
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="mb-6">
          {PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
          ))}
        </TabsList>

        {PERIODS.map((p) => (
          <TabsContent key={p.value} value={p.value}>
            {loading ? (
              <p className="text-muted-foreground">Yükleniyor...</p>
            ) : data ? (
              <div className="space-y-6">
                {/* Totals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Toplam Mesaj', value: data.totals.messages, color: 'text-blue-600' },
                    { label: 'Toplam Lead', value: data.totals.leads, color: 'text-green-600' },
                    { label: 'Toplam Yanıt', value: data.totals.replies, color: 'text-purple-600' },
                    { label: 'Dönüşüm Oranı', value: `${data.totals.conversionRate}%`, color: 'text-amber-600' },
                  ].map((s) => (
                    <Card key={s.label}>
                      <CardHeader className="pb-1">
                        <CardTitle className="text-xs text-muted-foreground">{s.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Message Volume */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mesaj Hacmi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.msgByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="messages" name="Mesaj" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Lead Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lead Dönüşümü</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data.leadsByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="leads" name="Lead" stroke="#22c55e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Employee Performance */}
                {data.employeePerf.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Çalışan Performansı</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.employeePerf} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                          <Tooltip />
                          <Bar dataKey="replies" name="Yanıt" fill="#a855f7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
