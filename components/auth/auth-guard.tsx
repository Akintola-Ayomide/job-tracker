"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
    children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter()
    const { isAuthenticated, fetchCurrentUser } = useAppStore()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated) {
                router.push("/auth/login")
                return
            }

            try {
                await fetchCurrentUser()
                setIsChecking(false)
            } catch (error) {
                router.push("/auth/login")
            }
        }

        checkAuth()
    }, [isAuthenticated, fetchCurrentUser, router])

    if (isChecking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
