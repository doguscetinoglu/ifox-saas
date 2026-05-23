'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type Talep = {
  id: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'REJECTED'
  notes: string | null
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Beklemede', cls: 'bg-amber-500/15 text-amber-500' },
  IN_PROGRESS: { label: 'İşlemde', cls: 'bg-blue-500/15 text-blue-500' },
  DONE: { label: 'Tamamlandı', cls: 'bg-green-500/15 text-green-500' },
  REJECTED: { label: 'Reddedildi', cls: 'bg-red-500/15 text-red-500' },
}

const MANYCHAT_FEATURES = [
  { icon: '💬', title: 'Bot Akışları', desc: 'Anahtar kelimeye, butona veya tetikleyiciye göre kişiselleştirilmiş konuşma akışları oluşturun.' },
  { icon: '📢', title: 'Yayın Mesajları', desc: 'Tüm abone listesine veya segmentlere anlık kampanya mesajı gönderin.' },
  { icon: '🏷️', title: 'Etiket Sistemi', desc: 'Kullanıcıları davranışlarına göre etiketleyin, segmentlere ayırın, hedefli mesajlar gönderin.' },
  { icon: '📥', title: 'Lead Capture', desc: 'Instagram DM, Messenger ve WhatsApp üzerinden otomatik lead toplama formu oluşturun.' },
  { icon: '🔀', title: 'A/B Testi', desc: 'Farklı mesaj versiyonlarını test edin, en yüksek dönüşüm sağlayan akışı belirleyin.' },
  { icon: '📊', title: 'Analitik', desc: 'Abone büyümesi, mesaj açılma oranı ve tıklama verilerini gerçek zamanlı izleyin.' },
  { icon: '🛒', title: 'E-ticaret', desc: 'Ürün kataloğu bağlama, sipariş takibi ve terk edilen sepet mesajları gönderin.' },
  { icon: '🔗', title: 'Growth Tools', desc: 'Yorum yanıtlama, link tıklama, hikaye mention gibi otomatik abone kazanma araçları.' },
]

const EXAMPLE_FLOWS = [
  'Story mention → Otomatik DM gönder',
  'Yorum yap → Özel link gönder',
  '"Fiyat" yaz → Ürün kataloğu aç',
  'Yeni takipçi → Hoş geldin akışı',
  'Terk edilen sepet → Hatırlatma mesajı',
  'Form doldur → CRM\'e kaydet + bildirim',
  'Kelime tetikleyici → Destek botu başlat',
  'Reel yorum → Otomatik lead kaydı',
]

const PLATFORMS = [
  { label: 'Instagram DM', color: '#e1306c' },
  { label: 'Facebook Messenger', color: '#1877f2' },
  { label: 'WhatsApp Business', color: '#25d366' },
  { label: 'Telegram', color: '#26a5e4' },
  { label: 'SMS', color: '#6366f1' },
  { label: 'E-posta', color: '#f59e0b' },
]

