"use client"

import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, Users, Trophy } from "lucide-react"

// Phaser game will be loaded dynamically
let Phaser: any = null

// Connect to Socket.IO server at /api/socket
const socket = io("/api/socket", { transports: ["websocket"] })

export default function GameClient() {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [players, setPlayers] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (typeof socket !== "undefined") {
      socket.on("scoreUpdate", ({ playerId, score }) => {
        setPlayers((prev: any[]) => {
          const updated = prev.filter((p) => p.id !== playerId)
          return [...updated, { id: playerId, score }]
        })
        if (playerId === socket.id) {
          setPlayerScore(score)
        }
      })
    }
    return () => {
      if (typeof socket !== "undefined") {
        socket.off("scoreUpdate")
      }
    }
  }, [])

  useEffect(() => {
    async function loadPhaser() {
      try {
        const PhaserModule = await import("phaser")
        Phaser = PhaserModule.default || PhaserModule
        if (gameRef.current && !phaserGameRef.current) {
          initializeGame()
        }
      } catch (error) {
        console.error("Failed to load Phaser:", error)
        setGameLoaded(true)
      }
    }
    loadPhaser()
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [])

  function initializeGame() {
    if (!Phaser || !gameRef.current) return
    // ...existing Phaser config and scene setup...
  }

  // ...existing hooks and logic...

  return (
    <AuthGuard>
      <div className="absolute inset-0">
        <div ref={gameRef} className="w-full h-full" />
        {/* ...rest of your UI... */}
      </div>
    </AuthGuard>
  )
}
