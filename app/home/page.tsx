"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, signOut, getUserData } from "@/lib/auth"
import { Users, Settings, ShoppingCart, Car, Play, Heart, Coins, LogOut } from "lucide-react"

interface UserData {
  username: string
  points: number
  lives: number
  currency: number
  current_ship: string
}

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUserData() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const data = await getUserData()
        if (data) {
          setUserData({
            username: data.username,
            points: data.points,
            lives: data.lives,
            currency: data.currency,
            current_ship: data.current_ship,
          })
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500">
        {/* Animated Clouds Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-20 bg-white rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute top-20 right-20 w-40 h-24 bg-white rounded-full opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/4 w-28 h-16 bg-white rounded-full opacity-75 animate-pulse delay-500"></div>
          <div className="absolute top-60 right-1/3 w-36 h-22 bg-white rounded-full opacity-65 animate-pulse delay-1500"></div>
          <div className="absolute bottom-40 left-16 w-44 h-26 bg-white rounded-full opacity-70 animate-pulse delay-2000"></div>
          <div className="absolute bottom-60 right-12 w-32 h-18 bg-white rounded-full opacity-80 animate-pulse delay-700"></div>
        </div>

        {/* Top UI Bar */}
        <div className="relative z-10 flex justify-between items-center p-4">
          {/* Left Stats */}
          <div className="flex items-center space-x-4">
            <div className="bg-gray-800 border-4 border-gray-600 rounded-lg px-4 py-2 flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-white font-bold">{userData?.lives || 0}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400">15</span>
            </div>
          </div>

          {/* Center Stats */}
          <div className="flex items-center space-x-4">
            <div className="bg-gray-800 border-4 border-gray-600 rounded-lg px-4 py-2 flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-sm"></div>
              <span className="text-white font-bold">{userData?.points || 0}</span>
            </div>
            <div className="bg-gray-800 border-4 border-gray-600 rounded-lg px-4 py-2 flex items-center space-x-2">
              <Coins className="h-6 w-6 text-yellow-400" />
              <span className="text-white font-bold">{userData?.currency || 0}</span>
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 border-4 border-orange-600 rounded-lg px-3 py-2">
              <span className="text-white font-bold text-sm">6/8</span>
            </div>
            <div className="bg-blue-500 border-4 border-blue-600 rounded-lg p-2">
              <div className="w-6 h-6 bg-blue-300 rounded-sm"></div>
            </div>
            <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Animated Ship in Center */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            {/* Ship Body */}
            <div className="animate-bounce">
              <div className="relative">
                {/* Main Ship */}
                <div className="w-16 h-20 bg-red-600 rounded-t-full border-4 border-red-800 relative">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-red-400 rounded-full"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gray-300 rounded-full"></div>
                </div>

                {/* Wings */}
                <div className="absolute top-8 -left-6 w-6 h-12 bg-red-500 transform -skew-y-12 border-2 border-red-700"></div>
                <div className="absolute top-8 -right-6 w-6 h-12 bg-red-500 transform skew-y-12 border-2 border-red-700"></div>

                {/* Exhaust Flame */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-12 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 rounded-b-full animate-pulse"></div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-b from-white via-yellow-300 to-orange-400 rounded-b-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom UI Panel */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Player Name Bar */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-800 border-4 border-gray-600 rounded-lg px-8 py-2">
              <span className="text-blue-400 font-bold text-sm">name: </span>
              <span className="text-white font-bold">{userData?.username || "Player"}</span>
            </div>
          </div>

          {/* Main Navigation Panel */}
          <div className="bg-gradient-to-t from-gray-800 via-gray-700 to-gray-600 border-t-4 border-gray-500 p-6">
            <div className="flex justify-center items-center max-w-6xl mx-auto">
              {/* Left Buttons */}
              <div className="flex flex-col space-y-4 flex-1">
                <Button
                  onClick={() => router.push("/friends")}
                  className="h-20 bg-blue-600 hover:bg-blue-700 border-4 border-blue-800 text-white font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col items-center">
                    <Users className="h-8 w-8 mb-1" />
                    <span>FRIENDS</span>
                  </div>
                </Button>
                <Button
                  onClick={() => router.push("/garage")}
                  className="h-20 bg-blue-600 hover:bg-blue-700 border-4 border-blue-800 text-white font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col items-center">
                    <Car className="h-8 w-8 mb-1" />
                    <span>GARAGE</span>
                  </div>
                </Button>
              </div>

              {/* Center Play Button */}
              <div className="flex-1 flex justify-center px-8">
                <Button
                  onClick={() => router.push("/game")}
                  className="h-32 w-64 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 border-8 border-blue-900 text-white font-bold text-4xl rounded-2xl shadow-2xl transform hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col items-center">
                    <Play className="h-12 w-12 mb-2" />
                    <span>PLAY</span>
                  </div>
                </Button>
              </div>

              {/* Right Buttons */}
              <div className="flex flex-col space-y-4 flex-1">
                <Button
                  onClick={() => router.push("/store")}
                  className="h-20 bg-blue-600 hover:bg-blue-700 border-4 border-blue-800 text-white font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col items-center">
                    <ShoppingCart className="h-8 w-8 mb-1" />
                    <span>STORE</span>
                  </div>
                </Button>
                <Button
                  onClick={() => router.push("/settings")}
                  className="h-20 bg-blue-600 hover:bg-blue-700 border-4 border-blue-800 text-white font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col items-center">
                    <Settings className="h-8 w-8 mb-1" />
                    <span>SETTINGS</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
