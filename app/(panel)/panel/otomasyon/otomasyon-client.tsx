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
  { icon: '📢', title: 'Yayın Mesajları', desc: "Tüm abone listesine veya segmentlere anlık kampanya mesajı gönderin." },
  { icon: '🏷️', title: 'Etiket Sistemi', desc: 'Kullanıcıları davranışlarına göre etiketleyin, segmentlere ayırın, hedefli mesajlar gönderin.' },
  { icon: '📥', title: 'Lead Capture', desc: 'Instagram DM, Messenger ve WhatsApp üzerinden otomatik lead toplama formu oluşturun.' },
  { icon: '🔀', title: 'A/B Testi', desc: 'Farklı mesaj versiyonlarını test edin, en yüksek dönüşüm sağlayan akışı belirleyin.' },
  { icon: '📊', title: 'Analitik', desc: 'Abone büyümesi, mesaj açılma oranı ve tıklama verilerini gerçek zamanlı izleyin.' },
  { icon: '🛒', title: 'E-ticaret', desc: 'Ürün kataloğu bağlama, sipariş takibi ve terk edilen sepet mesajları gönderin.' },
  { icon: '🔗', title: 'Growth Tools', desc: 'Yorum yanıtlama, link tıklama, hikaye mention gibi otomatik abone kazanma araçları.' },
]

const N8N_STEPS = [
  { icon: '⚡', title: 'Webhook Tetikleyici', desc: 'Instagram, ManyChat veya harici sistemden gelen veri ile akışı başlatın.' },
  { icon: '🔍', title: 'Veri Filtreleme', desc: "Gelen veriyi ayrıştırın, koşullara göre farklı dallara yönlendirin." },
  { icon: '🔄', title: 'Veri Dönüştürme', desc: 'JSON parse, metin işleme, tarih formatı çevirme gibi veri manipülasyonu yapın.' },
  { icon: '🌐', title: 'API Bağlantısı', desc: 'REST API, GraphQL veya database\'e bağlanarak veri okuyun/yazın.' },
  { icon: '📱', title: 'Bildirim Gönder', desc: "E-posta, SMS, WhatsApp veya Slack üzerinden otomatik bildirim gönderin." },
  { icon: '⏰', title: 'Zamanlama', desc: 'Cron job ile belirli saatlerde veya aralıklarla otomatik akış çalıştırın.' },
]

