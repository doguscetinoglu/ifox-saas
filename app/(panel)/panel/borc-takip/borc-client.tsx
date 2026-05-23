'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type Borc = {
  id: string
  belgeNo: string | null
  tutar: number
  vadeTarihi: string
  belgeTarihi: string
  durum: 'BEKLIYOR' | 'KISMI' | 'ODENDI' | 'GECIKTI'
  aciklama: string | null
}

type Odeme = {
  id: string
  tutar: number
  odenmeTarihi: string
  yontem: string | null
}

type Musteri = {
  id: string
  kod: string
  ad: string
  telefon: string | null
  email: string | null
  sehir: string | null
  borclar: Borc[]
  odemeler: Odeme[]
}

const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const DURUM_LABELS: Record<string, string> = { BEKLIYOR: 'Bekliyor', KISMI: 'Kısmi', ODENDI: 'Ödendi', GECIKTI: 'Gecikmeli' }
const DURUM_COLORS: Record<string, string> = {
  BEKLIYOR: 'bg-amber-500/15 text-amber-500',
  KISMI: 'bg-blue-500/15 text-blue-500',
  ODENDI: 'bg-green-500/15 text-green-500',
  GECIKTI: 'bg-red-500/15 text-red-500',
}

export default function BorcClient({ musteriler: initial }: { musteriler: Musteri[] }) {
  const [musteriler, setMusteriler] = useState(initial)
  const [selected, setSelected] = useState<Musteri | null>(initial[0] ?? null)
  const [tab, setTab] = useState<'borclar' | 'odemeler'>('borclar')

  const [showMusteri, setShowMusteri] = useState(false)
  const [showBorc, setShowBorc] = useState(false)
  const [showOdeme, setShowOdeme] = useState(false)

  const [mForm, setMForm] = useState({ kod: '', ad: '', telefon: '', email: '', sehir: '' })
  const [bForm, setBForm] = useState({ tutar: '', vadeTarihi: '', belgeTarihi: new Date().toISOString().split('T')[0], belgeNo: '', aciklama: '' })
  const [oForm, setOForm] = useState({ tutar: '', odenmeTarihi: new Date().toISOString().split('T')[0], yontem: '', aciklama: '' })
  const [loading, setLoading] = useState(false)

  const selectedFull = musteriler.find((m) => m.id === selected?.id) ?? null

  async function addMusteri() {
    if (!mForm.kod || !mForm.ad) { toast.error('Kod ve ad gerekli'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/borc/musteriler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mForm) })
      if (res.ok) {
        const m: Musteri = { ...(await res.json()), borclar: [], odemeler: [] }
        setMusteriler((prev) => [...prev, m].sort((a, b) => a.ad.localeCompare(b.ad)))
        setSelected(m)
        setMForm({ kod: '', ad: '', telefon: '', email: '', sehir: '' })
        setShowMusteri(false)
        toast.success('Müşteri eklendi')
      } else {
        const d = await res.json(); toast.error(d.error)
      }
    } finally { setLoading(false) }
  }

  async function addBorc() {
    if (!selectedFull || !bForm.tutar || !bForm.vadeTarihi) { toast.error('Zorunlu alanlar eksik'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/borc/borclar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bForm, musteriId: selectedFull.id }),
      })
      if (res.ok) {
        const borc = await res.json()
        setMusteriler((prev) => prev.map((m) => m.id === selectedFull.id ? { ...m, borclar: [...m.borclar, borc] } : m))
        setBForm({ tutar: '', vadeTarihi: '', belgeTarihi: new Date().toISOString().split('T')[0], belgeNo: '', aciklama: '' })
        setShowBorc(false)
        toast.success('Borç eklendi')
      } else { toast.error('Hata oluştu') }
    } finally { setLoading(false) }
  }

  async function addOdeme() {
    if (!selectedFull || !oForm.tutar || !oForm.odenmeTarihi) { toast.error('Zorunlu alanlar eksik'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/borc/odemeler', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...oForm, musteriId: selectedFull.id }),
      })
      if (res.ok) {
        const odeme = await res.json()
        setMusteriler((prev) => prev.map((m) => m.id === selectedFull.id ? { ...m, odemeler: [odeme, ...m.odemeler] } : m))
        setOForm({ tutar: '', odenmeTarihi: new Date().toISOString().split('T')[0], yontem: '', aciklama: '' })
        setShowOdeme(false)
        toast.success('Ödeme eklendi')
      } else { toast.error('Hata oluştu') }
    } finally { setLoading(false) }
  }

  async function updateDurum(borcId: string, durum: string) {
    const res = await fetch(`/api/borc/borclar/${borcId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ durum }) })
    if (res.ok) {
      setMusteriler((prev) => prev.map((m) => ({
        ...m, borclar: m.borclar.map((b) => b.id === borcId ? { ...b, durum: durum as Borc['durum'] } : b)
      })))
      toast.success('Durum güncellendi')
    }
  }

  async function deleteBorc(borcId: string) {
    const res = await fetch(`/api/borc/borclar/${borcId}`, { method: 'DELETE' })
    if (res.ok) {
      setMusteriler((prev) => prev.map((m) => ({ ...m, borclar: m.borclar.filter((b) => b.id !== borcId) })))
      toast.success('Borç silindi')
    }
  }

  const totalBorc = selectedFull?.borclar.filter((b) => b.durum !== 'ODENDI').reduce((s, b) => s + b.tutar, 0) ?? 0
  const totalOdeme = selectedFull?.odemeler.reduce((s, o) => s + o.tutar, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">💰 Borç Takip</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{musteriler.length} müşteri</p>
        </div>
        <button onClick={() => setShowMusteri(true)} className="text-sm px-4 py-2 rounded-xl btn-apple cursor-pointer">+ Müşteri</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Müşteri Listesi */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 text-sm font-semibold">Müşteriler</div>
          <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
            {musteriler.map((m) => {
              const bekleyen = m.borclar.filter((b) => b.durum !== 'ODENDI').reduce((s, b) => s + b.tutar, 0)
              return (
                <button key={m.id} onClick={() => setSelected(m)}
                  className={`w-full text-left px-4 py-3 hover:bg-black/3 dark:hover:bg-white/3 transition-colors ${selected?.id === m.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{m.ad}</span>
                    {bekleyen > 0 && <span className="text-xs font-semibold text-red-500">₺{fmt(bekleyen)}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.kod} {m.sehir ? `· ${m.sehir}` : ''}</p>
                </button>
              )
            })}
            {musteriler.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">Henüz müşteri yok</div>
            )}
          </div>
        </div>

        {/* Detay */}
        <div className="lg:col-span-2 space-y-4">
          {selectedFull ? (
            <>
              <div className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-lg">{selectedFull.ad}</h2>
                    <p className="text-xs text-muted-foreground">{selectedFull.kod}{selectedFull.telefon ? ` · ${selectedFull.telefon}` : ''}{selectedFull.email ? ` · ${selectedFull.email}` : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowOdeme(true); setTab('odemeler') }} className="text-xs px-3 py-1.5 rounded-xl glass border border-border/40 hover:bg-primary/5 cursor-pointer">+ Ödeme</button>
                    <button onClick={() => { setShowBorc(true); setTab('borclar') }} className="text-xs px-3 py-1.5 rounded-xl btn-apple cursor-pointer">+ Borç</button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1 text-center py-3 rounded-xl bg-red-500/8">
                    <p className="text-xs text-muted-foreground">Toplam Borç</p>
                    <p className="font-bold text-red-500 text-lg">₺{fmt(totalBorc)}</p>
                  </div>
                  <div className="flex-1 text-center py-3 rounded-xl bg-green-500/8">
                    <p className="text-xs text-muted-foreground">Toplam Ödeme</p>
                    <p className="font-bold text-green-500 text-lg">₺{fmt(totalOdeme)}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="flex border-b border-border/60">
                  {(['borclar', 'odemeler'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`flex-1 text-sm font-medium py-3 transition-colors cursor-pointer ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                      {t === 'borclar' ? `Borçlar (${selectedFull.borclar.length})` : `Ödemeler (${selectedFull.odemeler.length})`}
                    </button>
                  ))}
                </div>

                {tab === 'borclar' && (
                  <>
                    {showBorc && (
                      <div className="p-4 border-b border-border/40 bg-black/2 dark:bg-white/2">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Tutar (₺)', key: 'tutar', type: 'number' },
                            { label: 'Vade Tarihi', key: 'vadeTarihi', type: 'date' },
                            { label: 'Belge Tarihi', key: 'belgeTarihi', type: 'date' },
                            { label: 'Belge No', key: 'belgeNo', type: 'text' },
                          ].map(({ label, key, type }) => (
                            <div key={key}>
                              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                              <input type={type} value={bForm[key as keyof typeof bForm]}
                                onChange={(e) => setBForm((f) => ({ ...f, [key]: e.target.value }))}
                                className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setShowBorc(false)} className="px-3 py-1.5 text-xs rounded-xl border border-border cursor-pointer">İptal</button>
                          <button onClick={addBorc} disabled={loading} className="px-4 py-1.5 text-xs rounded-xl btn-apple cursor-pointer disabled:opacity-40">Kaydet</button>
                        </div>
                      </div>
                    )}
                    <table className="w-full text-sm min-w-[400px]">
                      <thead>
                        <tr className="border-b border-border/40">
                          {['Belge', 'Tutar', 'Vade', 'Durum', ''].map((h) => (
                            <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFull.borclar.map((b) => (
                          <tr key={b.id} className="border-b border-border/30 last:border-0">
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.belgeNo || '—'}</td>
                            <td className="px-4 py-2.5 font-semibold">₺{fmt(b.tutar)}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(b.vadeTarihi).toLocaleDateString('tr-TR')}</td>
                            <td className="px-4 py-2.5">
                              <select value={b.durum} onChange={(e) => updateDurum(b.id, e.target.value)}
                                className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${DURUM_COLORS[b.durum]}`}>
                                {Object.entries(DURUM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-2.5">
                              <button onClick={() => deleteBorc(b.id)} className="text-xs text-muted-foreground hover:text-red-500 cursor-pointer">✕</button>
                            </td>
                          </tr>
                        ))}
                        {selectedFull.borclar.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Borç kaydı yok</td></tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}

                {tab === 'odemeler' && (
                  <>
                    {showOdeme && (
                      <div className="p-4 border-b border-border/40 bg-black/2 dark:bg-white/2">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Tutar (₺)', key: 'tutar', type: 'number' },
                            { label: 'Ödeme Tarihi', key: 'odenmeTarihi', type: 'date' },
                            { label: 'Yöntem', key: 'yontem', type: 'text' },
                            { label: 'Açıklama', key: 'aciklama', type: 'text' },
                          ].map(({ label, key, type }) => (
                            <div key={key}>
                              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                              <input type={type} value={oForm[key as keyof typeof oForm]}
                                onChange={(e) => setOForm((f) => ({ ...f, [key]: e.target.value }))}
                                className="w-full h-9 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setShowOdeme(false)} className="px-3 py-1.5 text-xs rounded-xl border border-border cursor-pointer">İptal</button>
                          <button onClick={addOdeme} disabled={loading} className="px-4 py-1.5 text-xs rounded-xl btn-apple cursor-pointer disabled:opacity-40">Kaydet</button>
                        </div>
                      </div>
                    )}
                    <table className="w-full text-sm min-w-[400px]">
                      <thead>
                        <tr className="border-b border-border/40">
                          {['Tarih', 'Tutar', 'Yöntem', 'Açıklama'].map((h) => (
                            <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFull.odemeler.map((o) => (
                          <tr key={o.id} className="border-b border-border/30 last:border-0">
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(o.odenmeTarihi).toLocaleDateString('tr-TR')}</td>
                            <td className="px-4 py-2.5 font-semibold text-green-500">₺{fmt(o.tutar)}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{o.yontem || '—'}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">—</td>
                          </tr>
                        ))}
                        {selectedFull.odemeler.length === 0 && (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Ödeme kaydı yok</td></tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl p-12 text-center text-muted-foreground text-sm">
              Soldan bir müşteri seçin veya yeni müşteri ekleyin
            </div>
          )}
        </div>
      </div>

      {/* Müşteri Modal */}
      {showMusteri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowMusteri(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-base mb-4">Yeni Müşteri</h2>
            {[
              { label: 'Müşteri Kodu *', key: 'kod', placeholder: 'Örn: MST001' },
              { label: 'Ad Soyad / Ünvan *', key: 'ad', placeholder: 'Müşteri adı' },
              { label: 'Telefon', key: 'telefon', placeholder: '05xx' },
              { label: 'E-posta', key: 'email', placeholder: 'ornek@mail.com' },
              { label: 'Şehir', key: 'sehir', placeholder: 'İstanbul' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="mb-3">
                <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                <input type="text" placeholder={placeholder} value={mForm[key as keyof typeof mForm]}
                  onChange={(e) => setMForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowMusteri(false)} className="flex-1 h-10 rounded-xl border border-border text-sm cursor-pointer">İptal</button>
              <button onClick={addMusteri} disabled={loading} className="flex-1 btn-apple h-10 text-sm cursor-pointer disabled:opacity-40">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
