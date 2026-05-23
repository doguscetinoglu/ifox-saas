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

const N8N_STEPS = [
  { icon: '⚡', title: 'Webhook Tetikleyici', desc: 'Herhangi bir sistemden gelen veriyle akışı başlatın (HTTP, webhook, form).' },
  { icon: '🔍', title: 'Veri Filtreleme', desc: 'Gelen veriyi ayrıştırın, koşullara göre farklı dallara yönlendirin.' },
  { icon: '🔄', title: 'Veri Dönüştürme', desc: 'JSON parse, metin işleme, tarih formatı çevirme ve veri manipülasyonu.' },
  { icon: '🌐', title: 'API Bağlantısı', desc: 'REST API, GraphQL veya veritabanına bağlanarak okuma/yazma yapın.' },
  { icon: '📱', title: 'Bildirim Gönder', desc: 'E-posta, SMS, WhatsApp veya Slack üzerinden otomatik bildirim gönderin.' },
  { icon: '⏰', title: 'Zamanlama', desc: 'Cron job ile belirli saatlerde veya aralıklarla akış çalıştırın.' },
]

const FLOW_NODES = [
  { label: 'Tetikleyici', sub: 'Webhook / Cron / Form', color: '#f97316', icon: '⚡' },
  { label: 'Koşul', sub: 'If / Switch', color: '#f59e0b', icon: '❓' },
  { label: 'İşlem', sub: 'Transform / HTTP', color: '#ea580c', icon: '⚙️' },
  { label: 'Aksiyon', sub: 'Notify / DB / API', color: '#10b981', icon: '✅' },
]

