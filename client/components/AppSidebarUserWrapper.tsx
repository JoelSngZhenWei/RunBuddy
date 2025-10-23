"use client"

import * as React from "react"
import { AppSidebarUser } from "./AppSidebarUser"
import StravaLogInButton from "@/components/StravaLogInButton"
import { Skeleton } from "./ui/skeleton"

export default function AppSidebarUserWrapper() {
    const [user, setUser] = React.useState<{
        username: string
        avatar: string
        id: number
    } | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/strava/me", { cache: "no-store" })
                if (res.ok) {
                    const data = await res.json()
                    if (data.username || data.avatar || data.id) {
                        setUser({
                            username: data.username || "Guest",
                            avatar: data.avatar || "",
                            id: data.id ? Number(data.id) : 0,
                        })
                    }
                }
            } catch (err) {
                console.error("Failed to fetch Strava user:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    // still loading
    if (loading) {
        return (
            <div className="flex items-center space-x-2 px-1 py-1.5">
                <Skeleton className="h-8 w-11 rounded-full" />
                <Skeleton className="h-8 w-[250px]" />
            </div>
        )
    }

    // no user found → show login button
    if (!user) {
        return (
            <div className="p-3">
                <StravaLogInButton />
            </div>
        )
    }

    // user found → show sidebar dropdown
    return <AppSidebarUser user={user} />
}