function Accordion({ title, icon, children, defaultOpen = false }: {
  title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/3 dark:hover:bg-white/3 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2 font-medium text-sm">
          <span>{icon}</span> {title}
        </span>
        <span className={`text-muted-foreground text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  )
}

export default function OtomasyonClient({ talepler: initial }: { talepler: Talep[] }) {
  const [talepler, setTalepler] = useState(initial)
  const [description, setDescription] = useState('')
  const [selectedFlow, setSelectedFlow] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const full = selectedFlow ? `[${selectedFlow}] ${description}` : description
    if (!full.trim()) { toast.error('Açıklama girin'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/otomasyon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: full }),
      })
      if (res.ok) {
        const t = await res.json()
        setTalepler((prev) => [t, ...prev])
        setDescription('')
        setSelectedFlow('')
        toast.success('Talep gönderildi! Ekibimiz 24 saat içinde sizinle iletişime geçecek.')
      } else {
        toast.error('Hata oluştu')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🤖 Sosyal Medya Otomasyonu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ManyChat ile Instagram, Messenger ve WhatsApp bot akışları</p>
        </div>
        <div className="flex items-center gap-1.5 glass-subtle px-3 py-1.5 rounded-xl border border-border/40">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Aktif Abonelik</span>
        </div>
      </div>

      {/* ManyChat Info Card */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50"
          style={{ background: 'linear-gradient(135deg,rgba(0,120,255,0.08),rgba(0,80,200,0.04))' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'linear-gradient(135deg,#0078ff,#0050c8)' }}>
            💬
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm">ManyChat — Sosyal Medya Bot Platformu</h2>
            <p className="text-xs text-muted-foreground">7/24 otomatik yanıt · Lead toplama · Kampanya yönetimi</p>
          </div>
          <a href="https://manychat.com" target="_blank" rel="noopener noreferrer"
            className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-500 font-medium shrink-0 hover:bg-blue-500/25 transition-colors">
            manychat.com ↗
          </a>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            ManyChat ile sosyal medya kanallarınızda tam otomatik bot akışları kurun. Müşteri sorularını 7/24 yanıtlayın,
            lead toplayın, kampanya gönderin — tüm bunları siz uyurken bile yapın.
          </p>

          <Accordion title="Özellikler (8 Modül)" icon="⚡" defaultOpen>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {MANYCHAT_FEATURES.map((f) => (
                <div key={f.title} className="group relative p-2.5 rounded-xl border border-border/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{f.icon}</span>
                    <span className="text-xs font-semibold">{f.title}</span>
                  </div>
                  <div className="hidden group-hover:flex absolute inset-0 bg-background/96 rounded-xl p-3 z-10 border border-blue-500/20 flex-col justify-center">
                    <span className="font-semibold text-xs block mb-1">{f.icon} {f.title}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Desteklenen Platformlar" icon="🌐">
            <div className="flex flex-wrap gap-2 mt-2">
              {PLATFORMS.map((p) => (
                <span key={p.label} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${p.color}20`, color: p.color }}>
                  {p.label}
                </span>
              ))}
            </div>
          </Accordion>

          <Accordion title="Örnek Bot Akışları" icon="📋">
            <div className="space-y-1.5 mt-2">
              {EXAMPLE_FLOWS.map((ex) => (
                <div key={ex} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-blue-500 shrink-0 mt-0.5">→</span>
                  <span>{ex}</span>
                </div>
              ))}
            </div>
          </Accordion>
        </div>
      </div>

      {/* Example flow quick select */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-sm mb-3">💡 Hızlı Akış Seçin (Opsiyonel)</h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_FLOWS.slice(0, 6).map((flow) => (
            <button
              key={flow}
              onClick={() => setSelectedFlow(selectedFlow === flow ? '' : flow)}
              className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border"
              style={{
                borderColor: selectedFlow === flow ? '#0078ff' : 'transparent',
                background: selectedFlow === flow ? 'rgba(0,120,255,0.12)' : 'rgba(0,0,0,0.04)',
                color: selectedFlow === flow ? '#0078ff' : undefined,
              }}
            >
              {flow}
            </button>
          ))}
        </div>
      </div>

      {/* Kurulum steps */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center text-xs text-blue-500">?</span>
          Kurulum Süreci
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', icon: '📝', title: 'Talep Gönder', desc: 'İhtiyacınızı açıklayın, hangi akışı istediğinizi belirtin.' },
            { step: '02', icon: '📞', title: '24s İçinde İletişim', desc: 'ManyChat uzmanımız sizi arayarak süreci planlar.' },
            { step: '03', icon: '🛠️', title: 'Bot Kurulumu', desc: 'Akışlar kurulur, test edilir ve size teslim edilir.' },
            { step: '04', icon: '✅', title: 'Canlıya Al', desc: 'Bot aktif olur, 7/24 müşterilerinize yanıt verir.' },
          ].map((s) => (
            <div key={s.step} className="relative flex flex-col items-center text-center p-4 rounded-xl bg-black/3 dark:bg-white/3">
              <span className="absolute top-3 left-3 text-[10px] font-bold text-muted-foreground/50">{s.step}</span>
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-xl mb-2 mt-2">{s.icon}</div>
              <p className="text-xs font-semibold mb-1">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Request Form */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-sm mb-4">🚀 Yeni Otomasyon Talebi</h2>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Neye ihtiyacınız var?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={
            selectedFlow
              ? `"${selectedFlow}" akışı için detaylı açıklama yazın... Örn: Hangi anahtar kelimelere yanıt vermeli? Mesajın tonu nasıl olmalı?`
              : 'Örn: Instagram\'da yorum yapanlara otomatik DM göndermek istiyorum. "Bilgi al" yorumuna özel link paylaşılsın, kullanıcı botu başlatabilsin...'
          }
          className="w-full px-4 py-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
        />
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">Ne kadar detaylı açıklarsanız o kadar hızlı kurulum yapılır.</p>
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 py-2.5 text-sm rounded-xl cursor-pointer disabled:opacity-40 shrink-0 font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#0078ff,#0050c8)' }}>
            {loading ? 'Gönderiliyor...' : '📤 Talebi Gönder'}
          </button>
        </div>
      </div>

      {/* Request History */}
      {talepler.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Taleplerim</h2>
            <span className="text-xs text-muted-foreground">{talepler.length} talep</span>
          </div>
          <div className="divide-y divide-border/30">
            {talepler.map((t) => {
              const s = STATUS_MAP[t.status]
              return (
                <div key={t.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-relaxed">{t.description || '—'}</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                  </div>
                  {t.notes && (
                    <p className="text-xs text-muted-foreground mt-2 bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2 leading-relaxed">
                      📝 {t.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(t.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
