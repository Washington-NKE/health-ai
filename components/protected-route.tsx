"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type { UserRole } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'loading') {
      if (!session) {
        router.push('/login')
      } else if (allowedRoles) {
        const role = (session.user as any)?.role as UserRole | undefined
        if (!role || !allowedRoles.includes(role)) {
          router.push('/login')
        }
      }
    }
  }, [session, status, allowedRoles, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
