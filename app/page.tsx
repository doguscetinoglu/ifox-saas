'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card3D } from '@/components/ui/card-3d'

function useCounter(target: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])
  return val
}

function StatBox({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const val = useCounter(target, 1800, active)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl lg:text-5xl font-bold gradient-text mb-1">
        {val.toLocaleString('tr-TR')}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.23,1,0.32,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

const PRODUCTS = [
  {
    icon: '📈',
    name: 'Ciro Takip',
    slug: 'ciro-takip',
    desc: 'Günlük, haftalık ve aylık cirowunuzu kaydedin. Hedeflerinizi belirleyin, büyümenizi verilerle izleyin.',
    gradient: 'stat-blue',
    glow: 'blue',
    features: ['Gelir kaydı ve kategori', 'Haftalık/aylık hedef', 'Grafik analiz', 'CSV dışa aktarım'],
  },
  {
    icon: '💰',
    name: 'Borç Takip',
    slug: 'borc-takip',
    desc: 'Müşterilerinizin borçlarını takip edin, vade tarihlerini kaçırmayın, ödeme geçmişini görün.',
    gradient: 'stat-green',
    glow: 'green',
    features: ['Müşteri bazlı borç kaydı', 'Vade tarihi uyarıları', 'Kısmi ödeme takibi', 'Gecikme raporu'],
  },
  {
    icon: '🦊',
    name: 'Fox CRM',
    slug: 'fox-crm',
    desc: 'Müşteri ilişkilerinizi yönetin. Destek biletleri, projeler ve görevlerle tam kontrol sağlayın.',
    gradient: 'stat-violet',
    glow: 'violet',
    features: ['Müşteri veritabanı', 'Destek bileti sistemi', 'Proje ve görev yönetimi', '7/24 takip'],
  },
  {
    icon: '🤖',
    name: 'Sosyal Medya Otomasyonu',
    slug: 'otomasyon',
    desc: 'N8N ve ManyChat ile iş akışlarınızı otomatikleştirin. İnsan müdahalesine gerek kalmadan çalışsın.',
    gradient: 'stat-rose',
    glow: 'rose',
    features: ['N8N entegrasyonu', 'ManyChat bağlantısı', 'Otomatik yanıt akışları', 'Webhook desteği'],
  },
  {
    icon: '📊',
    name: 'Raporlama',
    slug: 'raporlama',
    desc: 'Tüm verilerinizi tek ekranda görün. Özelleştirilebilir raporlarla iş kararlarınızı güçlendirin.',
    gradient: 'stat-cyan',
    glow: 'cyan',
    features: ['Çoklu modül raporu', 'Tarih bazlı filtreleme', 'Grafik ve tablo görünümü', 'PDF/CSV export'],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10" style={{ height: 60 }}>
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' }}>🦊</div>
            <span className="font-bold text-sm gradient-text">iFox</span>
            <span className="text-sm text-muted-foreground font-medium">Yazılım</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#urunler" className="hover:text-foreground transition-colors cursor-pointer">Özellikler</a>
            <a href="#nasil-calisir" className="hover:text-foreground transition-colors cursor-pointer">Nasıl Çalışır</a>
            <a href="#fiyatlandirma" className="hover:text-foreground transition-colors cursor-pointer">Fiyatlandırma</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/giris" className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl transition-colors hidden sm:block">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="btn-apple text-sm px-5 py-2.5">
              Başla →
            </Link>
          </div>
        </div>
      </nav>

      <section className="mesh-bg min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full animate-blob"
            style={{ background: 'radial-gradient(circle,rgba(124,124,248,0.12) 0%,transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full animate-blob-delay"
            style={{ background: 'radial-gradient(circle,rgba(168,139,250,0.10) 0%,transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)', filter: 'blur(50px)' }} />
        </div>

        <div className="absolute top-32 left-[4%] hidden xl:block animate-float" style={{ animationDelay: '0s' }}>
          <div className="glass rounded-2xl p-4 max-w-[200px] shadow-2xl border border-white/10">
            <div className="w-8 h-8 rounded-xl stat-blue flex items-center justify-center text-lg mb-2">📈</div>
            <p className="text-xs font-semibold text-white/90">Ciro Takip</p>
            <p className="text-xs text-green-400 mt-1 font-medium">↑ %23 bu ay</p>
          </div>
        </div>

        <div className="absolute top-[54%] left-[3%] hidden xl:block animate-float" style={{ animationDelay: '1.8s' }}>
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl stat-green flex items-center justify-center text-lg shrink-0">💰</div>
            <div>
              <p className="text-xs font-semibold text-white/90">Borç Uyarısı</p>
              <p className="text-xs text-muted-foreground">3 vade yarın!</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-28 left-[5%] hidden xl:block animate-float" style={{ animationDelay: '0.9s' }}>
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl stat-cyan flex items-center justify-center text-lg shrink-0">📊</div>
            <div>
              <p className="text-xs font-semibold text-white/90">Raporlama</p>
              <p className="text-xs text-green-400 font-medium">Hazır ✓</p>
            </div>
          </div>
        </div>

        <div className="absolute top-36 right-[4%] hidden xl:block animate-float" style={{ animationDelay: '1.2s' }}>
          <div className="glass rounded-2xl p-4 max-w-[200px] shadow-2xl border border-white/10">
            <div className="w-8 h-8 rounded-xl stat-violet flex items-center justify-center text-lg mb-2">🦊</div>
            <p className="text-xs font-semibold text-white/90">Fox CRM</p>
            <p className="text-xs text-muted-foreground mt-1">12 aktif müşteri</p>
          </div>
        </div>

        <div className="absolute bottom-32 right-[5%] hidden xl:block animate-float" style={{ animationDelay: '2.5s' }}>
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl stat-rose flex items-center justify-center text-lg shrink-0">🤖</div>
            <div>
              <p className="text-xs font-semibold text-white/90">Otomasyon</p>
              <p className="text-xs text-muted-foreground">N8N aktif ✓</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-2 rounded-full text-sm mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-white/60">5 Güçlü Araç, 1 Platform</span>
              <span className="shimmer-text font-semibold">Yeni</span>
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.15]">
              <span className="text-white">İşinizi Büyütecek</span>
              <br />
              <span className="shimmer-text">Dijital Araçlar</span>
            </h1>
          </FadeIn>

          <FadeIn delay={160}>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Ciro takibinden borç yönetimine, CRM&apos;den sosyal medya otomasyonuna kadar
              işinizin her alanını tek platformdan kontrol edin.
            </p>
          </FadeIn>

          <FadeIn delay={240}>
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <Link href="/kayit" className="btn-apple text-base px-8 py-4">
                Hemen Başla →
              </Link>
              <a href="#nasil-calisir"
                className="text-sm font-medium text-white/50 hover:text-white/90 flex items-center gap-2 px-5 py-4 glass-subtle rounded-full transition-colors border border-white/10 cursor-pointer">
                <span className="text-xs">▶</span> Nasıl Çalışır?
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={320}>
            <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-1">
                {['📈', '💰', '🦊', '🤖', '📊'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full glass border-2 border-white/10 flex items-center justify-center text-sm"
                    style={{ marginLeft: i > 0 ? -10 : 0 }}>
                    {e}
                  </div>
                ))}
                <span className="text-sm text-white/50 ml-3">500+ kullanıcı güveniyor</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                <span className="text-sm text-white/50 ml-2">4.9/5</span>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      <section className="py-16 glass border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatBox target={500} suffix="+" label="Kullanıcı" />
          <StatBox target={99} suffix="%" label="Uptime" />
          <StatBox target={5} suffix="" label="Ürün" />
          <StatBox target={24} suffix="/7" label="Destek" />
        </div>
      </section>

      <section id="urunler" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4">
              ✨ Ürünlerimiz
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              İşinize Özel <span className="gradient-text">5 Araç</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Her biri kendi alanında güçlü, birlikte kullandığınızda işinizi uçuran araçlar.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRODUCTS.map((p, i) => (
              <FadeIn key={p.name} delay={i * 70}>
                <div className={`glow-${p.glow} rounded-2xl h-full`}>
                  <Card3D className="glass rounded-2xl p-6 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-2xl ${p.gradient} flex items-center justify-center text-2xl mb-4`}>
                      {p.icon}
                    </div>
                    <h3 className="font-semibold text-base mb-2">{p.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{p.desc}</p>
                    <Link href="/kayit"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      Satın Al →
                    </Link>
                  </Card3D>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 panel-bg opacity-50" />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4">
              🚀 Nasıl Çalışır?
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              3 Adımda <span className="gradient-text">Başla</span>
            </h2>
            <p className="text-muted-foreground">Kurulum dakikalar içinde tamamlanır. Hemen kullanmaya başlayın.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[calc(33%+24px)] right-[calc(33%+24px)] h-px"
              style={{ background: 'linear-gradient(90deg,rgba(124,124,248,0.5),rgba(139,92,246,0.5))' }} />

            {[
              { step: '01', icon: '✍️', title: 'Kayıt Ol', desc: 'Hızlıca hesap oluşturun. Ad, e-posta ve şifre yeterli — dakikalar içinde hazır.', gradient: 'stat-blue' },
              { step: '02', icon: '🛒', title: 'Ürünü Seç & Öde', desc: 'İhtiyacınız olan ürünü seçin, IBAN ile ödeme yapın. Admin onayından sonra erişim açılır.', gradient: 'stat-violet' },
              { step: '03', icon: '🚀', title: 'Hemen Kullan', desc: 'Panele girin ve kullanmaya başlayın. Her şey hazır, kurulum gerektirmez.', gradient: 'stat-green' },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 120}>
                <Card3D className="glass rounded-2xl p-6 text-center h-full">
                  <div className="relative inline-block mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${s.gradient} flex items-center justify-center text-2xl mx-auto`}>
                      {s.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border text-xs font-bold flex items-center justify-center"
                      style={{ fontSize: 9 }}>
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </Card3D>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="fiyatlandirma" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 panel-bg opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4">
              💰 Fiyatlandırma
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Şeffaf, <span className="gradient-text">Basit Fiyatlar</span>
            </h2>
            <p className="text-muted-foreground">Her ürün 1.000₺/ay. Gizli ücret yok, sürpriz yok.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRODUCTS.map((p, i) => (
              <FadeIn key={p.name} delay={i * 70}>
                <div className={`glow-${p.glow} rounded-2xl h-full`}>
                  <Card3D className="glass rounded-2xl overflow-hidden h-full flex flex-col">
                    <div className={`${p.gradient} p-6 text-white`}>
                      <div className="text-3xl mb-3">{p.icon}</div>
                      <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">₺1.000</span>
                        <span className="text-white/60 text-sm">/ay</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm">
                            <span className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center text-green-500 text-xs shrink-0 font-bold">✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link href="/kayit"
                        className="btn-apple py-3 text-sm font-semibold w-full flex items-center justify-center">
                        Satın Al →
                      </Link>
                      <p className="text-xs text-muted-foreground text-center mt-2">IBAN · Admin onayı sonrası erişim</p>
                    </div>
                  </Card3D>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="mesh-bg py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full"
            style={{ background: 'radial-gradient(ellipse,rgba(124,124,248,0.18) 0%,transparent 70%)', filter: 'blur(50px)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="text-5xl mb-6 animate-float inline-block">🦊</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
              İşinizi Büyütmeye{' '}
              <span className="shimmer-text">Hemen Başlayın</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              5 güçlü araç, tek platform. Dakikalar içinde kurulum, anında kullanım.
            </p>
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <Link href="/kayit" className="btn-apple text-base px-10 py-4">
                Hemen Başla →
              </Link>
              <Link href="/giris" className="text-sm text-white/50 hover:text-white/90 transition-colors">
                Zaten hesabım var →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' }}>🦊</div>
            <span className="font-bold text-sm gradient-text">iFox</span>
            <span className="text-sm text-muted-foreground">Yazılım</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} iFox. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/giris" className="hover:text-foreground transition-colors">Giriş Yap</Link>
            <Link href="/kayit" className="hover:text-foreground transition-colors">Kayıt Ol</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
