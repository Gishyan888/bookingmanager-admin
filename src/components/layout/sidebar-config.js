import {
  Bell,
  Building2,
  CalendarCheck,
  Crown,
  HelpCircle,
  LayoutDashboard,
  Users,
  BedDouble,
} from 'lucide-react'

/**
 * Each item carries a translation key (`labelKey`) which is resolved in the
 * Sidebar component via `useTranslation`.
 */
export const SIDEBAR_BY_ROLE = {
  admin: {
    labelKey: 'roles.adminConsole',
    accent: 'from-violet-600 to-indigo-600',
    items: [
      { to: '/admin', icon: LayoutDashboard, labelKey: 'nav.overview', end: true },
      { to: '/admin/owners', icon: Crown, labelKey: 'nav.owners' },
      { to: '/admin/hotels', icon: Building2, labelKey: 'nav.hotels' },
      { to: '/notifications', icon: Bell, labelKey: 'nav.notifications' },
      { to: '/help', icon: HelpCircle, labelKey: 'nav.help' },
    ],
  },
  owner: {
    labelKey: 'roles.ownerPortal',
    accent: 'from-emerald-500 to-teal-600',
    items: [
      { to: '/owner', icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true },
      { to: '/owner/hotels', icon: Building2, labelKey: 'nav.myHotels' },
      { to: '/owner/rooms', icon: BedDouble, labelKey: 'nav.rooms' },
      { to: '/owner/customers', icon: Users, labelKey: 'nav.customers' },
      { to: '/owner/bookings', icon: CalendarCheck, labelKey: 'nav.bookings' },
      { to: '/notifications', icon: Bell, labelKey: 'nav.notifications' },
      { to: '/help', icon: HelpCircle, labelKey: 'nav.help' },
    ],
  },
  manager: {
    labelKey: 'roles.managerWorkspace',
    accent: 'from-sky-500 to-blue-600',
    items: [
      { to: '/manager', icon: LayoutDashboard, labelKey: 'nav.today', end: true },
      { to: '/manager/rooms', icon: BedDouble, labelKey: 'nav.rooms' },
      { to: '/manager/customers', icon: Users, labelKey: 'nav.customers' },
      { to: '/manager/bookings', icon: CalendarCheck, labelKey: 'nav.bookings' },
      { to: '/notifications', icon: Bell, labelKey: 'nav.notifications' },
      { to: '/help', icon: HelpCircle, labelKey: 'nav.help' },
    ],
  },
}
