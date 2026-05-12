'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

type Lead = { id: string; name: string; contact: string | null; notes: string | null; createdAt: string }

export default function LeadlerPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')

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
      body: JSON.stringify({ notes: noteValue }),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leadler</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{leads.length} potansiyel müşteri</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-muted-foreground text-sm">Henüz lead yok. Mesajlarda lead işaretleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border/60">
                {['İsim', 'İletişim', 'Notlar', 'Tarih', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl stat-blue flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {lead.name[0]}
                      </div>
                      <span className="font-medium">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{lead.contact || '—'}</td>
                  <td className="px-5 py-3.5 max-w-xs">
                    {editingId === lead.id ? (
                      <div className="flex gap-2">
                        <input value={noteValue} onChange={(e) => setNoteValue(e.target.value)}
                          className="flex-1 text-xs px-2 py-1 rounded-lg border border-border bg-background"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveNote(lead.id); if (e.key === 'Escape') setEditingId(null) }}
                        />
                        <button onClick={() => saveNote(lead.id)} className="text-xs text-primary font-medium cursor-pointer">Kaydet</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground cursor-pointer">İptal</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(lead.id); setNoteValue(lead.notes || '') }}
                        className="text-xs text-left text-muted-foreground hover:text-foreground transition-colors line-clamp-1 w-full cursor-pointer">
                        {lead.notes || <span className="italic opacity-50">Not ekle...</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => deleteLead(lead.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
