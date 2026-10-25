import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen flex bg-[#eaeffa]">
      {/* Left side: Hero Student Image on desktop (matching design screenshots) */}
      <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0 overflow-hidden bg-slate-900 select-none">
        <img
          src="/images/auth.png"
          alt="Students studying outdoors"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>

      {/* Right side: Auth Form Container */}
      <div className="w-full lg:w-1/2 min-h-screen overflow-y-auto py-10 sm:py-16 px-4 sm:px-8 md:px-12 flex justify-center items-center">
        <div className="w-full max-w-110 sm:max-w-115 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}
