'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card3D } from '@/components/ui/card-3d'

/* ─── Animated counter ────────────────────────────────────── */
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

/* ─── Scroll-fade wrapper ─────────────────────────────────── */
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

/* ─── Data ────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '💬', title: 'Merkezi Mesaj Kutusu', desc: 'Tüm Instagram DM\'lerini tek ekranda görün, yanıtlayın ve takip edin.', gradient: 'stat-blue', glow: 'blue' },
  { icon: '🎯', title: 'Akıllı Lead Takibi', desc: 'Potansiyel müşterileri otomatik etiketleyin, hiç birini kaçırmayın.', gradient: 'stat-green', glow: 'green' },
  { icon: '👥', title: 'Ekip Yönetimi', desc: 'Çalışanlarınıza erişim tanıyın, performanslarını gerçek zamanlı izleyin.', gradient: 'stat-violet', glow: 'violet' },
  { icon: '📊', title: 'Detaylı Raporlar', desc: 'Günlük, haftalık, aylık analizler. Büyümenizi verilerle takip edin.', gradient: 'stat-cyan', glow: 'cyan' },
  { icon: '🤖', title: 'Güçlü Otomasyon', desc: 'N8N ile iş akışlarını otomatikleştirin. 2 talep pakete dahil ücretsiz.', gradient: 'stat-orange', glow: 'orange' },
  { icon: '🔗', title: 'ManyChat Entegrasyonu', desc: 'Hesabınızı bağlayın, mesajlar anında sisteme düşsün.', gradient: 'stat-rose', glow: 'rose' },
]

const FAKE_MESSAGES = [
  { name: 'Ayşe K.', msg: 'Merhaba, fiyat listesi alabilir miyim? 🙏', time: '2dk', status: 'Yeni', lead: true, color: 'stat-rose' },
  { name: 'Mehmet U.', msg: 'Logo tasarımını beğendim, devam edelim', time: '8dk', status: 'Yanıtlandı', lead: false, color: 'stat-blue' },
  { name: 'Zeynep D.', msg: 'Sosyal medya paketi hakkında bilgi?', time: '15dk', status: 'Yeni', lead: true, color: 'stat-violet' },
  { name: 'Can A.', msg: 'Teşekkürler, yarın ödeme yapacağım', time: '32dk', status: 'Kapalı', lead: false, color: 'stat-green' },
  { name: 'Selin T.', msg: 'Instagram\'ı kim yönetiyor sizin?', time: '1sa', status: 'Yeni', lead: false, color: 'stat-orange' },
]

/* ─── Main ────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══ NAV ══════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10" style={{ height: 60 }}>
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' }}>🦊</div>
            <span className="font-bold text-sm gradient-text">iFox</span>
            <span className="text-sm text-muted-foreground font-medium">Social</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#ozellikler" className="hover:text-foreground transition-colors cursor-pointer">Özellikler</a>
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

      {/* ══ HERO ═════════════════════════════════════════════ */}
      <section className="mesh-bg min-h-screen flex items-center justify-center relative overflow-hidden pt-16">

        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full animate-blob"
            style={{ background: 'radial-gradient(circle,rgba(124,124,248,0.12) 0%,transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full animate-blob-delay"
            style={{ background: 'radial-gradient(circle,rgba(168,139,250,0.10) 0%,transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)', filter: 'blur(50px)' }} />
        </div>

        {/* ── Floating left elements ── */}
        <div className="absolute top-32 left-[4%] hidden xl:block animate-float" style={{ animationDelay: '0s' }}>
          <div className="glass rounded-2xl p-4 max-w-[220px] shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">@ayse_boutique</span>
            </div>
            <p className="text-sm text-white/90">Merhaba! Ürün fiyatı nedir? 🙏</p>
            <div className="mt-2.5 flex justify-end">
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">● Yeni</span>
            </div>
          </div>
        </div>

        <div className="absolute top-[54%] left-[3%] hidden xl:block animate-float" style={{ animationDelay: '1.8s' }}>
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl stat-green flex items-center justify-center text-lg shrink-0">🎯</div>
            <div>
              <p className="text-xs font-semibold text-white/90">Yeni Lead Eklendi!</p>
              <p className="text-xs text-muted-foreground">@mehmet_usta → kaydedildi</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-28 left-[5%] hidden xl:block animate-float" style={{ animationDelay: '0.9s' }}>
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl stat-cyan flex items-center justify-center text-lg shrink-0">📊</div>
            <div>
              <p className="text-xs font-semibold text-white/90">Bugün 24 mesaj</p>
              <p className="text-xs text-green-400 font-medium">↑ %96 yanıt oranı</p>
            </div>
          </div>
        </div>

        {/* ── Floating right elements ── */}
        <div className="absolute top-36 right-[4%] hidden xl:block animate-float" style={{ animationDelay: '1.2s' }}>
          <div className="glass rounded-2xl p-4 max-w-[220px] shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg stat-rose flex items-center justify-center text-white text-xs font-bold">Z</div>
              <span className="text-xs font-medium text-white/80">zeynep_tasarim</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Logo tasarımı yaptırabilir miyim?</p>
            <div className="p-2 rounded-xl" style={{ background: 'rgba(124,124,248,0.15)' }}>
              <p className="text-xs text-primary">Evet tabii! Detayları paylaşır mısınız? ✉️</p>
            </div>
          </div>
        </div>

        <div className="absolute top-[52%] right-[3%] hidden xl:block animate-float" style={{ animationDelay: '0.4s' }}>
          <div className="glass rounded-2xl p-4 shadow-2xl border border-white/10" style={{ minWidth: 190 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/80">Haftalık Özet</span>
              <span className="text-xs text-green-400 font-semibold">↑ %18</span>
            </div>
            <div className="flex items-end gap-1 h-12 mb-2">
              {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm stat-blue" style={{ height: `${h}%`, opacity: 0.7 }} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">147 mesaj işlendi</p>
          </div>
        </div>

        <div className="absolute bottom-32 right-[5%] hidden xl:block animate-float" style={{ animationDelay: '2.5s' }}>
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl stat-violet flex items-center justify-center text-lg shrink-0">🤖</div>
            <div>
              <p className="text-xs font-semibold text-white/90">Otomasyon Aktif</p>
              <p className="text-xs text-muted-foreground">N8N → ManyChat ✓</p>
            </div>
          </div>
        </div>

        {/* ── Center content ── */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-2 rounded-full text-sm mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-white/60">ManyChat + N8N Entegrasyonlu</span>
              <span className="shimmer-text font-semibold">Beta</span>
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span className="text-white">Instagram</span>
              <br />
              <span className="text-white">Mesajlarını</span>
              <br />
              <span className="shimmer-text">Profesyonelce</span>
              {' '}
              <span className="text-white">Yönet</span>
            </h1>
          </FadeIn>

          <FadeIn delay={160}>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Tüm DM&apos;leri tek panelden görün, yanıtlayın ve lead&apos;e dönüştürün.
              Ekibinizle birlikte çalışın, raporlarla büyüyün.
            </p>
          </FadeIn>

          <FadeIn delay={240}>
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <Link href="/kayit" className="btn-apple text-base px-8 py-4">
                Ücretsiz Dene →
              </Link>
              <a href="#nasil-calisir"
                className="text-sm font-medium text-white/50 hover:text-white/90 flex items-center gap-2 px-5 py-4 glass-subtle rounded-full transition-colors border border-white/10 cursor-pointer">
                <span className="text-xs">▶</span> Nasıl çalışır?
              </a>
            </div>
          </FadeIn>

          {/* Social proof avatars */}
          <FadeIn delay={320}>
            <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-1">
                {['🦊', '🐯', '🦁', '🐺', '🦅'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full glass border-2 border-white/10 flex items-center justify-center text-sm"
                    style={{ marginLeft: i > 0 ? -10 : 0 }}>
                    {e}
                  </div>
                ))}
                <span className="text-sm text-white/50 ml-3">50+ işletme kullanıyor</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                <span className="text-sm text-white/50 ml-2">4.9/5</span>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════ */}
      <section className="py-16 glass border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatBox target={10000} suffix="+" label="İşlenen Mesaj" />
          <StatBox target={500} suffix="+" label="Aktif Lead" />
          <StatBox target={96} suffix="%" label="Yanıt Oranı" />
          <StatBox target={50} suffix="+" label="Mutlu İşletme" />
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════ */}
      <section id="ozellikler" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4">
              ✨ Özellikler
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Her Şey <span className="gradient-text">Tek Panelde</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Instagram mesaj yönetiminden lead takibine, otomasyon entegrasyonundan
              detaylı raporlara kadar ihtiyacınız olan her şey.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 70}>
                <div className={`glow-${f.glow} rounded-2xl h-full`}>
                  <Card3D className="glass rounded-2xl p-6 h-full">
                    <div className={`w-12 h-12 rounded-2xl ${f.gradient} flex items-center justify-center text-2xl mb-4`}>
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </Card3D>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════ */}
      <section id="nasil-calisir" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 panel-bg opacity-50" />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4">
              🚀 Nasıl Çalışır?
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              3 Adımda <span className="gradient-text">Başla</span>
            </h2>
            <p className="text-muted-foreground">Kurulum dakikalar içinde tamamlanır. Hemen kullanmaya başlayın.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-12 left-[calc(33%+24px)] right-[calc(33%+24px)] h-px"
              style={{ background: 'linear-gradient(90deg,rgba(124,124,248,0.5),rgba(139,92,246,0.5))' }} />

            {[
              { step: '01', icon: '🔗', title: 'Hesabını Bağla', desc: 'Instagram & ManyChat hesabını birkaç tıkla entegre et. Kurulum 5 dakika.', gradient: 'stat-blue' },
              { step: '02', icon: '💬', title: 'Mesajları Yönet', desc: 'Gelen tüm DM\'ler panelinde görünür. Ekibinle yanıtla, lead olarak etiketle.', gradient: 'stat-violet' },
              { step: '03', icon: '📈', title: 'Büyümeni Ölç', desc: 'Günlük, haftalık performansını analiz et, otomasyon ile işini büyüt.', gradient: 'stat-green' },
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

      {/* ══ DASHBOARD PREVIEW ════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4">
              👁️ Ürün Önizlemesi
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Tam Kontrol <span className="gradient-text">Tek Ekranda</span>
            </h2>
            <p className="text-muted-foreground">İşte panelin gerçek görünümü. Sade, hızlı, güçlü.</p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="gradient-border rounded-3xl overflow-hidden shadow-2xl">
              <div className="glass">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 glass-subtle rounded-lg h-7 mx-4 flex items-center px-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2 shrink-0 animate-pulse" />
                    <span className="text-xs text-muted-foreground">ifox.social/panel/mesajlar</span>
                  </div>
                </div>

                {/* Fake UI */}
                <div className="flex" style={{ minHeight: 400 }}>
                  {/* Sidebar */}
                  <div className="w-44 shrink-0 border-r border-border/50 p-3 space-y-1">
                    <div className="px-2 py-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>🦊</div>
                        <span className="text-xs font-bold gradient-text">iFox</span>
                      </div>
                    </div>
                    {[
                      { icon: '▦', label: 'Dashboard', active: false },
                      { icon: '💬', label: 'Mesajlar', active: true },
                      { icon: '🎯', label: 'Leadler', active: false },
                      { icon: '📈', label: 'Raporlar', active: false },
                      { icon: '🤖', label: 'Otomasyon', active: false },
                      { icon: '👤', label: 'Hesabım', active: false },
                    ].map((item) => (
                      <div key={item.label}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${item.active ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}`}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-5 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm font-bold">Mesaj Kutusu</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <span className="text-primary font-medium">12 yeni mesaj</span> · 3 lead
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold">Tümü</span>
                        <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-border">Yeni</span>
                        <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-border">Lead</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {FAKE_MESSAGES.map((m, i) => (
                        <div key={m.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          m.lead
                            ? 'border-primary/25 bg-primary/5'
                            : 'border-border/40 hover:bg-black/2 dark:hover:bg-white/2'
                        }`} style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className={`w-8 h-8 rounded-xl ${m.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {m.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold">{m.name}</span>
                              {m.lead && (
                                <span className="text-green-500 font-semibold px-1.5 rounded-full bg-green-500/15"
                                  style={{ fontSize: 9 }}>Lead</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{m.msg}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xs text-muted-foreground">{m.time}</div>
                            <div className={`text-xs px-1.5 py-0.5 rounded-full mt-1 font-medium ${
                              m.status === 'Yeni' ? 'bg-primary/15 text-primary' :
                              m.status === 'Yanıtlandı' ? 'bg-blue-500/15 text-blue-500' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {m.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right stats */}
                  <div className="hidden lg:flex w-48 shrink-0 border-l border-border/50 p-4 flex-col gap-3">
                    <div className="text-xs font-bold mb-1">Bugünkü Özet</div>
                    {[
                      { label: 'Mesaj', value: '24', color: 'text-primary', icon: '💬', gradient: 'stat-blue' },
                      { label: 'Yeni Lead', value: '5', color: 'text-green-500', icon: '🎯', gradient: 'stat-green' },
                      { label: 'Yanıt %', value: '96%', color: 'text-blue-500', icon: '📊', gradient: 'stat-cyan' },
                    ].map((s) => (
                      <div key={s.label} className="glass-subtle rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`w-7 h-7 rounded-lg ${s.gradient} flex items-center justify-center text-sm`}>{s.icon}</div>
                          <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                    <div className="glass-subtle rounded-xl p-3">
                      <div className="text-xs font-semibold mb-2">Bu Hafta</div>
                      <div className="flex items-end gap-0.5 h-12">
                        {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-sm stat-blue" style={{ height: `${h}%`, opacity: 0.65 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ PRICING ══════════════════════════════════════════ */}
      <section id="fiyatlandirma" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 panel-bg opacity-50" />
        <div className="max-w-md mx-auto relative z-10">
          <FadeIn className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4">
              💰 Fiyatlandırma
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Basit, <span className="gradient-text">Şeffaf</span>
            </h2>
            <p className="text-muted-foreground">Sürpriz yok. Gizli ücret yok.</p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="glow-violet rounded-3xl">
              <Card3D className="gradient-border rounded-3xl overflow-hidden">
                {/* Price header */}
                <div className="stat-violet p-7 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">Standart Plan</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">En Popüler ⭐</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">₺2.000</span>
                    <span className="text-white/60">/ay</span>
                  </div>
                  <p className="text-white/50 text-xs mt-1">IBAN ile ödeme · Admin onayı sonrası erişim</p>
                </div>

                {/* Features */}
                <div className="glass p-7 rounded-b-3xl">
                  <ul className="space-y-3 mb-7">
                    {[
                      'Instagram mesaj yönetimi',
                      'Akıllı lead takibi ve kayıt',
                      'Ekip üyesi erişimi',
                      'Günlük / Haftalık / Aylık raporlar',
                      '2 otomasyon talebi dahil ücretsiz',
                      'ManyChat entegrasyonu',
                      'N8N otomasyon desteği',
                      '7/24 teknik destek',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center text-green-500 text-xs shrink-0 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/kayit" className="btn-apple py-3.5 text-sm font-semibold w-full flex items-center justify-center">
                    Hemen Başla →
                  </Link>
                  <p className="text-xs text-muted-foreground text-center mt-3">Hesap oluştur, ödeme yap, erişim aç</p>
                </div>
              </Card3D>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════ */}
      <section className="mesh-bg py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full"
            style={{ background: 'radial-gradient(ellipse,rgba(124,124,248,0.18) 0%,transparent 70%)', filter: 'blur(50px)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="text-5xl mb-6 animate-float inline-block">🦊</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
              Instagram DM&apos;lerini{' '}
              <span className="shimmer-text">Kaçırmayı Bırak</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Saniyeler içinde kurulum yap. Ekibinle birlikte yönet.
              Raporlarla büyü. Leadleri kaçırma.
            </p>
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <Link href="/kayit" className="btn-apple text-base px-10 py-4">
                Ücretsiz Başla →
              </Link>
              <Link href="/giris" className="text-sm text-white/50 hover:text-white/90 transition-colors">
                Zaten hesabım var →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' }}>🦊</div>
            <span className="font-bold text-sm gradient-text">iFox</span>
            <span className="text-sm text-muted-foreground">Social Media Control</span>
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
