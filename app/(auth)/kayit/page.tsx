'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register, type FormState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function KayitPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hesap Oluştur</CardTitle>
        <CardDescription>iFox Social Media Control&apos;e katılın</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input id="name" name="name" placeholder="Ahmet Yılmaz" required />
            {state?.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Şirket / Marka Adı</Label>
            <Input id="companyName" name="companyName" placeholder="Şirket Adı" required />
            {state?.errors?.companyName && (
              <p className="text-sm text-destructive">{state.errors.companyName[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" placeholder="ornek@sirket.com" required />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" placeholder="En az 8 karakter" required />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="text-primary hover:underline font-medium">
            Giriş Yap
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
