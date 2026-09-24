import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, X, Landmark } from 'lucide-react'
import { NAV } from '../lib/nav'

function NavItems({ onClick }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ to, label, icon: Icon, num }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onClick}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? 'bg-gold/10 text-gold-bright'
                : 'text-parchment-dim hover:text-parchment hover:bg-ink-panel'
            }`
          }
        >
          <span className="text-[10px] tabular-nums text-parchment-faint w-4 shrink-0 group-hover:text-gold/70">
            {num}
          </span>
          <Icon size={16} strokeWidth={1.75} className="shrink-0" />
          <span className="font-medium tracking-tight">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 border-r border-ink-line px-5 py-6 sticky top-0 h-screen overflow-y-auto">
        <Brand />
        <div className="mt-8 flex-1">
          <NavItems />
        </div>
        <Footer />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-ink/90 backdrop-blur border-b border-ink-line">
        <Brand compact />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-md border border-ink-line text-parchment-dim"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-ink border-r border-ink-line px-5 py-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1.5 text-parchment-dim">
                <X size={20} />
              </button>
            </div>
            <NavItems onClick={() => setOpen(false)} />
            <Footer />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-gold-bright to-gold-dim flex items-center justify-center shrink-0">
        <Landmark size={16} className="text-ink" strokeWidth={2.25} />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-[15px] text-parchment tracking-wide">Constantinople 1453</div>
          <div className="text-[10px] uppercase tracking-widish text-parchment-faint">Data Intelligence Project</div>
        </div>
      )}
    </div>
  )
}

function Footer() {
  return (
    <div className="mt-6 pt-4 border-t border-ink-line text-[11px] text-parchment-faint leading-relaxed">
      A sourced, validated dataset — not a Wikipedia summary.
      <NavLink to="/methodology" className="block mt-1 text-gold/80 hover:text-gold underline underline-offset-2">
        Methodology &amp; sources →
      </NavLink>
    </div>
  )
}