const FLOW_NODES = [
  { label: 'Tetikleyici', sub: 'IG DM / Webhook', color: '#6366f1', icon: '⚡' },
  { label: 'Koşul', sub: 'Anahtar Kelime?', color: '#f59e0b', icon: '❓' },
  { label: 'İşlem', sub: 'Veri Hazırla', color: '#8b5cf6', icon: '⚙️' },
  { label: 'Aksiyon', sub: 'Yanıt / API', color: '#10b981', icon: '✅' },
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

function N8NFlow() {
  const [activeNode, setActiveNode] = useState<number | null>(null)
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-3">Tipik N8N iş akışı — düğmelere tıklayın</p>
      <div className="flex items-center gap-1 overflow-x-auto pb-2 min-w-0">
        {FLOW_NODES.map((node, i) => (
          <div key={i} className="flex items-center shrink-0">
            <button
              onClick={() => setActiveNode(activeNode === i ? null : i)}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div
                className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 border-2"
                style={{
                  background: activeNode === i ? node.color : `${node.color}22`,
                  borderColor: node.color,
                  transform: activeNode === i ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span className="text-lg leading-none">{node.icon}</span>
                <span className="text-[9px] font-bold text-white leading-none hidden group-hover:block">
                  {node.label}
                </span>
              </div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: node.color }}>
                {node.label}
              </span>
            </button>
            {i < FLOW_NODES.length - 1 && (
              <div className="w-6 h-px mx-1 shrink-0" style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
            )}
          </div>
        ))}
      </div>
      {activeNode !== null && (
        <div className="mt-3 p-3 rounded-xl text-sm border" style={{ borderColor: FLOW_NODES[activeNode].color, background: `${FLOW_NODES[activeNode].color}11` }}>
          <p className="font-semibold" style={{ color: FLOW_NODES[activeNode].color }}>{FLOW_NODES[activeNode].label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{FLOW_NODES[activeNode].sub}</p>
        </div>
      )}
    </div>
  )
}

export default function OtomasyonClient({ talepler: initial }: { talepler: Talep[] }) {
  const [talepler, setTalepler] = useState(initial)
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState<'manychat' | 'n8n' | 'both'>('both')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!description.trim()) { toast.error('Açıklama girin'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/otomasyon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: `[${platform.toUpperCase()}] ${description}` }),
      })
      if (res.ok) {
        const t = await res.json()
        setTalepler((prev) => [t, ...prev])
        setDescription('')
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
          <p className="text-sm text-muted-foreground mt-0.5">ManyChat + N8N ile iş akışlarınızı otomatikleştirin</p>
        </div>
        <div className="flex items-center gap-1.5 glass-subtle px-1.5 py-1.5 rounded-xl border border-border/40">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
          <span className="text-xs text-muted-foreground pr-2">Aktif Abonelik</span>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ManyChat Card */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50" style={{ background: 'linear-gradient(135deg,rgba(0,120,255,0.08),rgba(0,80,200,0.04))' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'linear-gradient(135deg,#0078ff,#0050c8)' }}>
              💬
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm">ManyChat</h2>
              <p className="text-xs text-muted-foreground">Instagram DM · Messenger · WhatsApp</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-500 font-medium shrink-0">Destekleniyor</span>
          </div>

          <div className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              ManyChat ile sosyal medya kanallarınızda tam otomatik bot akışları kurun. Müşteri sorularını 7/24 yanıtlayın, lead toplayın, satış yapın.
            </p>

            <Accordion title="Özellikler (8 modül)" icon="⚡" defaultOpen>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {MANYCHAT_FEATURES.map((f) => (
                  <div key={f.title} className="group relative p-2.5 rounded-xl border border-border/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-default">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{f.icon}</span>
                      <span className="text-xs font-semibold">{f.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed hidden group-hover:block absolute inset-0 bg-background/95 dark:bg-background/95 rounded-xl p-2.5 z-10 border border-blue-500/20">
                      <span className="font-semibold text-foreground block mb-1">{f.icon} {f.title}</span>
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Desteklenen Platformlar" icon="🌐">
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: 'Instagram DM', color: '#e1306c' },
                  { label: 'Facebook Messenger', color: '#1877f2' },
                  { label: 'WhatsApp Business', color: '#25d366' },
                  { label: 'Telegram', color: '#26a5e4' },
                  { label: 'SMS', color: '#6366f1' },
                  { label: 'E-posta', color: '#f59e0b' },
                ].map((p) => (
                  <span key={p.label} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: `${p.color}20`, color: p.color }}>
                    {p.label}
                  </span>
                ))}
              </div>
            </Accordion>

            <Accordion title="Örnek Akışlar" icon="📋">
              <div className="space-y-1.5 mt-2">
                {[
                  'Story mention → Otomatik DM gönder',
                  'Yorum yap → Özel link gönder',
                  '"Fiyat" yaz → Ürün kataloğu aç',
                  'Yeni takipçi → Hoş geldin akışı',
                  'Terk edilen sepet → Hatırlatma mesajı',
                  'Form doldur → CRM\'e kaydet + bildirim',
                ].map((ex) => (
                  <div key={ex} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-blue-500 shrink-0 mt-0.5">→</span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        </div>

        {/* N8N Card */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50" style={{ background: 'linear-gradient(135deg,rgba(234,88,12,0.08),rgba(180,60,0,0.04))' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'linear-gradient(135deg,#ea580c,#c2410c)' }}>
              ⚙️
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm">N8N Entegrasyonu</h2>
              <p className="text-xs text-muted-foreground">İleri Düzey İş Akışı Otomasyonu</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-500 font-medium shrink-0">Destekleniyor</span>
          </div>

          <div className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              N8N ile 400+ uygulama arasında sınırsız otomasyon kurun. API&apos;leri birbirine bağlayın, verileri işleyin, karmaşık iş süreçlerini otomatikleştirin.
            </p>

            <N8NFlow />

            <Accordion title="Otomasyon Adımları" icon="🔧" defaultOpen>
              <div className="space-y-2 mt-2">
                {N8N_STEPS.map((s, i) => (
                  <div key={s.title} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-orange-500/5 transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: 'rgba(234,88,12,0.15)' }}>
                      <span>{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-orange-500">ADIM {i + 1}</span>
                        <span className="text-xs font-semibold">{s.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Entegrasyon Örnekleri" icon="🔗">
              <div className="space-y-1.5 mt-2">
                {[
                  'ManyChat → N8N → Airtable (lead kaydet)',
                  'Instagram webhook → Analiz → Rapor mail',
                  'Shopify sipariş → Muhasebe → Bildirim',
                  'Form dolumu → CRM + Slack uyarı',
                  'Zamanlanmış rapor → PDF → E-posta',
                  'Hata tespiti → Otomatik yeniden deneme',
                ].map((ex) => (
                  <div key={ex} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-orange-500 shrink-0 mt-0.5">⚙</span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center text-xs text-primary">?</span>
          Kurulum Süreci
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', icon: '📝', title: 'Talep Gönder', desc: 'İhtiyacınızı açıklayın, hangi platformu istediğinizi belirtin.' },
            { step: '02', icon: '📞', title: '24s İçinde İletişim', desc: 'Uzman ekibimiz sizi arayarak gereksinimleri analiz eder.' },
            { step: '03', icon: '🛠️', title: 'Kurulum & Test', desc: 'Ekibimiz otomasyonu kurar, test eder ve size teslim eder.' },
            { step: '04', icon: '✅', title: 'Canlıya Al', desc: 'Otomasyon aktif olur, 7/24 sizin için çalışır.' },
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

        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Platform Seçin</label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'manychat', label: '💬 ManyChat', color: '#0078ff' },
              { key: 'n8n', label: '⚙️ N8N', color: '#ea580c' },
              { key: 'both', label: '🔗 İkisi Birlikte', color: '#8b5cf6' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPlatform(p.key as typeof platform)}
                className="text-xs px-4 py-2 rounded-xl font-medium transition-all cursor-pointer border"
                style={{
                  borderColor: platform === p.key ? p.color : 'transparent',
                  background: platform === p.key ? `${p.color}20` : 'rgba(0,0,0,0.05)',
                  color: platform === p.key ? p.color : undefined,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Neye ihtiyacınız var?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={
            platform === 'manychat'
              ? 'Örn: Instagram\'da yorum yapanlara otomatik DM göndermek istiyorum. Belirli anahtar kelime içeren yorumlara özel link paylaşılsın...'
              : platform === 'n8n'
              ? 'Örn: Yeni sipariş geldiğinde otomatik olarak muhasebe sistemine kayıt açılsın ve bana Slack bildirimi gelsin...'
              : 'Örn: ManyChat\'teki bot akışından toplanan lead\'ler, N8N üzerinden CRM\'e aktarılsın ve e-posta bildirimi gelsin...'
          }
          className="w-full px-4 py-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">Ne kadar detaylı açıklarsanız o kadar hızlı kurulum yapılır.</p>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-apple px-6 py-2.5 text-sm rounded-xl cursor-pointer disabled:opacity-40 shrink-0">
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
                  <p className="text-xs text-muted-foreground mt-1.5">{new Date(t.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
