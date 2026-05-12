'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type FormState } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EMOJIS_A = ['💬','🔥','❤️','📱','👥','🦊','✨','🎯','💫','📊']
const EMOJIS_B = ['🚀','⭐','💎','🎬','📸','🌟','🎭','🏆','💡','🌈']
const EMOJIS_C = ['🎨','🌺','💝','🎊','✅','🔮','🦋','🎪','💌','🎵']

export default function GirisPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined)

  return (
    <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 520 }}>
      {/* Left — scrolling emojis */}
      <div className="hidden lg:flex w-64 relative overflow-hidden shrink-0"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 50%, #0f1a2e 100%)' }}>
        <div className="absolute inset-0 flex gap-5 px-5 py-4 select-none pointer-events-none opacity-60">
          <div className="flex flex-col gap-6 animate-scroll-up">
            {[...EMOJIS_A, ...EMOJIS_A].map((e, i) => (
              <span key={i} className="text-3xl leading-none">{e}</span>
            ))}
          </div>
          <div className="flex flex-col gap-6 animate-scroll-down mt-12">
            {[...EMOJIS_B, ...EMOJIS_B].map((e, i) => (
              <span key={i} className="text-3xl leading-none">{e}</span>
            ))}
          </div>
          <div className="flex flex-col gap-6 animate-scroll-up-slow mt-20">
            {[...EMOJIS_C, ...EMOJIS_C].map((e, i) => (
              <span key={i} className="text-3xl leading-none">{e}</span>
            ))}
          </div>
        </div>
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
        <div className="relative z-10 flex flex-col justify-end p-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            🦊
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Tekrar Hoş Geldiniz</h2>
          <p className="text-white/55 text-xs leading-relaxed">
            iFox Social ile Instagram mesajlarınızı yönetin.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 glass flex flex-col justify-center p-8 lg:p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Giriş Yap</h1>
          <p className="text-muted-foreground text-sm">Hesabınıza erişin</p>
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
          {state?.message && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{state.message}</p>
          )}
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
