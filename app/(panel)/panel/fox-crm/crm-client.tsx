'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type Musteri = {
  id: string
  ad: string
  email: string | null
  telefon: string | null
  sirket: string | null
  notlar: string | null
  _count: { tickets: number; projeler: number }
}

type Ticket = {
  id: string
  konu: string
  icerik: string
  durum: string
  oncelik: string
  musteri: { id: string; ad: string } | null
  _count: { yanitlar: number }
  createdAt: string
}

type Adim = { id: string; ad: string; sira: number; durum: string; gorevler: { id: string; baslik: string; durum: string }[] }

type Proje = {
  id: string
  ad: string
  aciklama: string | null
  durum: string
  musteri: { id: string; ad: string } | null
  adimlar: Adim[]
  createdAt: string
}

type Tab = 'musteriler' | 'tickets' | 'projeler'

const TICKET_DURUM_COLORS: Record<string, string> = {
  'Yeni': 'bg-blue-500/15 text-blue-500',
  'İşlemde': 'bg-amber-500/15 text-amber-500',
  'Çözüldü': 'bg-green-500/15 text-green-500',
  'Kapalı': 'bg-gray-500/15 text-gray-400',
}

const ONCELIK_COLORS: Record<string, string> = {
  'Düşük': 'text-green-500',
  'Normal': 'text-amber-500',
  'Yüksek': 'text-red-500',
  'Kritik': 'text-red-600 font-bold',
}

const PROJE_DURUM_COLORS: Record<string, string> = {
  'Devam Ediyor': 'bg-blue-500/15 text-blue-500',
  'Tamamlandı': 'bg-green-500/15 text-green-500',
  'Beklemede': 'bg-amber-500/15 text-amber-500',
  'İptal': 'bg-gray-500/15 text-gray-400',
}

