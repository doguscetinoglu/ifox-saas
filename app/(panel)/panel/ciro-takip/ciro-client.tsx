'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type Entry = { id: string; date: string; ciro: number; sales: number }
type GoalMap = Record<string, { ciroGoal: number; salesGoal: number }>

// ── shared dark styles ──────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 20,
  boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
}
const INPUT: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: '#fff',
  background: 'rgba(255,255,255,0.06)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color .15s, box-shadow .15s',
}
const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'rgba(255,255,255,0.4)', marginBottom: 6,
}

// ── count-up animation ──────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1100) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) { setVal(0); return }
    const t0 = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

// ── SVG ring progress ───────────────────────────────────────────────────────
function Ring({ pct, color, size = 90 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ
  const done = pct >= 100
  const c = done ? '#34C759' : color
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 6px ${c})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color: c, textShadow: `0 0 12px ${c}`,
      }}>
        {Math.round(pct)}%
      </div>
    </div>
  )
}

// ── stat cards ──────────────────────────────────────────────────────────────
const CARDS_META = [
  { id: 'ciro',  label: 'Aylık Ciro',   grad: 'linear-gradient(135deg,#0071E3,#5856D6)', glow: 'rgba(0,113,227,.65)',  icon: '₺' },
  { id: 'sales', label: 'Toplam Satış', grad: 'linear-gradient(135deg,#34C759,#00BCD4)', glow: 'rgba(52,199,89,.6)',   icon: '↑' },
  { id: 'avg',   label: 'Günlük Ort.',  grad: 'linear-gradient(135deg,#FF9F0A,#FF6B35)', glow: 'rgba(255,159,10,.6)',  icon: '◎' },
  { id: 'order', label: 'Ort. Sipariş', grad: 'linear-gradient(135deg,#BF5AF2,#FF375F)', glow: 'rgba(191,90,242,.55)', icon: '★' },
] as const

function StatCard({ meta, rawValue, trend, sub }: {
  meta: typeof CARDS_META[number]; rawValue: number; trend: number | null; sub: string
}) {
  const animated = useCountUp(rawValue)
  const display = rawValue > 999 ? animated.toLocaleString('tr-TR') : animated
  return (
    <div className="ciro-stat-card" style={{
      background: meta.grad,
      boxShadow: `0 8px 32px ${meta.glow}, 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.18)`,
      borderRadius: 18, padding: 'clamp(16px,4vw,24px) clamp(14px,3.5vw,22px)',
    }}>
      <div className="ciro-stat-shine" />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.2)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff' }}>
          {meta.icon}
        </div>
        {trend !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 20, background: trend >= 0 ? 'rgba(52,199,89,.25)' : 'rgba(255,59,48,.25)', color: trend >= 0 ? '#4ADE80' : '#FF6B6B', fontSize: 12, fontWeight: 700 }}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: meta.id === 'sales' ? 'clamp(24px,6vw,40px)' : 'clamp(24px,6vw,34px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 6, textShadow: '0 2px 12px rgba(0,0,0,.25)' }}>
        {display}
        {meta.id === 'sales'
          ? <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 6, opacity: .75 }}>adet</span>
          : <span style={{ fontSize: 18, fontWeight: 600, marginLeft: 4, opacity: .85 }}>₺</span>}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{meta.label}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── chart tooltips ──────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(10,14,30,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 16px', backdropFilter: 'blur(16px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 5 }}>{label}</div>
      <div style={{ color: '#60A5FA', fontWeight: 700, fontSize: 15 }}>{Number(payload[0].value).toLocaleString('tr-TR')} ₺</div>
    </div>
  )
}

function LightTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(29,29,31,0.88)', backdropFilter: 'blur(12px)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13 }}>
      <div style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontSize: 12 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ fontWeight: 600 }}>
          {p.dataKey === 'ciro' ? `${Number(p.value).toLocaleString('tr-TR')} ₺` : `${p.value} adet`}
        </div>
      ))}
    </div>
  )
}

