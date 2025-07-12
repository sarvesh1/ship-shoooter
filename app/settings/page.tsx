"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, signOut, getUserData, updateUserData } from "@/lib/auth"
import { ArrowLeft, User, Volume2, Gamepad2, LogOut } from "lucide-react"

interface UserProfile {
  username: string
  email: string
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [newUsername, setNewUsername] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicVolume, setMusicVolume] = useState([75])
  const [sfxVolume, setSfxVolume] = useState([75])
  const [autoAim, setAutoAim] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const data = await getUserData()
        if (data) {
          setUserProfile({
            username: data.username,
            email: data.email,
          })
          setNewUsername(data.username)
        }
      } catch (error) {
        console.error("Failed to load user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  async function updateUsername() {
    if (!newUsername.trim() || newUsername === userProfile?.username) return

    try {
      await updateUserData({ username: newUsername.trim() })
      setUserProfile((prev) => (prev ? { ...prev, username: newUsername.trim() } : null))
      alert("Username updated successfully!")
    } catch (error) {
      console.error("Failed to update username:", error)
      alert("Failed to update username")
    }
  }

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
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.push("/home")} variant="ghost" className="text-white hover:bg-white/20">
            <ArrowLeft className="h-6 w-6 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <div className="w-16" />
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Settings */}
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input value={userProfile?.email || ""} disabled className="bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <div className="flex gap-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                  />
                  <Button
                    onClick={updateUsername}
                    disabled={!newUsername.trim() || newUsername === userProfile?.username}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="h-5 w-5 mr-2" />
                Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sound Effects</label>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Music Volume: {musicVolume[0]}%</label>
                <Slider value={musicVolume} onValueChange={setMusicVolume} max={100} step={1} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SFX Volume: {sfxVolume[0]}%</label>
                <Slider value={sfxVolume} onValueChange={setSfxVolume} max={100} step={1} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gamepad2 className="h-5 w-5 mr-2" />
                Gameplay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto-Aim Assist</label>
                  <p className="text-xs text-gray-500">Helps with targeting enemies</p>
                </div>
                <Switch checked={autoAim} onCheckedChange={setAutoAim} />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSignOut} className="w-full bg-red-600 hover:bg-red-700 text-white">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
