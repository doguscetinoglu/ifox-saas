'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type SocialAccount = { id: string; handle: string; status: string; platform: string }
type Employee = { id: string; name: string; email: string; status: string }

const STATUS_BADGES: Record<string, ReactElement> = {
  PENDING: <Badge variant="secondary">Bekleniyor</Badge>,
  CONNECTED: <Badge className="bg-green-100 text-green-800">Bağlandı</Badge>,
  DISCONNECTED: <Badge variant="destructive">Bağlantı Kesildi</Badge>,
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

  async function loadAccounts() {
    const res = await fetch('/api/settings/instagram')
    const data = await res.json()
    setAccounts(data.accounts || [])
  }

  async function loadEmployees() {
    const res = await fetch('/api/settings/team')
    const data = await res.json()
    setEmployees(data.employees || [])
  }

  useEffect(() => { loadAccounts(); loadEmployees() }, [])

  async function connectInstagram() {
    if (!igHandle.trim()) return
    setConnecting(true)
    await fetch('/api/settings/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: igHandle }),
    })
    setIgHandle('')
    setConnecting(false)
    loadAccounts()
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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Ayarlar</h1>

      {/* Instagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instagram Bağlantısı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={igHandle}
              onChange={(e) => setIgHandle(e.target.value)}
              placeholder="@instagram_kullanici_adi"
            />
            <Button onClick={connectInstagram} disabled={connecting || !igHandle.trim()}>
              {connecting ? 'Bağlanıyor...' : 'Bağla'}
            </Button>
          </div>
          {accounts.length > 0 && (
            <div className="space-y-2">
              {accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <span className="font-medium text-sm">@{a.handle}</span>
                  {STATUS_BADGES[a.status] || <Badge>{a.status}</Badge>}
                </div>
              ))}
            </div>
          )}
          {accounts.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz Instagram hesabı bağlanmadı.</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Team */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Ekip Yönetimi</CardTitle>
          <Button size="sm" onClick={() => setAddEmpOpen(true)}>Çalışan Ekle</Button>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz çalışan eklenmedi.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2">Ad</th>
                  <th className="text-left py-2">E-posta</th>
                  <th className="text-left py-2">Durum</th>
                  <th className="text-left py-2"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b">
                    <td className="py-2">{e.name}</td>
                    <td className="py-2 text-muted-foreground">{e.email}</td>
                    <td className="py-2">
                      <Badge variant={e.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {e.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeEmployee(e.id)}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addEmpOpen} onOpenChange={setAddEmpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çalışan Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Ad Soyad</Label>
              <Input value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>E-posta</Label>
              <Input type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Şifre</Label>
              <Input type="password" value={empForm.password} onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })} />
            </div>
            {empError && <p className="text-sm text-destructive">{empError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEmpOpen(false)}>İptal</Button>
            <Button onClick={addEmployee} disabled={addingEmp}>
              {addingEmp ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
