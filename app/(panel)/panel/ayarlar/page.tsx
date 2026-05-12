'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SocialAccount = { id: string; handle: string; status: string; platform: string }
type Employee = { id: string; name: string; email: string; status: string }

const STATUS_BADGES: Record<string, ReactElement> = {
  PENDING: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500">Bekleniyor</span>,
  CONNECTED: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">Bağlandı</span>,
  DISCONNECTED: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">Bağlantı Kesildi</span>,
}

export default function AyarlarPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [igHandle, setIgHandle] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [addEmpOpen, setAddEmpOpen] = useState(false)
  const [empForm, setEmpForm] = useState({ name: '', email: '', password: '' })
  const [addingEmp, setAddingEmp] = useState(false)
  const [empError, setEmpError] = useState('')

  async function loadAccounts() { const res = await fetch('/api/settings/instagram'); const d = await res.json(); setAccounts(d.accounts || []) }
  async function loadEmployees() { const res = await fetch('/api/settings/team'); const d = await res.json(); setEmployees(d.employees || []) }
  useEffect(() => { loadAccounts(); loadEmployees() }, [])

  async function connectInstagram() {
    if (!igHandle.trim()) return
    setConnecting(true)
    await fetch('/api/settings/instagram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle: igHandle }) })
    setIgHandle(''); setConnecting(false); loadAccounts()
  }

  async function addEmployee() {
    setEmpError(''); setAddingEmp(true)
    const res = await fetch('/api/settings/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(empForm) })
    if (res.ok) { setAddEmpOpen(false); setEmpForm({ name: '', email: '', password: '' }); loadEmployees() }
    else { const d = await res.json(); setEmpError(d.error || 'Hata') }
    setAddingEmp(false)
  }

  async function removeEmployee(id: string) {
    if (!confirm('Bu çalışan silinsin mi?')) return
    await fetch(`/api/settings/team/${id}`, { method: 'DELETE' }); loadEmployees()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hesap ve entegrasyon ayarları</p>
      </div>

      {/* Instagram */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
            📸
          </div>
          <div>
            <h2 className="text-sm font-semibold">Instagram Bağlantısı</h2>
            <p className="text-xs text-muted-foreground">ManyChat üzerinden hesap bağla</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Input value={igHandle} onChange={(e) => setIgHandle(e.target.value)}
            placeholder="@instagram_kullanici_adi"
            className="h-10 rounded-xl bg-black/4 dark:bg-white/4 border-border flex-1" />
          <button onClick={connectInstagram} disabled={connecting || !igHandle.trim()}
            className="btn-apple px-5 h-10 text-sm font-medium cursor-pointer disabled:opacity-40 shrink-0">
            {connecting ? '...' : 'Bağla'}
          </button>
        </div>
        {accounts.length === 0 ? (
          <p className="text-xs text-muted-foreground">Henüz Instagram hesabı bağlanmadı.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl glass-subtle">
                <span className="text-sm font-medium">@{a.handle}</span>
                {STATUS_BADGES[a.status] || <span className="text-xs">{a.status}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl stat-cyan flex items-center justify-center text-xl">👥</div>
            <div>
              <h2 className="text-sm font-semibold">Ekip Yönetimi</h2>
              <p className="text-xs text-muted-foreground">{employees.length} çalışan</p>
            </div>
          </div>
          <button onClick={() => setAddEmpOpen(true)}
            className="text-xs font-medium px-4 h-8 rounded-full glass-subtle hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
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
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${e.status === 'ACTIVE' ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {e.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                  </span>
                  <button onClick={() => removeEmployee(e.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer">Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <Input type={type} placeholder={placeholder}
                  value={empForm[key as keyof typeof empForm]}
                  onChange={(e) => setEmpForm({ ...empForm, [key]: e.target.value })}
                  className="h-10 rounded-xl" />
              </div>
            ))}
            {empError && <p className="text-xs text-destructive">{empError}</p>}
          </div>
          <DialogFooter>
            <button onClick={() => setAddEmpOpen(false)}
              className="px-4 h-9 text-sm rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer">İptal</button>
            <button onClick={addEmployee} disabled={addingEmp}
              className="btn-apple px-5 h-9 text-sm font-medium cursor-pointer disabled:opacity-40">
              {addingEmp ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
