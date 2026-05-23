'use client'

export default function CiroError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="glass rounded-2xl p-8 text-center space-y-4">
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h2 className="text-lg font-bold text-red-500">Sayfa yüklenemedi</h2>
      <pre className="text-xs text-left bg-black/10 dark:bg-white/10 rounded-xl p-4 overflow-auto max-h-60 text-red-400">
        {error?.message}
        {'\n'}
        {error?.stack}
      </pre>
      <button onClick={reset} className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white cursor-pointer">
        Tekrar Dene
      </button>
    </div>
  )
}