export default function CrmClient({
  musteriler: initialM,
  tickets: initialT,
  projeler: initialP,
}: {
  musteriler: Musteri[]
  tickets: Ticket[]
  projeler: Proje[]
}) {
  const [tab, setTab] = useState<Tab>('musteriler')
  const [musteriler, setMusteriler] = useState(initialM)
  const [tickets, setTickets] = useState(initialT)
  const [projeler, setProjeler] = useState(initialP)

  const [showMForm, setShowMForm] = useState(false)
  const [showTForm, setShowTForm] = useState(false)
  const [showPForm, setShowPForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [mForm, setMForm] = useState({ ad: '', email: '', telefon: '', sirket: '', notlar: '' })
  const [tForm, setTForm] = useState({ musteriId: '', konu: '', icerik: '', oncelik: 'Normal' })
  const [pForm, setPForm] = useState({ musteriId: '', ad: '', aciklama: '' })

  async function addMusteri() {
    if (!mForm.ad) { toast.error('Ad gerekli'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/crm/musteriler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mForm) })
      if (res.ok) {
        const m = await res.json()
        setMusteriler((prev) => [...prev, { ...m, _count: { tickets: 0, projeler: 0 } }].sort((a, b) => a.ad.localeCompare(b.ad)))
        setMForm({ ad: '', email: '', telefon: '', sirket: '', notlar: '' })
        setShowMForm(false)
        toast.success('Müşteri eklendi')
      } else { toast.error('Hata oluştu') }
    } finally { setLoading(false) }
  }

  async function deleteMusteri(id: string) {
    const res = await fetch(`/api/crm/musteriler/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMusteriler((prev) => prev.filter((m) => m.id !== id))
      toast.success('Müşteri silindi')
    }
  }

  async function addTicket() {
    if (!tForm.konu || !tForm.icerik) { toast.error('Konu ve içerik gerekli'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/crm/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tForm) })
      if (res.ok) {
        const t = await res.json()
        const musteri = musteriler.find((m) => m.id === tForm.musteriId) ?? null
        setTickets((prev) => [{ ...t, musteri: musteri ? { id: musteri.id, ad: musteri.ad } : null, _count: { yanitlar: 0 } }, ...prev])
        setTForm({ musteriId: '', konu: '', icerik: '', oncelik: 'Normal' })
        setShowTForm(false)
        toast.success('Destek talebi oluşturuldu')
      } else { toast.error('Hata oluştu') }
    } finally { setLoading(false) }
  }

  async function updateTicketDurum(id: string, durum: string) {
    const res = await fetch(`/api/crm/tickets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ durum }) })
    if (res.ok) {
      setTickets((prev) => prev.map((t) => t.id === id ? { ...t, durum } : t))
      toast.success('Durum güncellendi')
    }
  }

  async function deleteTicket(id: string) {
    const res = await fetch(`/api/crm/tickets/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTickets((prev) => prev.filter((t) => t.id !== id))
      toast.success('Talep silindi')
    }
  }

  async function addProje() {
    if (!pForm.ad) { toast.error('Proje adı gerekli'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/crm/projeler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pForm) })
      if (res.ok) {
        const p = await res.json()
        const musteri = musteriler.find((m) => m.id === pForm.musteriId) ?? null
        setProjeler((prev) => [{ ...p, musteri: musteri ? { id: musteri.id, ad: musteri.ad } : null, adimlar: [] }, ...prev])
        setPForm({ musteriId: '', ad: '', aciklama: '' })
        setShowPForm(false)
        toast.success('Proje oluşturuldu')
      } else { toast.error('Hata oluştu') }
    } finally { setLoading(false) }
  }

  async function updateProjeDurum(id: string, durum: string) {
    const res = await fetch(`/api/crm/projeler/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ durum }) })
    if (res.ok) {
      setProjeler((prev) => prev.map((p) => p.id === id ? { ...p, durum } : p))
      toast.success('Durum güncellendi')
    }
  }

  async function deleteProje(id: string) {
    const res = await fetch(`/api/crm/projeler/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProjeler((prev) => prev.filter((p) => p.id !== id))
      toast.success('Proje silindi')
    }
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'musteriler', label: 'Müşteriler', count: musteriler.length },
    { key: 'tickets', label: 'Destek Talepleri', count: tickets.filter((t) => t.durum !== 'Kapalı').length },
    { key: 'projeler', label: 'Projeler', count: projeler.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🦊 Fox CRM</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Müşteri ilişkileri yönetimi</p>
        </div>
        {tab === 'musteriler' && <button onClick={() => setShowMForm(!showMForm)} className="text-sm px-4 py-2 btn-apple rounded-xl cursor-pointer">+ Müşteri</button>}
        {tab === 'tickets' && <button onClick={() => setShowTForm(!showTForm)} className="text-sm px-4 py-2 btn-apple rounded-xl cursor-pointer">+ Talep</button>}
        {tab === 'projeler' && <button onClick={() => setShowPForm(!showPForm)} className="text-sm px-4 py-2 btn-apple rounded-xl cursor-pointer">+ Proje</button>}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border/60">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 text-sm font-medium py-3 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Müşteriler */}
        {tab === 'musteriler' && (
          <>
            {showMForm && (
              <div className="p-5 border-b border-border/40 bg-black/2 dark:bg-white/2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Ad Soyad *', key: 'ad', placeholder: 'Müşteri adı' },
                    { label: 'E-posta', key: 'email', placeholder: 'mail@ornek.com' },
                    { label: 'Telefon', key: 'telefon', placeholder: '05xx' },
                    { label: 'Şirket', key: 'sirket', placeholder: 'Şirket adı' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                      <input type="text" placeholder={placeholder} value={mForm[key as keyof typeof mForm]}
                        onChange={(e) => setMForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground block mb-1">Notlar</label>
                    <textarea value={mForm.notlar} onChange={(e) => setMForm((f) => ({ ...f, notlar: e.target.value }))}
                      rows={2} placeholder="Opsiyonel notlar"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowMForm(false)} className="px-3 py-1.5 text-xs rounded-xl border border-border cursor-pointer">İptal</button>
                  <button onClick={addMusteri} disabled={loading} className="px-4 py-1.5 text-xs rounded-xl btn-apple cursor-pointer disabled:opacity-40">Kaydet</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border/40">
                  {['Müşteri', 'İletişim', 'Talep', 'Proje', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {musteriler.map((m) => (
                  <tr key={m.id} className="border-b border-border/30 last:border-0 hover:bg-black/2 dark:hover:bg-white/2">
                    <td className="px-5 py-3">
                      <div className="font-medium">{m.ad}</div>
                      {m.sirket && <div className="text-xs text-muted-foreground">{m.sirket}</div>}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {m.email && <div>{m.email}</div>}
                      {m.telefon && <div>{m.telefon}</div>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">{m._count.tickets} talep</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">{m._count.projeler} proje</span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteMusteri(m.id)} className="text-xs text-muted-foreground hover:text-red-500 cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}
                {musteriler.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">Henüz müşteri yok</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* Tickets */}
        {tab === 'tickets' && (
          <>
            {showTForm && (
              <div className="p-5 border-b border-border/40 bg-black/2 dark:bg-white/2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Müşteri</label>
                    <select value={tForm.musteriId} onChange={(e) => setTForm((f) => ({ ...f, musteriId: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Seçin (opsiyonel)</option>
                      {musteriler.map((m) => <option key={m.id} value={m.id}>{m.ad}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Öncelik</label>
                    <select value={tForm.oncelik} onChange={(e) => setTForm((f) => ({ ...f, oncelik: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {['Düşük', 'Normal', 'Yüksek', 'Kritik'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground block mb-1">Konu *</label>
                    <input type="text" placeholder="Talep konusu" value={tForm.konu} onChange={(e) => setTForm((f) => ({ ...f, konu: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground block mb-1">İçerik *</label>
                    <textarea value={tForm.icerik} onChange={(e) => setTForm((f) => ({ ...f, icerik: e.target.value }))}
                      rows={3} placeholder="Talep detayları"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowTForm(false)} className="px-3 py-1.5 text-xs rounded-xl border border-border cursor-pointer">İptal</button>
                  <button onClick={addTicket} disabled={loading} className="px-4 py-1.5 text-xs rounded-xl btn-apple cursor-pointer disabled:opacity-40">Kaydet</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border/40">
                  {['Konu', 'Müşteri', 'Öncelik', 'Durum', 'Tarih', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-border/30 last:border-0 hover:bg-black/2 dark:hover:bg-white/2">
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{t.konu}</div>
                      <div className="text-xs text-muted-foreground">{t._count.yanitlar} yanıt</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{t.musteri?.ad ?? '—'}</td>
                    <td className="px-5 py-3 text-xs font-medium">
                      <span className={ONCELIK_COLORS[t.oncelik]}>{t.oncelik}</span>
                    </td>
                    <td className="px-5 py-3">
                      <select value={t.durum} onChange={(e) => updateTicketDurum(t.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${TICKET_DURUM_COLORS[t.durum] ?? ''}`}>
                        {['Yeni', 'İşlemde', 'Çözüldü', 'Kapalı'].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteTicket(t.id)} className="text-xs text-muted-foreground hover:text-red-500 cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">Henüz talep yok</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* Projeler */}
        {tab === 'projeler' && (
          <>
            {showPForm && (
              <div className="p-5 border-b border-border/40 bg-black/2 dark:bg-white/2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Müşteri</label>
                    <select value={pForm.musteriId} onChange={(e) => setPForm((f) => ({ ...f, musteriId: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Seçin (opsiyonel)</option>
                      {musteriler.map((m) => <option key={m.id} value={m.id}>{m.ad}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Proje Adı *</label>
                    <input type="text" placeholder="Proje adı" value={pForm.ad} onChange={(e) => setPForm((f) => ({ ...f, ad: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground block mb-1">Açıklama</label>
                    <textarea value={pForm.aciklama} onChange={(e) => setPForm((f) => ({ ...f, aciklama: e.target.value }))}
                      rows={2} placeholder="Proje açıklaması"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowPForm(false)} className="px-3 py-1.5 text-xs rounded-xl border border-border cursor-pointer">İptal</button>
                  <button onClick={addProje} disabled={loading} className="px-4 py-1.5 text-xs rounded-xl btn-apple cursor-pointer disabled:opacity-40">Kaydet</button>
                </div>
              </div>
            )}
            <div className="divide-y divide-border/30">
              {projeler.map((p) => {
                const done = p.adimlar.filter((a) => a.durum === 'Tamamlandı').length
                const total = p.adimlar.length
                return (
                  <div key={p.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{p.ad}</h3>
                        {p.musteri && <p className="text-xs text-muted-foreground">{p.musteri.ad}</p>}
                        {p.aciklama && <p className="text-xs text-muted-foreground mt-0.5">{p.aciklama}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={p.durum} onChange={(e) => updateProjeDurum(p.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${PROJE_DURUM_COLORS[p.durum] ?? ''}`}>
                          {['Devam Ediyor', 'Tamamlandı', 'Beklemede', 'İptal'].map((d) => <option key={d}>{d}</option>)}
                        </select>
                        <button onClick={() => deleteProje(p.id)} className="text-xs text-muted-foreground hover:text-red-500 cursor-pointer">✕</button>
                      </div>
                    </div>
                    {total > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>İlerleme</span>
                          <span>{done}/{total} adım</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {projeler.length === 0 && (
                <div className="p-10 text-center text-sm text-muted-foreground">Henüz proje yok</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