// ── PaceRow ─────────────────────────────────────────────────────────────────
function PaceRow({ label, current, required, diff, ahead, done, projected, goal, pct, suffix, daysRemaining, total }: {
  label: string; current: number; required: number; diff: number; ahead: boolean; done: boolean;
  projected: number; goal: number; pct: number; suffix: string; daysRemaining: number; total: number;
}) {
  const statusColor = done || ahead ? '#34C759' : '#FBBF24'
  const fmt = (v: number) => suffix === '₺' ? Math.round(v).toLocaleString('tr-TR') + ' ₺' : v.toFixed(1) + ' ' + suffix
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 6, fontWeight: 500 }}>Mevcut hız / gün</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{fmt(current)}</div>
        </div>
        <div style={{ background: done || ahead ? 'rgba(52,199,89,0.08)' : 'rgba(255,159,10,0.08)', border: `1px solid ${done || ahead ? 'rgba(52,199,89,0.2)' : 'rgba(255,159,10,0.2)'}`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 6, fontWeight: 500 }}>{daysRemaining > 0 ? 'Gereken hız / gün' : 'Ay bitti'}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: statusColor, letterSpacing: '-0.5px' }}>{done ? '✓ Tamam' : daysRemaining > 0 ? fmt(required) : '—'}</div>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: done || ahead ? '#34C759' : 'linear-gradient(90deg,#FF9F0A,#FF6B35)', borderRadius: 99, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          <span>{fmt(total)}</span>
          <span style={{ fontWeight: 700, color: statusColor }}>{Math.round(pct)}%</span>
          <span>{fmt(goal)}</span>
        </div>
      </div>
      {done ? (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.2)', color: '#4ADE80', fontSize: 13, fontWeight: 600 }}>
          🎉 {label} hedefine ulaştın!
        </div>
      ) : daysRemaining <= 0 ? (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          Ay tamamlandı · Gerçekleşen: {fmt(total)} / Hedef: {fmt(goal)}
        </div>
      ) : ahead ? (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(52,199,89,0.07)', border: '1px solid rgba(52,199,89,0.15)', color: '#4ADE80', fontSize: 13 }}>
          ✓ Günde <strong>{fmt(Math.abs(diff))}</strong> öndesin
          {suffix === '₺' && <span style={{ opacity: .75 }}> · Tahmini ay sonu: {fmt(projected)}</span>}
        </div>
      ) : (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.18)', fontSize: 13 }}>
          <span style={{ color: '#FBBF24' }}>
            ⚠ Hedefe ulaşmak için kalan <strong style={{ color: '#fff' }}>{daysRemaining} günde</strong>{' '}
            günlük <strong>{fmt(required)}</strong> yapman gerekiyor
          </span>
          {suffix === '₺' && projected < goal && (
            <div style={{ marginTop: 5, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
              Mevcut hızla tahmini ay sonu: {fmt(projected)} (hedefe {fmt(goal - projected)} uzak)
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── PaceCard ─────────────────────────────────────────────────────────────────
function PaceCard({ goals, monthKey, totalCiro, totalSales }: {
  goals: GoalMap; monthKey: string; totalCiro: number; totalSales: number
}) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysPassed = today.getDate()
  const daysRemaining = daysInMonth - daysPassed

  const goal = goals[monthKey] || {}
  const hasGoal = (goal.ciroGoal || 0) > 0 || (goal.salesGoal || 0) > 0

  const currentCiroDaily = daysPassed > 0 ? totalCiro / daysPassed : 0
  const ciroRemaining = Math.max(0, (goal.ciroGoal || 0) - totalCiro)
  const requiredCiroDaily = daysRemaining > 0 ? ciroRemaining / daysRemaining : 0
  const ciroAhead = requiredCiroDaily - currentCiroDaily <= 0
  const ciroDone = totalCiro >= (goal.ciroGoal || 0) && (goal.ciroGoal || 0) > 0
  const ciroProjected = currentCiroDaily * daysInMonth
  const ciroPct = (goal.ciroGoal || 0) > 0 ? Math.min(100, (totalCiro / goal.ciroGoal!) * 100) : 0

  const currentSalesDaily = daysPassed > 0 ? totalSales / daysPassed : 0
  const salesRemaining = Math.max(0, (goal.salesGoal || 0) - totalSales)
  const requiredSalesDaily = daysRemaining > 0 ? salesRemaining / daysRemaining : 0
  const salesAhead = requiredSalesDaily - currentSalesDaily <= 0
  const salesDone = totalSales >= (goal.salesGoal || 0) && (goal.salesGoal || 0) > 0
  const salesProjected = Math.round(currentSalesDaily * daysInMonth)
  const salesPct = (goal.salesGoal || 0) > 0 ? Math.min(100, (totalSales / goal.salesGoal!) * 100) : 0

  const monthLabel = today.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <div className="ciro-fade-4" style={{ ...CARD, padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>
            Tempo Analizi · {monthLabel}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Hedefe Ulaşmak İçin Günlük Hız</div>
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 20, flexShrink: 0, background: daysRemaining <= 5 ? 'rgba(255,59,48,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${daysRemaining <= 5 ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.1)'}`, fontSize: 12, fontWeight: 700, color: daysRemaining <= 5 ? '#FF6B6B' : 'rgba(255,255,255,0.5)' }}>
          {daysRemaining > 0 ? `${daysRemaining} gün kaldı` : 'Ay tamamlandı'}
        </div>
      </div>

      {!hasGoal && (
        <div style={{ padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Tempo analizi için aylık hedef belirlenmeli</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Hedefler sekmesinden bu ay için ciro ve satış hedefi gir</div>
        </div>
      )}

      {hasGoal && (goal.ciroGoal || 0) > 0 && (
        <div style={{ marginBottom: (goal.salesGoal || 0) > 0 ? 28 : 0 }}>
          {(goal.salesGoal || 0) > 0 && (
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.3)' }}>Ciro</div>
          )}
          <PaceRow label="Ciro" current={currentCiroDaily} required={requiredCiroDaily} diff={requiredCiroDaily - currentCiroDaily} ahead={ciroAhead} done={ciroDone} projected={ciroProjected} goal={goal.ciroGoal!} pct={ciroPct} suffix="₺" daysRemaining={daysRemaining} total={totalCiro} />
        </div>
      )}
      {hasGoal && (goal.ciroGoal || 0) > 0 && (goal.salesGoal || 0) > 0 && (
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />
      )}
      {hasGoal && (goal.salesGoal || 0) > 0 && (
        <div>
          {(goal.ciroGoal || 0) > 0 && (
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.3)' }}>Satış Adedi</div>
          )}
          <PaceRow label="Satış" current={currentSalesDaily} required={requiredSalesDaily} diff={requiredSalesDaily - currentSalesDaily} ahead={salesAhead} done={salesDone} projected={salesProjected} goal={goal.salesGoal!} pct={salesPct} suffix="adet" daysRemaining={daysRemaining} total={totalSales} />
        </div>
      )}
    </div>
  )
}

// ── Dashboard tab ────────────────────────────────────────────────────────────
function Dashboard({ entries, goals }: { entries: Entry[]; goals: GoalMap }) {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const me = entries.filter((e) => e.date.startsWith(monthKey))
  const prev = entries.filter((e) => e.date.startsWith(prevKey))

  const totalCiro = me.reduce((s, e) => s + e.ciro, 0)
  const totalSales = me.reduce((s, e) => s + e.sales, 0)
  const prevCiro = prev.reduce((s, e) => s + e.ciro, 0)
  const prevSales = prev.reduce((s, e) => s + e.sales, 0)

  const dailyData = [...me].sort((a, b) => a.date.localeCompare(b.date)).map((e) => ({ date: e.date.slice(5), ciro: e.ciro }))
  const avgCiro = dailyData.length > 0 ? Math.round(totalCiro / dailyData.length) : 0
  const avgOrder = totalSales > 0 ? Math.round(totalCiro / totalSales) : 0
  const ciroTrend = prevCiro > 0 ? Math.round(((totalCiro - prevCiro) / prevCiro) * 100) : null
  const salesTrend = prevSales > 0 ? Math.round(((totalSales - prevSales) / prevSales) * 100) : null

  const goal = goals[monthKey] || {}
  const ciroPct = (goal.ciroGoal || 0) > 0 ? (totalCiro / goal.ciroGoal!) * 100 : 0
  const salesPct = (goal.salesGoal || 0) > 0 ? (totalSales / goal.salesGoal!) * 100 : 0
  const monthLabel = now.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })

  const cardValues = [
    { raw: totalCiro,  trend: ciroTrend,  sub: prevCiro  > 0 ? `Geçen ay ${prevCiro.toLocaleString('tr-TR')} ₺` : 'İlk ay' },
    { raw: totalSales, trend: salesTrend, sub: prevSales > 0 ? `Geçen ay ${prevSales} adet` : 'İlk ay' },
    { raw: avgCiro,    trend: null,       sub: `${dailyData.length} gün kayıtlı` },
    { raw: avgOrder,   trend: null,       sub: 'Ciro ÷ Satış adedi' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* header */}
      <div className="ciro-fade-1">
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase' }}>
          {monthLabel}
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-1px', background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Genel Bakış
        </div>
      </div>

      {/* stat cards */}
      <div className="ciro-fade-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {CARDS_META.map((meta, i) => (
          <StatCard key={meta.id} meta={meta} rawValue={cardValues[i].raw} trend={cardValues[i].trend} sub={cardValues[i].sub} />
        ))}
      </div>

      {/* goals ring */}
      <div className="ciro-fade-3" style={{ ...CARD, padding: '24px 28px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>Aylık Hedefler</div>
        {((goal.ciroGoal || 0) > 0 || (goal.salesGoal || 0) > 0) ? (
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
            {(goal.ciroGoal || 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <Ring pct={ciroPct} color="#0071E3" />
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ciro Hedefi</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{totalCiro.toLocaleString('tr-TR')} ₺</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/ {goal.ciroGoal!.toLocaleString('tr-TR')} ₺</div>
                </div>
              </div>
            )}
            {(goal.salesGoal || 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <Ring pct={salesPct} color="#34C759" />
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Satış Hedefi</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{totalSales} adet</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/ {goal.salesGoal!} adet</div>
                </div>
              </div>
            )}
            {(goal.ciroGoal || 0) > 0 && (goal.salesGoal || 0) > 0 && (
              <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            )}
            <div>
              {(goal.ciroGoal || 0) > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Kalan Ciro</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: ciroPct >= 100 ? '#34C759' : '#60A5FA' }}>
                    {ciroPct >= 100 ? '✓ Tamamlandı' : `${Math.max(0, goal.ciroGoal! - totalCiro).toLocaleString('tr-TR')} ₺`}
                  </div>
                </div>
              )}
              {(goal.salesGoal || 0) > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Kalan Satış</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: salesPct >= 100 ? '#34C759' : '#4ADE80' }}>
                    {salesPct >= 100 ? '✓ Tamamlandı' : `${Math.max(0, goal.salesGoal! - totalSales)} adet`}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Ring pct={0} color="#0071E3" />
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ciro Hedefi</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>Belirlenmedi</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Ring pct={0} color="#34C759" />
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Satış Hedefi</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>Belirlenmedi</div>
                </div>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', padding: '10px 18px', borderRadius: 10, background: 'rgba(0,113,227,0.15)', border: '1px solid rgba(0,113,227,0.3)', color: '#60A5FA', fontSize: 13, fontWeight: 600, cursor: 'default' }}>
              Hedefler sekmesinden belirle →
            </div>
          </div>
        )}
      </div>

      {/* pace card — always visible */}
      <PaceCard goals={goals} monthKey={monthKey} totalCiro={totalCiro} totalSales={totalSales} />

      {/* daily chart */}
      {dailyData.length > 0 && (
        <div className="ciro-fade-5" style={{ ...CARD, padding: '24px 28px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Günlük Ciro</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{totalCiro.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(0,113,227,0.2)', border: '1px solid rgba(0,113,227,0.3)', color: '#60A5FA', fontSize: 12, fontWeight: 600 }}>
              {dailyData.length} gün
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071E3" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#0071E3" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} width={38} />
              <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'rgba(96,165,250,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="ciro" stroke="#3B82F6" strokeWidth={2.5} fill="url(#blueGrad)" dot={false} activeDot={{ r: 5, fill: '#60A5FA', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {entries.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Henüz veri yok</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>"Veri Gir" sekmesinden günlük ciro ve satış adedini ekle.</div>
        </div>
      )}
    </div>
  )
}

// ── DataEntry tab ────────────────────────────────────────────────────────────
function DataEntry({ entries, onRefresh }: { entries: Entry[]; onRefresh: () => Promise<void> }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [ciro, setCiro] = useState('')
  const [sales, setSales] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const monthKey = date.slice(0, 7)
  const monthEntries = entries.filter((e) => e.date.startsWith(monthKey)).sort((a, b) => b.date.localeCompare(a.date))
  const monthTotal = monthEntries.reduce((s, e) => s + e.ciro, 0)
  const salesTotal = monthEntries.reduce((s, e) => s + e.sales, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ciro || isNaN(Number(ciro)) || Number(ciro) < 0) { setError('Geçerli bir ciro tutarı girin.'); return }
    if (!sales || isNaN(Number(sales)) || Number(sales) < 0) { setError('Geçerli bir satış adedi girin.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/ciro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ciro: Number(ciro), sales: Number(sales) }),
      })
      if (!res.ok) throw new Error()
      await onRefresh()
      setSaved(true)
      setCiro('')
      setSales('')
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Kayıt sırasında hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(entry: Entry) {
    if (!confirm(`${entry.date} kaydı silinsin mi?`)) return
    setDeleting(entry.id)
    try {
      const res = await fetch(`/api/ciro/${entry.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await onRefresh()
      toast.success('Kayıt silindi')
    } catch {
      toast.error('Silme başarısız')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: 4 }}>Günlük Kayıt</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.6px' }}>Veri Gir</div>
      </div>

      <form onSubmit={handleSubmit} style={{ ...CARD, padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={LABEL}>Tarih</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Ciro (₺)</label>
            <input type="number" min="0" step="0.01" value={ciro} onChange={(e) => setCiro(e.target.value)} placeholder="0" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Satış Adedi</label>
            <input type="number" min="0" value={sales} onChange={(e) => setSales(e.target.value)} placeholder="0" style={INPUT} />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF6B6B', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.25)', color: '#4ADE80', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            <CheckCircle2 size={15} /> Kayıt eklendi.
          </div>
        )}
        <button type="submit" disabled={loading} style={{ background: '#0071E3', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1, transition: 'opacity .15s' }}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>

      {monthEntries.length > 0 && (
        <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{monthKey} Kayıtları</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{monthEntries.length} gün</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Tarih', 'Ciro', 'Satış', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthEntries.map((e) => (
                  <tr key={e.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{e.date}</td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: '#60A5FA' }}>{e.ciro.toLocaleString('tr-TR')} ₺</td>
                    <td style={{ padding: '13px 20px', color: '#fff' }}>{e.sales} adet</td>
                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(e)} disabled={deleting === e.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4, transition: 'color .15s', opacity: deleting === e.id ? 0.4 : 1 }}
                        onMouseEnter={(ev) => (ev.currentTarget.style.color = '#FF6B6B')}
                        onMouseLeave={(ev) => (ev.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Toplam</td>
                  <td style={{ padding: '12px 20px', fontWeight: 700, color: '#60A5FA' }}>{monthTotal.toLocaleString('tr-TR')} ₺</td>
                  <td style={{ padding: '12px 20px', fontWeight: 700, color: '#fff' }}>{salesTotal} adet</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Goals tab ────────────────────────────────────────────────────────────────
function monthOptions() {
  const opts: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = -2; i <= 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    opts.push({ key, label: d.toLocaleString('tr-TR', { month: 'long', year: 'numeric' }) })
  }
  return opts
}

function ProgressBar({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0
  const done = pct >= 100
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: done ? '#34C759' : color }}>{pct}% {done && '✓'}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: done ? '#34C759' : color, borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{current > 999 ? current.toLocaleString('tr-TR') + ' ₺' : current}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{goal > 999 ? goal.toLocaleString('tr-TR') + ' ₺' : goal}</span>
      </div>
    </div>
  )
}

function Goals({ goals, entries, onRefresh }: { goals: GoalMap; entries: Entry[]; onRefresh: () => Promise<void> }) {
  const options = monthOptions()
  const now = new Date()
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(currentKey)
  const [ciroGoal, setCiroGoal] = useState('')
  const [salesGoal, setSalesGoal] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const existing = goals[selectedMonth] || {}
  const monthEntries = entries.filter((e) => e.date.startsWith(selectedMonth))
  const actualCiro = monthEntries.reduce((s, e) => s + e.ciro, 0)
  const actualSales = monthEntries.reduce((s, e) => s + e.sales, 0)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/ciro/hedef', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthKey: selectedMonth, ciroGoal: Number(ciroGoal) || 0, salesGoal: Number(salesGoal) || 0 }),
      })
      if (!res.ok) throw new Error()
      await onRefresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: 4 }}>Performans</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.6px' }}>Hedefler</div>
      </div>

      <form onSubmit={handleSave} style={{ ...CARD, padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={LABEL}>Ay</label>
          <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setSaved(false); setCiroGoal(''); setSalesGoal('') }}
            style={{ ...INPUT, cursor: 'pointer' }}>
            {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={LABEL}>Ciro Hedefi (₺)</label>
            <input type="number" min="0"
              value={ciroGoal !== '' ? ciroGoal : (existing.ciroGoal || '')}
              onChange={(e) => setCiroGoal(e.target.value)}
              placeholder={existing.ciroGoal ? String(existing.ciroGoal) : 'Örn: 500000'}
              style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Satış Hedefi (adet)</label>
            <input type="number" min="0"
              value={salesGoal !== '' ? salesGoal : (existing.salesGoal || '')}
              onChange={(e) => setSalesGoal(e.target.value)}
              placeholder={existing.salesGoal ? String(existing.salesGoal) : 'Örn: 150'}
              style={INPUT} />
          </div>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.25)', color: '#4ADE80', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            <CheckCircle2 size={15} /> Hedef kaydedildi.
          </div>
        )}
        <button type="submit" disabled={loading} style={{ background: '#0071E3', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1, transition: 'opacity .15s' }}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>

      {((existing.ciroGoal || 0) > 0 || (existing.salesGoal || 0) > 0) && (
        <div style={{ ...CARD, padding: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 24 }}>{selectedMonth} Gerçekleşme</div>
          {(existing.ciroGoal || 0) > 0 && <ProgressBar label="Ciro Hedefi" current={actualCiro} goal={existing.ciroGoal!} color="#0071E3" />}
          {(existing.salesGoal || 0) > 0 && <ProgressBar label="Satış Hedefi" current={actualSales} goal={existing.salesGoal!} color="#BF5AF2" />}
        </div>
      )}

      {Object.keys(goals).length > 0 && (
        <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Tüm Hedefler</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Ay', 'Ciro Hedefi', 'Gerçekleşen', 'Satış Hedefi', 'Gerçekleşen'].map((h) => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(goals).sort(([a], [b]) => b.localeCompare(a)).map(([key, g]) => {
                  const me = entries.filter((e) => e.date.startsWith(key))
                  const aC = me.reduce((s, e) => s + e.ciro, 0)
                  const aS = me.reduce((s, e) => s + e.sales, 0)
                  return (
                    <tr key={key} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '13px 20px', fontWeight: 600, color: '#fff' }}>{key}</td>
                      <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.5)' }}>{(g.ciroGoal || 0) > 0 ? g.ciroGoal!.toLocaleString('tr-TR') + ' ₺' : '—'}</td>
                      <td style={{ padding: '13px 20px', fontWeight: 600, color: (g.ciroGoal || 0) > 0 && aC >= g.ciroGoal! ? '#34C759' : '#60A5FA' }}>{aC.toLocaleString('tr-TR')} ₺</td>
                      <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.5)' }}>{(g.salesGoal || 0) > 0 ? g.salesGoal! + ' adet' : '—'}</td>
                      <td style={{ padding: '13px 20px', fontWeight: 600, color: (g.salesGoal || 0) > 0 && aS >= g.salesGoal! ? '#34C759' : '#fff' }}>{aS} adet</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reports tab ──────────────────────────────────────────────────────────────
