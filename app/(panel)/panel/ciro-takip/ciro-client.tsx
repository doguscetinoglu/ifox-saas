'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type CiroKayit = {
  id: string
  tarih: string
  tutar: number
  kategori: string | null
  aciklama: string | null
}

type CiroHedef = {
  gunluk: number
  haftalik: number
  aylik: number
} | null

type Props = {
  kayitlar: CiroKayit[]
  hedef: CiroHedef
  bugün: number
  hafta: number
  ay: number
}

const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="mt-2 h-1.5 rounded-full bg-white/20">
      <div className="h-full rounded-full bg-white/70 transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

function HedefModal({ hedef, onClose, onSave }: { hedef: CiroHedef; onClose: () => void; onSave: (h: CiroHedef) => void }) {
  const [gunluk, setGunluk] = useState(String(hedef?.gunluk || ''))
  const [haftalik, setHaftalik] = useState(String(hedef?.haftalik || ''))
  const [aylik, setAylik] = useState(String(hedef?.aylik || ''))
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch('/api/ciro/hedef', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gunluk, haftalik, aylik }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Hedefler kaydedildi')
        onSave(data)
        onClose()
      } else {
        toast.error('Hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-base mb-4">Hedef Belirle</h2>
        {[
          { label: 'Günlük Hedef (₺)', val: gunluk, set: setGunluk },
          { label: 'Haftalık Hedef (₺)', val: haftalik, set: setHaftalik },
          { label: 'Aylık Hedef (₺)', val: aylik, set: setAylik },
        ].map(({ label, val, set }) => (
          <div key={label} className="mb-3">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
            <input
              type="number"
              value={val}
              onChange={(e) => set(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-border text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">İptal</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 btn-apple h-10 text-sm cursor-pointer disabled:opacity-40">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CiroClient({ kayitlar: initial, hedef: initialHedef, bugün: b, hafta: h, ay: a }: Props) {
  const [kayitlar, setKayitlar] = useState(initial)
  const [hedef, setHedef] = useState(initialHedef)
  const [bugün, setBugün] = useState(b)
  const [hafta, setHafta] = useState(h)
  const [ay, setAy] = useState(a)
  const [showForm, setShowForm] = useState(false)
  const [showHedef, setShowHedef] = useState(false)
  const [form, setForm] = useState({ tarih: new Date().toISOString().split('T')[0], tutar: '', kategori: '', aciklama: '' })
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!form.tutar) { toast.error('Tutar girin'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ciro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const kayit = await res.json()
        setKayitlar((prev) => [kayit, ...prev])
        const tutar = parseFloat(form.tutar)
        const tarih = new Date(form.tarih)
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6); weekAgo.setHours(0, 0, 0, 0)
        if (tarih >= today) setBugün((v) => v + tutar)
        if (tarih >= weekAgo) setHafta((v) => v + tutar)
        setAy((v) => v + tutar)
        setForm({ tarih: new Date().toISOString().split('T')[0], tutar: '', kategori: '', aciklama: '' })
        setShowForm(false)
        toast.success('Ciro kaydedildi')
      } else {
        toast.error('Hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, tutar: number, tarihStr: string) {
    const res = await fetch(`/api/ciro/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setKayitlar((prev) => prev.filter((k) => k.id !== id))
      const tarih = new Date(tarihStr)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6); weekAgo.setHours(0, 0, 0, 0)
      if (tarih >= today) setBugün((v) => v - tutar)
      if (tarih >= weekAgo) setHafta((v) => v - tutar)
      setAy((v) => v - tutar)
      toast.success('Kayıt silindi')
    }
  }

  const stats = [
    { label: 'Bugün', value: bugün, hedef: hedef?.gunluk, gradient: 'stat-blue' },
    { label: 'Bu Hafta', value: hafta, hedef: hedef?.haftalik, gradient: 'stat-green' },
    { label: 'Bu Ay', value: ay, hedef: hedef?.aylik, gradient: 'stat-violet' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">📈 Ciro Takip</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Aylık ciro performansınız</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHedef(true)}
            className="text-sm px-4 py-2 rounded-xl glass border border-border/40 hover:bg-primary/5 transition-colors cursor-pointer">
            🎯 Hedef
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="text-sm px-4 py-2 rounded-xl btn-apple cursor-pointer">
            + Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.gradient} rounded-2xl p-5 text-white`}>
            <p className="text-sm text-white/70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">₺{fmt(s.value)}</p>
            {s.hedef ? (
              <>
                <p className="text-xs text-white/60 mt-1">Hedef: ₺{fmt(s.hedef)}</p>
                <ProgressBar value={s.value} max={s.hedef} />
              </>
            ) : (
              <p className="text-xs text-white/40 mt-1">Hedef belirlenmedi</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Yeni Ciro Kaydı</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Tarih</label>
              <input type="date" value={form.tarih} onChange={(e) => setForm((f) => ({ ...f, tarih: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Tutar (₺)</label>
              <input type="number" placeholder="0.00" value={form.tutar} onChange={(e) => setForm((f) => ({ ...f, tutar: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Kategori</label>
              <input type="text" placeholder="Opsiyonel" value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Açıklama</label>
              <input type="text" placeholder="Opsiyonel" value={form.aciklama} onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">İptal</button>
            <button onClick={handleAdd} disabled={loading} className="btn-apple px-5 py-2 text-sm rounded-xl cursor-pointer disabled:opacity-40">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60">
          <h2 className="text-sm font-semibold">Bu Ayki Kayıtlar</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border/40">
                {['Tarih', 'Tutar', 'Kategori', 'Açıklama', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kayitlar.map((k) => (
                <tr key={k.id} className="border-b border-border/30 last:border-0 hover:bg-black/2 dark:hover:bg-white/2">
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(k.tarih).toLocaleDateString('tr-TR')}</td>
                  <td className="px-5 py-3 font-semibold text-green-500">₺{fmt(k.tutar)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{k.kategori || '—'}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{k.aciklama || '—'}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(k.id, k.tutar, k.tarih)}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">✕</button>
                  </td>
                </tr>
              ))}
              {kayitlar.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">Bu ay kayıt yok. İlk kaydı ekleyin!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showHedef && <HedefModal hedef={hedef} onClose={() => setShowHedef(false)} onSave={setHedef} />}
    </div>
  )
}