const USE_CASES = [
  { icon: '📦', title: 'E-ticaret Entegrasyonu', desc: 'Yeni sipariş → muhasebe kaydı + bildirim', tag: 'Shopify / WooCommerce' },
  { icon: '📧', title: 'E-posta Otomasyonu', desc: 'Zamanlanmış raporlar ve müşteri bildirimleri', tag: 'SMTP / SendGrid' },
  { icon: '📊', title: 'Veri Senkronizasyonu', desc: 'Farklı sistemler arası otomatik veri aktarımı', tag: 'Google Sheets / Airtable' },
  { icon: '🔔', title: 'Slack / Teams Bildirimleri', desc: 'Kritik olayları anlık olarak ekibe ilet', tag: 'Slack / MS Teams' },
  { icon: '💼', title: 'CRM Entegrasyonu', desc: 'Form dolumu → CRM\'e otomatik lead kaydı', tag: 'HubSpot / Salesforce' },
  { icon: '🧾', title: 'Fatura Otomasyonu', desc: 'Sipariş sonrası otomatik fatura oluştur ve gönder', tag: 'Parasut / Logo' },
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
    <div className="mt-2">
      <p className="text-xs text-muted-foreground mb-3">Tipik N8N iş akışı — düğmelere tıklayın</p>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {FLOW_NODES.map((node, i) => (
          <div key={i} className="flex items-center shrink-0">
            <button
              onClick={() => setActiveNode(activeNode === i ? null : i)}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl transition-all duration-200 border-2"
                style={{
                  background: activeNode === i ? node.color : `${node.color}22`,
                  borderColor: node.color,
                  transform: activeNode === i ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {node.icon}
              </div>
              <span className="text-[10px] font-medium text-center" style={{ color: node.color }}>
                {node.label}
              </span>
            </button>
            {i < FLOW_NODES.length - 1 && (
              <div className="w-6 h-px mx-1 shrink-0" style={{ background: 'linear-gradient(90deg,#f97316,#ea580c)' }} />
            )}
          </div>
        ))}
      </div>
      {activeNode !== null && (
        <div className="mt-2 p-3 rounded-xl text-sm border" style={{ borderColor: FLOW_NODES[activeNode].color, background: `${FLOW_NODES[activeNode].color}11` }}>
          <p className="font-semibold text-sm" style={{ color: FLOW_NODES[activeNode].color }}>{FLOW_NODES[activeNode].label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{FLOW_NODES[activeNode].sub}</p>
        </div>
      )}
    </div>
  )
}

export default function SirketClient({ talepler: initial }: { talepler: Talep[] }) {
  const [talepler, setTalepler] = useState(initial)
  const [description, setDescription] = useState('')
  const [useCase, setUseCase] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const full = useCase ? `[${useCase}] ${description}` : description
    if (!full.trim()) { toast.error('Açıklama girin'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/otomasyon/sirket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: full }),
      })
      if (res.ok) {
        const t = await res.json()
        setTalepler((prev) => [t, ...prev])
        setDescription('')
        setUseCase('')
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
          <h1 className="text-2xl font-bold tracking-tight">⚙️ Şirket Otomasyonu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">N8N ile iş akışlarınızı otomatikleştirin — 400+ uygulama entegrasyonu</p>
        </div>
        <div className="flex items-center gap-1.5 glass-subtle px-3 py-1.5 rounded-xl border border-border/40">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Aktif Abonelik</span>
        </div>
      </div>

      {/* N8N Info Card */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50"
          style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.08),rgba(234,88,12,0.04))' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            ⚙️
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm">N8N — İleri Düzey İş Akışı Otomasyonu</h2>
            <p className="text-xs text-muted-foreground">Kod yazmadan 400+ uygulamayı birbirine bağlayın</p>
          </div>
          <a href="https://n8n.io" target="_blank" rel="noopener noreferrer"
            className="text-xs px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-500 font-medium shrink-0 hover:bg-orange-500/25 transition-colors">
            n8n.io ↗
          </a>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            N8N, görsel iş akışı tasarımcısı ile farklı sistemleri birbirine bağlamanızı sağlar.
            API&apos;leri entegre edin, verileri otomatik işleyin, ekibinize anlık bildirimler gönderin.
          </p>

          <N8NFlow />

          <Accordion title="Otomasyon Adımları (6 Aşama)" icon="🔧" defaultOpen>
            <div className="space-y-2 mt-2">
              {N8N_STEPS.map((s, i) => (
                <div key={s.title} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-orange-500/5 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ background: 'rgba(249,115,22,0.15)' }}>
                    {s.icon}
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

          <Accordion title="Popüler Entegrasyonlar" icon="🔗">
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'Shopify', 'WooCommerce', 'Google Sheets', 'Airtable', 'Slack', 'Microsoft Teams',
                'HubSpot', 'Salesforce', 'Stripe', 'Notion', 'Trello', 'Jira',
                'SendGrid', 'Twilio', 'WhatsApp', 'Telegram', 'MySQL', 'PostgreSQL',
              ].map((app) => (
                <span key={app} className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
                  {app}
                </span>
              ))}
            </div>
          </Accordion>
        </div>
      </div>

      {/* Use Cases */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-sm mb-4">💡 Popüler Kullanım Senaryoları</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {USE_CASES.map((uc) => (
            <button
              key={uc.title}
              onClick={() => setUseCase(uc.title)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${useCase === uc.title ? 'border-orange-500/40 bg-orange-500/8' : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/4'}`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg shrink-0">{uc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{uc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{uc.desc}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 mt-1.5 inline-block">{uc.tag}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {useCase && (
          <p className="text-xs text-orange-500 mt-3 flex items-center gap-1.5">
            <span>✓</span> &quot;{useCase}&quot; senaryo seçildi — aşağıya detay ekleyin
          </p>
        )}
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center text-xs text-orange-500">?</span>
          Kurulum Süreci
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', icon: '📝', title: 'Talep Gönder', desc: 'İhtiyacınızı ve hangi sistemleri entegre etmek istediğinizi açıklayın.' },
            { step: '02', icon: '📞', title: '24s İçinde İletişim', desc: 'Uzman N8N ekibimiz sizi arayarak gereksinimleri analiz eder.' },
            { step: '03', icon: '🛠️', title: 'Kurulum & Test', desc: 'İş akışınız kurulur, test edilir ve sizin onayınıza sunulur.' },
            { step: '04', icon: '✅', title: 'Canlıya Al', desc: 'Otomasyon aktif olur, 7/24 arka planda sizin için çalışır.' },
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
        <h2 className="font-semibold text-sm mb-4">🚀 Otomasyon Talebi Oluştur</h2>

        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Neye ihtiyacınız var?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={
            useCase
              ? `${useCase} için örn: Shopify'da yeni sipariş geldiğinde otomatik olarak muhasebe sistemine kayıt açılsın, ekibimize Slack bildirimi gelsin ve müşteriye onay e-postası gönderilsin...`
              : 'Örn: Shopify\'da yeni sipariş geldiğinde muhasebe sistemine otomatik kayıt açılsın ve ekibimize Slack bildirimi gelsin. Kullandığımız sistemler: ...'
          }
          className="w-full px-4 py-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
        />
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">Kullandığınız sistemleri ve istediğiniz akışı detaylı açıklayın.</p>
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 py-2.5 text-sm rounded-xl cursor-pointer disabled:opacity-40 shrink-0 font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
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