async function exportExcel(monthEntries: Entry[], monthKey: string) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(monthEntries.map((e) => ({ Tarih: e.date, 'Ciro (₺)': e.ciro, 'Satış Adedi': e.sales })))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ciro')
  XLSX.writeFile(wb, `ciro-${monthKey}.xlsx`)
}

async function exportPDF(monthEntries: Entry[], monthKey: string, totalCiro: number, totalSales: number) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(`Ciro Raporu - ${monthKey}`, 14, 20)
  doc.setFontSize(12)
  doc.text(`Toplam Ciro: ${totalCiro.toLocaleString('tr-TR')} TL`, 14, 32)
  doc.text(`Toplam Satis: ${totalSales} adet`, 14, 40)
  doc.setFontSize(10)
  let y = 54
  doc.text('Tarih', 14, y); doc.text('Ciro (TL)', 70, y); doc.text('Satis', 130, y)
  y += 6
  for (const e of monthEntries) {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.text(e.date, 14, y)
    doc.text(e.ciro.toLocaleString('tr-TR'), 70, y)
    doc.text(String(e.sales), 130, y)
    y += 6
  }
  doc.save(`ciro-${monthKey}.pdf`)
}

function Reports({ entries }: { entries: Entry[] }) {
  const months = [...new Set(entries.map((e) => e.date.slice(0, 7)))].sort().reverse()
  const [selected, setSelected] = useState(months[0] || '')

  if (entries.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
        <div style={{ fontWeight: 600, fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Henüz veri yok</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Veri girdikten sonra raporlar burada görünür.</div>
      </div>
    )
  }

  const monthEntries = entries.filter((e) => e.date.startsWith(selected)).sort((a, b) => a.date.localeCompare(b.date))
  const totalCiro = monthEntries.reduce((s, e) => s + e.ciro, 0)
  const totalSales = monthEntries.reduce((s, e) => s + e.sales, 0)
  const avgOrder = totalSales > 0 ? Math.round(totalCiro / totalSales) : 0

  const allMonths = [...new Set(entries.map((e) => e.date.slice(0, 7)))].sort().slice(-12)
  const monthlyTrend = allMonths.map((m) => {
    const me = entries.filter((e) => e.date.startsWith(m))
    return { month: m.slice(5), ciro: me.reduce((s, e) => s + e.ciro, 0), sales: me.reduce((s, e) => s + e.sales, 0) }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: 4 }}>Detaylı Analiz</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.6px' }}>Raporlar</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            style={{ ...INPUT, width: 'auto', padding: '8px 12px', cursor: 'pointer' }}>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={() => exportExcel(monthEntries, selected)}
            style={{ background: '#34C759', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ Excel
          </button>
          <button onClick={() => exportPDF(monthEntries, selected, totalCiro, totalSales)}
            style={{ background: '#FF3B30', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Toplam Ciro', value: `${totalCiro.toLocaleString('tr-TR')} ₺`, color: '#60A5FA' },
          { label: 'Toplam Satış', value: `${totalSales} adet`, color: undefined },
          { label: 'Kayıtlı Gün', value: `${monthEntries.length} gün`, color: undefined },
          { label: 'Ort. Sipariş', value: avgOrder > 0 ? `${avgOrder.toLocaleString('tr-TR')} ₺` : '—', color: undefined },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...CARD, padding: 20 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color: color || '#fff' }}>{value}</div>
          </div>
        ))}
      </div>

      {monthEntries.length > 0 && (
        <div style={{ ...CARD, padding: '24px 28px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Günlük Ciro — {selected}</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthEntries.map((e) => ({ date: e.date.slice(5), ciro: e.ciro, sales: e.sales }))} barSize={24}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} width={38} />
              <Tooltip content={<LightTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="ciro" fill="#0071E3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyTrend.length > 1 && (
        <div style={{ ...CARD, padding: '24px 28px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Aylık Ciro Trendi</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} width={38} />
              <Tooltip content={<LightTooltip />} cursor={{ stroke: '#0071E3', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="ciro" stroke="#0071E3" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#0071E3', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Gün Detayı</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Tarih', 'Ciro', 'Satış Adedi', 'Kümülatif Ciro'].map((h) => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                let cum = 0
                return monthEntries.map((e) => {
                  cum += e.ciro
                  return (
                    <tr key={e.date} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{e.date}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: '#60A5FA' }}>{e.ciro.toLocaleString('tr-TR')} ₺</td>
                      <td style={{ padding: '12px 20px', color: '#fff' }}>{e.sales} adet</td>
                      <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.4)' }}>{cum.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  )
                })
              })()}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '12px 20px', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Toplam</td>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: '#60A5FA' }}>{totalCiro.toLocaleString('tr-TR')} ₺</td>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: '#fff' }}>{totalSales} adet</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────
const TABS = ['Dashboard', 'Veri Gir', 'Hedefler', 'Raporlar'] as const
type Tab = typeof TABS[number]

export default function CiroClient({ entries: initial, goals: initialGoals }: { entries: Entry[]; goals: GoalMap }) {
  const [tab, setTab] = useState<Tab>('Dashboard')
  const [entries, setEntries] = useState<Entry[]>(initial)
  const [goals, setGoals] = useState<GoalMap>(initialGoals)

  const refresh = useCallback(async () => {
    const [eRes, gRes] = await Promise.all([fetch('/api/ciro'), fetch('/api/ciro/hedef')])
    if (eRes.ok) setEntries(await eRes.json())
    if (gRes.ok) setGoals(await gRes.json())
  }, [])

  return (
    <div style={{
      background: 'linear-gradient(160deg, #060D1F 0%, #0D1933 45%, #0A0618 100%)',
      borderRadius: 20,
      padding: '32px 28px 48px',
      minHeight: '70vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* dot grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      {/* ambient glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,113,227,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(175,82,222,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(52,199,89,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>📈 Ciro Takip</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Günlük ciro ve satış analizi</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '6px 12px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34C759', display: 'inline-block', boxShadow: '0 0 6px #34C759' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Aktif</span>
          </div>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, width: 'fit-content', marginBottom: 28 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '8px 18px', fontSize: 13, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                background: tab === t ? 'rgba(0,113,227,0.25)' : 'transparent',
                color: tab === t ? '#60A5FA' : 'rgba(255,255,255,0.45)',
                boxShadow: tab === t ? '0 0 0 1px rgba(0,113,227,0.4)' : 'none',
              }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Dashboard' && <Dashboard entries={entries} goals={goals} />}
        {tab === 'Veri Gir'  && <DataEntry entries={entries} onRefresh={refresh} />}
        {tab === 'Hedefler'  && <Goals goals={goals} entries={entries} onRefresh={refresh} />}
        {tab === 'Raporlar'  && <Reports entries={entries} />}
      </div>
    </div>
  )
}
