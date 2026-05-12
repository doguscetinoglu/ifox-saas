'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'

type Lead = {
  id: string
  name: string
  contact: string | null
  notes: string | null
  createdAt: string
  creator: { name: string }
  message: { content: string; receivedAt: string } | null
}

export default function LeadlerPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  async function load() {
    const res = await fetch('/api/leads')
    const data = await res.json()
    setLeads(data.leads || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveNote(id: string) {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: noteText }),
    })
    setEditingId(null)
    load()
  }

  async function deleteLead(id: string) {
    if (!confirm('Bu lead silinsin mi?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leadler</h1>
      {loading ? (
        <p className="text-muted-foreground">Yükleniyor...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tüm Leadler ({leads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3">Ad</th>
                    <th className="text-left p-3">İletişim</th>
                    <th className="text-left p-3">Son Mesaj</th>
                    <th className="text-left p-3">Notlar</th>
                    <th className="text-left p-3">Oluşturan</th>
                    <th className="text-left p-3">Tarih</th>
                    <th className="text-left p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/30 align-top">
                      <td className="p-3 font-medium">{lead.name}</td>
                      <td className="p-3 text-muted-foreground">{lead.contact || '—'}</td>
                      <td className="p-3 max-w-xs">
                        {lead.message ? (
                          <p className="line-clamp-2 text-muted-foreground">{lead.message.content}</p>
                        ) : '—'}
                      </td>
                      <td className="p-3 w-48">
                        {editingId === lead.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              rows={2}
                              className="text-xs"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => saveNote(lead.id)}>Kaydet</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>İptal</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1">
                            <span className="text-muted-foreground text-xs flex-1">{lead.notes || '—'}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 text-xs"
                              onClick={() => { setEditingId(lead.id); setNoteText(lead.notes || '') }}
                            >
                              ✏️
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="p-3">{lead.creator.name}</td>
                      <td className="p-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteLead(lead.id)}>
                          Sil
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        Henüz lead yok. Mesajlardan lead işaretleyebilirsiniz.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
