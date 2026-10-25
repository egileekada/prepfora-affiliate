import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Logo } from '../Logo'
import { LayoutGrid, Users, Briefcase, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthApi } from '@/hooks'
import { clearSession } from '@/config/httpService'

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCurrentAffiliate } = useAuthApi()

  const [user, setUser] = useState<{ name: string; email: string; role: string; code?: string }>(() => {
    try {
      const stored = localStorage.getItem('prepfora_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        const fullName =
          parsed.name ||
          (parsed.first_name
            ? `${parsed.first_name} ${parsed.last_name || ''}`.trim()
            : 'Affiliate Partner')
        return {
          name: fullName,
          email: parsed.email || 'partner@prepfora.com',
          role: parsed.role || 'Affiliate',
          code: parsed.code,
        }
      }
    } catch {
      // fallback
    }
    return {
      name: 'Affiliate Partner',
      email: 'partner@prepfora.com',
      role: 'Affiliate',
    }
  })

  useEffect(() => {
    let mounted = true
    getCurrentAffiliate().then((res) => {
      if (mounted && res.success && res.affiliate) {
        setUser({
          name: res.affiliate.name || 'Affiliate Partner',
          email: res.affiliate.email || 'partner@prepfora.com',
          role: 'Affiliate',
          code: res.affiliate.code,
        })
      }
    })
    return () => {
      mounted = false
    }
  }, [getCurrentAffiliate])

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      exact: true,
      icon: LayoutGrid,
    },
    {
      label: 'My Referrals',
      path: '/dashboard/referrals',
      exact: false,
      icon: Users,
    },
    {
      label: 'Earnings',
      path: '/dashboard/earnings',
      exact: false,
      icon: Briefcase,
    },
  ]

  const isNavActive = (itemPath: string, exact: boolean) => {
    if (exact) {
      return location.pathname === itemPath || location.pathname === `${itemPath}/`
    }
    return location.pathname.startsWith(itemPath)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#eaeffa]">
      {/* =========================================
          DESKTOP SIDEBAR (Screenshots 2 & 5)
         ========================================= */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#2563eb] min-h-screen text-white p-6 justify-between shrink-0 shadow-sm sticky top-0 h-screen select-none">
        <div>
          {/* Top Brand Logo with White text */}
          <div className="pb-8 pt-2">
            <Logo width={140} white />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = isNavActive(item.path, item.exact)
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0c1e4e] text-white shadow-sm'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom User Profile Badge (Jane Doe, Admin) */}
        <div className="bg-[#1d4ed8] rounded-2xl p-3 flex items-center justify-between border border-blue-400/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-white/50 shrink-0 flex items-center justify-center font-bold text-sm text-white">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .filter(Boolean)
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'AP'}
            </div>

            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate leading-tight">
                {user.name}
              </div>
              <div className="text-xs text-blue-200">{user.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* =========================================
          MAIN OUTLET AREA
         ========================================= */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-24 lg:pb-10 p-4 sm:p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* =========================================
          MOBILE BOTTOM NAVIGATION (Screenshots 1, 3, 4)
         ========================================= */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#2563eb] h-18 px-4 flex items-center justify-around z-50 lg:hidden shadow-lg select-none border-t border-blue-400/30">
        {navItems.map((item) => {
          const active = isNavActive(item.path, item.exact)
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={`flex items-center justify-center transition-all ${
                active
                  ? 'bg-[#0c1e4e] text-white px-4 py-2.5 rounded-xl gap-2 font-medium text-xs shadow-sm'
                  : 'text-white/80 p-2.5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {active && (
                <span>
                  {item.label === 'My Referrals' ? 'Referrals' : item.label}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
