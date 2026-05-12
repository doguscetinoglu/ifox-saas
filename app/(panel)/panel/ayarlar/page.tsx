'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SocialAccount = { id: string; handle: string; manychatPageId: string | null; status: string }
type Employee = { id: string; name: string; email: string; status: string }

const STATUS_BADGES: Record<string, ReactElement> = {
  PENDING: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500">Bekleniyor</span>,
  CONNECTED: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">✓ Bağlandı</span>,
  DISCONNECTED: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">Bağlantı Kesildi</span>,
}

export default function AyarlarPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [igHandle, setIgHandle] = useState('')
  const [manychatPageId, setManychatPageId] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [urlCopied, setUrlCopied] = useState(false)
  const [addEmpOpen, setAddEmpOpen] = useState(false)
  const [empForm, setEmpForm] = useState({ name: '', email: '', password: '' })
  const [addingEmp, setAddingEmp] = useState(false)
  const [empError, setEmpError] = useState('')

  async function loadAccounts() {
    const res = await fetch('/api/settings/instagram')
    const d = await res.json()
    setAccounts(d.accounts || [])
  }

  async function loadEmployees() {
    const res = await fetch('/api/settings/team')
    const d = await res.json()
    setEmployees(d.employees || [])
  }

  async function loadWebhookInfo() {
    const res = await fetch('/api/settings/webhook-info')
    if (!res.ok) return
    const d = await res.json()
    if (d.token && d.path) {
      setWebhookUrl(`${window.location.origin}${d.path}?token=${d.token}`)
    }
  }

  useEffect(() => {
    loadAccounts()
    loadEmployees()
    loadWebhookInfo()
  }, [])

  async function connectInstagram() {
    if (!igHandle.trim() || !manychatPageId.trim()) return
    setConnecting(true)
    setConnectError('')
    const res = await fetch('/api/settings/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: igHandle, manychatPageId }),
    })
    if (!res.ok) {
      const d = await res.json()
      setConnectError(d.error || 'Hata oluştu')
    } else {
      setIgHandle('')
      setManychatPageId('')
    }
    setConnecting(false)
    loadAccounts()
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(webhookUrl)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  async function addEmployee() {
    setEmpError('')
    setAddingEmp(true)
    const res = await fetch('/api/settings/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empForm),
    })
    if (res.ok) {
      setAddEmpOpen(false)
      setEmpForm({ name: '', email: '', password: '' })
      loadEmployees()
    } else {
      const d = await res.json()
      setEmpError(d.error || 'Hata')
    }
    setAddingEmp(false)
  }

  async function removeEmployee(id: string) {
    if (!confirm('Bu çalışan silinsin mi?')) return
    await fetch(`/api/settings/team/${id}`, { method: 'DELETE' })
    loadEmployees()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hesap ve entegrasyon ayarları</p>
      </div>

      {/* ── Instagram Bağlantısı ──────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
            📸
          </div>
          <div>
            <h2 className="text-sm font-semibold">Instagram Bağlantısı</h2>
            <p className="text-xs text-muted-foreground">ManyChat Page ID ile hesabı bağla</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
              Instagram Kullanıcı Adı
            </label>
            <Input
              value={igHandle}
              onChange={(e) => setIgHandle(e.target.value)}
              placeholder="@instagram_kullanici_adi"
              className="h-10 rounded-xl bg-black/4 dark:bg-white/4 border-border"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
              ManyChat Page ID
              <a
                href="https://manychat.com/settings/general"
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-primary hover:underline normal-case font-normal"
              >
                Nereden bulunur? →
              </a>
            </label>
            <Input
              value={manychatPageId}
              onChange={(e) => setManychatPageId(e.target.value)}
              placeholder="123456789012345"
              className="h-10 rounded-xl bg-black/4 dark:bg-white/4 border-border font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              ManyChat → Settings → General → &quot;Your Page ID&quot; altında bulunur
            </p>
          </div>
        </div>

        {connectError && (
          <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-3">{connectError}</p>
        )}

        <button
          onClick={connectInstagram}
          disabled={connecting || !igHandle.trim() || !manychatPageId.trim()}
          className="btn-apple px-6 h-10 text-sm font-medium cursor-pointer disabled:opacity-40"
        >
          {connecting ? 'Bağlanıyor...' : 'Hesabı Bağla'}
        </button>

        {accounts.length > 0 && (
          <div className="mt-4 space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl glass-subtle">
                <div>
                  <span className="text-sm font-medium">@{a.handle}</span>
                  {a.manychatPageId && (
                    <span className="text-xs text-muted-foreground ml-2 font-mono">ID: {a.manychatPageId}</span>
                  )}
                </div>
                {STATUS_BADGES[a.status] || <span className="text-xs">{a.status}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ManyChat Webhook Kurulumu ─────────────────── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl stat-blue flex items-center justify-center text-xl">🔗</div>
          <div>
            <h2 className="text-sm font-semibold">ManyChat Webhook Kurulumu</h2>
            <p className="text-xs text-muted-foreground">ManyChat akışına eklenecek URL</p>
          </div>
        </div>

        {/* Webhook URL */}
        <div className="mb-5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border font-mono text-xs overflow-x-auto whitespace-nowrap">
              {webhookUrl || 'Yükleniyor...'}
            </div>
            <button
              onClick={copyUrl}
              disabled={!webhookUrl}
              className="px-4 h-10 rounded-xl glass-subtle text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 shrink-0"
            >
              {urlCopied ? '✓ Kopyalandı' : 'Kopyala'}
            </button>
          </div>
        </div>

        {/* Adımlar */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ManyChat'te yapılacaklar</p>

          {[
            {
              step: '1',
              title: 'Automation → Flows → New Flow',
              desc: 'Yeni bir akış oluştur. Trigger olarak "Instagram: Direct Message Received" veya "Default Reply" seç.',
            },
            {
              step: '2',
              title: 'HTTP Request (External Request) adımı ekle',
              desc: 'Akışa "HTTP Request" adımı ekle. Method: POST, URL: yukarıdaki Webhook URL\'yi yapıştır.',
            },
            {
              step: '3',
              title: 'Request Body\'yi ayarla',
              desc: 'Content Type: JSON. Body alanına aşağıdaki kodu yapıştır:',
              code: `{
  "pageId": "{{page id}}",
  "subscriberId": "{{messenger user id}}",
  "name": "{{first name}} {{last name}}",
  "content": "{{last input text}}"
}`,
            },
            {
              step: '4',
              title: 'Akışı yayınla ve test et',
              desc: 'Publish butonuna bas. Instagram DM gönder, mesajın panelde göründüğünü kontrol et.',
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full stat-blue flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                {s.step}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                {s.code && (
                  <pre className="mt-2 p-3 rounded-xl bg-black/10 dark:bg-white/5 text-xs font-mono text-foreground/80 overflow-x-auto border border-border/50">
                    {s.code}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Uyarı notu */}
        <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
          <strong>Not:</strong> Bu URL&apos;yi sadece güvendiğiniz kişilerle paylaşın. URL&apos;nin token parametresi
          değiştirilirse Vercel&apos;deki <code className="font-mono">WEBHOOK_SECRET</code> env var&apos;ı da güncellemeniz gerekir.
        </div>
      </div>

      {/* ── Ekip Yönetimi ─────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl stat-cyan flex items-center justify-center text-xl">👥</div>
            <div>
              <h2 className="text-sm font-semibold">Ekip Yönetimi</h2>
              <p className="text-xs text-muted-foreground">{employees.length} çalışan</p>
            </div>
          </div>
          <button
            onClick={() => setAddEmpOpen(true)}
            className="text-xs font-medium px-4 h-8 rounded-full glass-subtle hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            + Çalışan Ekle
          </button>
        </div>

        {employees.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Henüz çalışan eklenmedi.</p>
        ) : (
          <div className="space-y-2">
            {employees.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3 rounded-xl glass-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl stat-violet flex items-center justify-center text-white text-xs font-bold">
                    {e.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    e.status === 'ACTIVE' ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {e.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                  </span>
                  <button
                    onClick={() => removeEmployee(e.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Çalışan ekleme dialog */}
      <Dialog open={addEmpOpen} onOpenChange={setAddEmpOpen}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Çalışan Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: 'Ad Soyad', key: 'name', type: 'text', placeholder: 'Ahmet Yılmaz' },
              { label: 'E-posta', key: 'email', type: 'email', placeholder: 'ahmet@sirket.com' },
              { label: 'Şifre', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type={type}
                  placeholder={placeholder}
                  value={empForm[key as keyof typeof empForm]}
                  onChange={(e) => setEmpForm({ ...empForm, [key]: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>
            ))}
            {empError && <p className="text-xs text-destructive">{empError}</p>}
          </div>
          <DialogFooter>
            <button
              onClick={() => setAddEmpOpen(false)}
              className="px-4 h-9 text-sm rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              onClick={addEmployee}
              disabled={addingEmp}
              className="btn-apple px-5 h-9 text-sm font-medium cursor-pointer disabled:opacity-40"
            >
              {addingEmp ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
