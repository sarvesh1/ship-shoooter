"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser()
        if (user) {
          router.push("/home")
        } else {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 flex items-center justify-center">
      <div className="text-white text-2xl font-bold">Loading...</div>
    </div>
  )
}
