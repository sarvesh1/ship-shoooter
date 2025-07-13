"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, getUserData, updateUserData } from "@/lib/auth"
import { SHIP_CATEGORIES } from "@/lib/game-data"
import { ArrowLeft, ShoppingCart, Coins, Lock } from "lucide-react"

interface UserProgress {
  currency: number
  unlocked_ships: string[]
}

export default function StorePage() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
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
            currency: data.currency,
            unlocked_ships: data.unlocked_ships,
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

  async function purchaseShip(shipId: string, cost: number) {
    if (!userProgress || userProgress.currency < cost) {
      alert("Insufficient currency!")
      return
    }

    try {
      const newUnlockedShips = [...userProgress.unlocked_ships, shipId]
      const newCurrency = userProgress.currency - cost

      await updateUserData({
        currency: newCurrency,
        unlocked_ships: newUnlockedShips,
      })

      setUserProgress({
        currency: newCurrency,
        unlocked_ships: newUnlockedShips,
      })
      alert("Ship purchased successfully!")
    } catch (error) {
      console.error("Failed to purchase ship:", error)
      alert("Purchase failed!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  // Get all purchasable ships (excluding free ones)
  const purchasableShips = Object.entries(SHIP_CATEGORIES).flatMap(([category, data]) =>
    data.ships.filter((ship) => ship.cost > 0).map((ship) => ({ ...ship, category, categoryColor: data.color })),
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.push("/home")} variant="ghost" className="text-white hover:bg-white/20">
            <ArrowLeft className="h-6 w-6 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Store</h1>
          <div className="flex items-center text-white font-bold">
            <Coins className="h-5 w-5 mr-1 text-yellow-400" />
            {userProgress?.currency || 0}
          </div>
        </div>

        {/* Store Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {purchasableShips.map((ship) => {
            const isUnlocked = userProgress?.unlocked_ships?.includes(ship.id)
            const canAfford = (userProgress?.currency || 0) >= ship.cost

            return (
              <Card key={ship.id} className="bg-white/90">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{ship.name}</CardTitle>
                    <Badge style={{ backgroundColor: ship.categoryColor }} className="text-white">
                      {ship.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Ship Preview */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-4xl">🚀</div>
                  </div>

                  {/* Ship Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Speed:</span>
                      <span>★★★☆☆</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Damage:</span>
                      <span>★★☆☆☆</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Health:</span>
                      <span>★★★★☆</span>
                    </div>
                  </div>

                  {/* Purchase Section */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-lg font-bold">
                      <Coins className="h-5 w-5 mr-1 text-yellow-500" />
                      {ship.cost}
                    </div>
                    {isUnlocked ? (
                      <Button disabled className="bg-green-600">
                        Owned
                      </Button>
                    ) : !canAfford ? (
                      <Button disabled className="bg-gray-400">
                        <Lock className="h-4 w-4 mr-2" />
                        Can't Afford
                      </Button>
                    ) : (
                      <Button
                        onClick={() => purchaseShip(ship.id, ship.cost)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Currency Packs */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Currency Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Starter Pack", coins: 500, price: "$2.99", popular: false },
              { name: "Value Pack", coins: 1200, price: "$5.99", popular: true },
              { name: "Mega Pack", coins: 2500, price: "$9.99", popular: false },
            ].map((pack) => (
              <Card key={pack.name} className={`bg-white/90 ${pack.popular ? "ring-2 ring-yellow-400" : ""}`}>
                <CardHeader>
                  <div className="text-center">
                    {pack.popular && <Badge className="mb-2 bg-yellow-500 text-black">Most Popular</Badge>}
                    <CardTitle>{pack.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold mb-2 flex items-center justify-center">
                    <Coins className="h-8 w-8 mr-2 text-yellow-500" />
                    {pack.coins}
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-4">{pack.price}</div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => alert("Purchase feature coming soon!")}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
