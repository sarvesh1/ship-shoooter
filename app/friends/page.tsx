"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, UserPlus, Mail, User } from "lucide-react"

interface Friend {
  id: string
  username: string
  status: string
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([
    { id: "1", username: "SpaceAce", status: "online" },
    { id: "2", username: "StarFighter", status: "online" },
    { id: "3", username: "CosmicPilot", status: "offline" },
  ])
  const [inviteInput, setInviteInput] = useState("")
  const [inviteType, setInviteType] = useState<"email" | "username">("username")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

  async function sendFriendInvite() {
    if (!inviteInput.trim()) return

    // Mock friend invite
    alert(`Friend request sent to ${inviteInput}!`)
    setInviteInput("")
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
          <h1 className="text-3xl font-bold text-white">Friends</h1>
          <div className="w-16" />
        </div>

        {/* Add Friend Section */}
        <Card className="mb-6 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Add Friend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setInviteType("username")}
                variant={inviteType === "username" ? "default" : "outline"}
                size="sm"
              >
                <User className="h-4 w-4 mr-1" />
                Username
              </Button>
              <Button
                onClick={() => setInviteType("email")}
                variant={inviteType === "email" ? "default" : "outline"}
                size="sm"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={inviteType === "email" ? "Enter email address" : "Enter username"}
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={sendFriendInvite} className="bg-purple-600 hover:bg-purple-700">
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Friends List */}
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Your Friends ({friends.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{friend.username}</p>
                      <p className={`text-sm ${friend.status === "online" ? "text-green-500" : "text-gray-500"}`}>
                        {friend.status === "online" ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled={friend.status === "offline"}>
                    Invite to Game
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
