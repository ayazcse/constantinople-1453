import {
  LayoutDashboard, Clock, Map, ShieldHalf, Scale,
  ArrowLeftRight, TrendingUp, Lightbulb, Table2, BookMarked,
} from 'lucide-react'

export const NAV = [
  { to: '/', label: 'Executive Overview', icon: LayoutDashboard, num: '01' },
  { to: '/timeline', label: 'Campaign Timeline', icon: Clock, num: '02' },
  { to: '/geography', label: 'Geography & Strategy', icon: Map, num: '03' },
  { to: '/defensive', label: 'Defensive Systems', icon: ShieldHalf, num: '04' },
  { to: '/factors', label: 'Factors Behind 1453', icon: Scale, num: '05' },
  { to: '/before-after', label: 'Before vs After', icon: ArrowLeftRight, num: '06' },
  { to: '/transformation', label: 'Into Istanbul', icon: TrendingUp, num: '07' },
  { to: '/insights', label: 'Analytical Insights', icon: Lightbulb, num: '08' },
  { to: '/explorer', label: 'Data Explorer', icon: Table2, num: '09' },
  { to: '/methodology', label: 'Methodology & Sources', icon: BookMarked, num: '10' },
]
