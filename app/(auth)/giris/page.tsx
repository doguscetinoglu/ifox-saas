'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type FormState } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function GirisPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined)

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <span className="text-2xl">🦊</span>
          </div>
          <h1 className="text-2xl font-bold">Hoş Geldiniz</h1>
          <p className="text-muted-foreground text-sm mt-1">iFox Social Media Control</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">E-posta</Label>
            <Input id="email" name="email" type="email" placeholder="ornek@sirket.com" required
              className="h-11 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10" />
            {state?.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Şifre</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required
              className="h-11 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10" />
            {state?.errors?.password && <p className="text-xs text-destructive">{state.errors.password[0]}</p>}
          </div>
          {state?.message && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{state.message}</p>}
          <button type="submit" disabled={pending}
            className="btn-apple w-full h-11 mt-2 text-sm font-medium cursor-pointer">
            {pending ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="text-primary font-medium hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  )
}
