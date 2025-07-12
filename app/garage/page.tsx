"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, getUserData, updateUserData } from "@/lib/auth"
import { SHIP_CATEGORIES, SHIP_DESIGNS } from "@/lib/game-data"
import { ArrowLeft, Lock, Check } from "lucide-react"

interface UserProgress {
  current_ship: string
  unlocked_ships: string[]
  currency: number
}

export default function GaragePage() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Common")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUserProgress() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const data = await getUserData()
        if (data) {
          setUserProgress({
            current_ship: data.current_ship,
            unlocked_ships: data.unlocked_ships,
            currency: data.currency,
          })
        }
      } catch (error) {
        console.error("Failed to load user progress:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProgress()
  }, [])

  async function equipShip(shipId: string) {
    try {
      const user = await getCurrentUser()
      if (!user || !userProgress) return

      await updateUserData({ current_ship: shipId })
      setUserProgress({ ...userProgress, current_ship: shipId })
    } catch (error) {
      console.error("Failed to equip ship:", error)
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
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.push("/home")} variant="ghost" className="text-white hover:bg-white/20">
            <ArrowLeft className="h-6 w-6 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Garage</h1>
          <div className="w-16" />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {Object.entries(SHIP_CATEGORIES).map(([category, data]) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`font-bold ${
                selectedCategory === category
                  ? "bg-white text-gray-800"
                  : "bg-white/20 text-white border-white/30 hover:bg-white/30"
              }`}
              style={{
                backgroundColor: selectedCategory === category ? data.color : undefined,
              }}
            >
              {category} ({data.ships.length})
            </Button>
          ))}
        </div>

        {/* Ships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {SHIP_CATEGORIES[selectedCategory as keyof typeof SHIP_CATEGORIES].ships.map((ship) => {
            const isUnlocked = userProgress?.unlocked_ships?.includes(ship.id) || ship.unlocked
            const isEquipped = userProgress?.current_ship === ship.id
            const shipDesign = SHIP_DESIGNS[ship.id as keyof typeof SHIP_DESIGNS]

            return (
              <Card key={ship.id} className="bg-white/90 hover:bg-white/95 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{ship.name}</CardTitle>
                    <Badge
                      variant={isEquipped ? "default" : "secondary"}
                      style={{
                        backgroundColor: isEquipped
                          ? SHIP_CATEGORIES[selectedCategory as keyof typeof SHIP_CATEGORIES].color
                          : undefined,
                      }}
                    >
                      {isEquipped ? "Equipped" : selectedCategory}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Ship Preview */}
                  <div className="w-full h-32 bg-gradient-to-b from-sky-200 to-sky-300 rounded-lg flex items-center justify-center mb-4 border-2 border-sky-400">
                    <div
                      className="text-6xl transform hover:scale-110 transition-transform"
                      style={{ filter: isUnlocked ? "none" : "grayscale(100%) brightness(0.5)" }}
                    >
                      {shipDesign?.emoji || "🚀"}
                    </div>
                  </div>

                  {/* Ship Description */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 italic">{shipDesign?.description || "A powerful spacecraft"}</p>
                  </div>

                  {/* Ship Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Speed:</span>
                      <span className="text-yellow-500">
                        {"★".repeat(Math.floor(Math.random() * 3) + 2)}
                        {"☆".repeat(5 - (Math.floor(Math.random() * 3) + 2))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Damage:</span>
                      <span className="text-red-500">
                        {"★".repeat(Math.floor(Math.random() * 3) + 2)}
                        {"☆".repeat(5 - (Math.floor(Math.random() * 3) + 2))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Health:</span>
                      <span className="text-green-500">
                        {"★".repeat(Math.floor(Math.random() * 3) + 2)}
                        {"☆".repeat(5 - (Math.floor(Math.random() * 3) + 2))}
                      </span>
                    </div>
                  </div>

                  {/* Ship Actions */}
                  <div className="flex justify-center">
                    {!isUnlocked ? (
                      <Button disabled className="bg-gray-400 w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        Locked
                      </Button>
                    ) : isEquipped ? (
                      <Button disabled className="bg-green-600 w-full">
                        <Check className="h-4 w-4 mr-2" />
                        Equipped
                      </Button>
                    ) : (
                      <Button onClick={() => equipShip(ship.id)} className="bg-blue-600 hover:bg-blue-700 w-full">
                        Equip Ship
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AuthGuard>
  )
}
