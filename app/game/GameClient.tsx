// Add custom property to window for Phaser multiplayer sync
declare global {
  interface Window {
    __otherPlayers?: { id: string; name: string; x: number; y: number }[]
  }
}
"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, Users, Trophy } from "lucide-react"


// Phaser game will be loaded dynamically
let Phaser: any = null

export default function GamePage() {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  // Leaderboard state: top 3 players from the server
  const [players, setPlayers] = useState<{ name: string; coins: number }[]>([])
  // Player's name (should be passed from home screen)
  const [myName, setMyName] = useState<string>("")
  // Track the current player's coins
  const [myCoins, setMyCoins] = useState(0)
  // Track other players (id, name, x, y, etc)
  const [otherPlayers, setOtherPlayers] = useState<{ id: string; name: string; x: number; y: number }[]>([])
  // Socket ref
  const socketRef = useRef<Socket | null>(null)
  const router = useRouter()

  // Step 1: Get player name from localStorage on mount
  useEffect(() => {
    let playerName = ""
    if (typeof window !== "undefined") {
      playerName = localStorage.getItem("playerName") || "DemoPlayer"
    }
    setMyName(playerName)
  }, [])

  // Step 2: Only initialize socket and Phaser after myName is set
  useEffect(() => {
    if (!myName) return;

    // Always connect to ws://<host>:4001 for Socket.IO (default path)
    let serverUrl = ""
    if (typeof window !== "undefined") {
      const { hostname } = window.location;
      serverUrl = `ws://${hostname}:4001`;
      console.log("[CLIENT] Connecting to Socket.IO server at:", serverUrl)
    }
    // Connect to Socket.IO server (default path: /socket.io)
    const socket = io(serverUrl)
    socketRef.current = socket

    // Listen for name conflict and handle (optional, server should enforce uniqueness)
    socket.on("name-taken", () => {
      alert("Name is already taken. Please choose another name.")
      router.push("/home")
    })

    // Listen for other players' updates and update leaderboard
    socket.on("players-update", (playersRaw: any[]) => {
      // Filter out self for otherPlayers
      setOtherPlayers(
        playersRaw.filter((p) => p.name !== myName)
      )
      // Sort all players by coins descending, take top 3 for leaderboard
      const sorted = [...playersRaw].sort((a, b) => (b.coins || 0) - (a.coins || 0)).slice(0, 3)
      setPlayers(sorted.map(p => ({ name: p.name, coins: p.coins || 0 })))
    })

    // Load Phaser dynamically
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
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [myName])

  function initializeGame() {
    if (!Phaser || !gameRef.current) return

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      backgroundColor: "#7C3AED", // Plain purple background
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    }

    phaserGameRef.current = new Phaser.Game(config)
    setGameLoaded(true)
  }

  function preload(this: any) {
    // Load the volcano image
    this.load.image("volcano", "/images/volcano.png")

    // Load the pixelated coin image
    this.load.image("coin", "/images/coin.png")

    // Load the spaceship image
    this.load.image("player", "/images/spaceship.png")

    // Load the rocket image
    this.load.image("rocket", "/images/rocket.png")

    // Create simple purple ground tiles (plain)
    this.add.graphics().fillStyle(0x7c3aed).fillRect(0, 0, 64, 64).generateTexture("purpleGround", 64, 64)

    // (Removed: creation of darker purple rocks/obstacles as background tiles)
  }

  function create(this: any) {
    // Store other player sprites
    this.otherPlayerSprites = {}
    // World size
    const worldWidth = 4000
    const worldHeight = 4000
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)

    // Ground tiles
    for (let x = 0; x < worldWidth; x += 64) {
      for (let y = 0; y < worldHeight; y += 64) {
        this.add.image(x, y, "purpleGround").setOrigin(0, 0)
      }
    }

    // Volcano in center
    const volcanoX = worldWidth / 2
    const volcanoY = worldHeight / 2
    const volcano = this.add.image(volcanoX, volcanoY, "volcano")
    const viewportWidth = this.cameras.main.width
    const viewportHeight = this.cameras.main.height
    const targetSize = Math.min(viewportWidth, viewportHeight) * 0.4
    const volcanoScale = targetSize / 512
    volcano.setScale(volcanoScale)
    volcano.setDepth(1)

    // ...rocks/obstacles removed...


    // Player spaceship - spawn at a random location in the world, not too close to volcano
    let spawnX, spawnY
    while (true) {
      spawnX = Phaser.Math.Between(100, worldWidth - 100)
      spawnY = Phaser.Math.Between(100, worldHeight - 100)
      const distanceFromVolcano = Phaser.Math.Distance.Between(spawnX, spawnY, volcanoX, volcanoY)
      if (distanceFromVolcano > 400) break // avoid spawning too close to volcano
    }
    this.player = this.physics.add.sprite(spawnX, spawnY, "player")
    this.player.setScale(0.5)
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(2)

    // Send join event to server with initial position, unique name, and rotation
    if (socketRef.current && myName) {
      console.log("[CLIENT] Emitting player-join:", {
        name: myName,
        x: this.player.x,
        y: this.player.y,
        rotation: this.player.rotation,
      })
      socketRef.current.emit("player-join", {
        name: myName,
        x: this.player.x,
        y: this.player.y,
        rotation: this.player.rotation,
      })
    }

    // Rockets group
    this.rockets = this.physics.add.group({
      defaultKey: "rocket",
      maxSize: 20,
    })

    // ...rocket collision with rocks removed...

    // Coins
    this.coins = this.physics.add.group()
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(100, worldWidth - 100)
      const y = Phaser.Math.Between(100, worldHeight - 100)
      const distanceFromVolcano = Phaser.Math.Distance.Between(x, y, volcanoX, volcanoY)
      if (distanceFromVolcano > 300) {
        const coin = this.coins.create(x, y, "coin")
        coin.setScale(0.5)
        coin.setDepth(1.5)
        this.tweens.add({ targets: coin, y: coin.y - 10, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
        this.tweens.add({ targets: coin, rotation: Math.PI * 2, duration: 3000, repeat: -1, ease: "Linear" })
      }
    }

    // Collect coins
    this.physics.add.overlap(this.player, this.coins, (player: any, coin: any) => {
      coin.destroy()
      // Update score logic
      if (typeof window !== "undefined") {
        // Use event to update React state
        const event = new CustomEvent("coin-collected")
        window.dispatchEvent(event)
      }
    })

    // Rockets can destroy coins too
    this.physics.add.overlap(this.rockets, this.coins, (rocket: any, coin: any) => {
      coin.destroy()
      // Could add bonus points for rocket collection
    })

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05)
    const worldViewPercentage = 0.2
    const zoomX = (viewportWidth * worldViewPercentage) / worldWidth
    const zoomY = (viewportHeight * worldViewPercentage) / worldHeight
    const zoom = Math.max(zoomX, zoomY) * 5
    this.cameras.main.setZoom(zoom)

    // Input controls
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys("W,S,A,D")
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.lastFired = 0
    this.fireRate = 250
  }

  function fireRocket(this: any) {
    const time = this.time.now
    if (time < this.lastFired + this.fireRate) return
    const rocket = this.rockets.get()
    if (!rocket) return
    rocket.setActive(true)
    rocket.setVisible(true)
    rocket.setPosition(this.player.x, this.player.y)
    rocket.setScale(0.4)
    rocket.setDepth(1.8)
    rocket.setRotation(this.player.rotation)
    const speed = 400
    const velocityX = Math.cos(this.player.rotation - Math.PI / 2) * speed
    const velocityY = Math.sin(this.player.rotation - Math.PI / 2) * speed
    rocket.setVelocity(velocityX, velocityY)
    this.time.delayedCall(3000, () => { if (rocket.active) rocket.destroy() })
    this.lastFired = time
  }

  function update(this: any) {
    if (!this.player) return

    // Send position and rotation to server
    if (socketRef.current && this.player) {
      socketRef.current.emit("player-move", {
        x: this.player.x,
        y: this.player.y,
        rotation: this.player.rotation,
      })
    }
    const speed = 200
    this.player.setVelocity(0)
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.setVelocityX(-speed)
      this.player.setRotation(-Math.PI / 2)
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.setVelocityX(speed)
      this.player.setRotation(Math.PI / 2)
    }
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.setVelocityY(-speed)
      this.player.setRotation(0)
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.setVelocityY(speed)
      this.player.setRotation(Math.PI)
    }
    if ((this.cursors.left.isDown || this.wasd.A.isDown) && (this.cursors.up.isDown || this.wasd.W.isDown)) {
      this.player.setRotation(-Math.PI / 4)
    } else if ((this.cursors.right.isDown || this.wasd.D.isDown) && (this.cursors.up.isDown || this.wasd.W.isDown)) {
      this.player.setRotation(Math.PI / 4)
    } else if ((this.cursors.left.isDown || this.wasd.A.isDown) && (this.cursors.down.isDown || this.wasd.S.isDown)) {
      this.player.setRotation((-3 * Math.PI) / 4)
    } else if ((this.cursors.right.isDown || this.wasd.D.isDown) && (this.cursors.down.isDown || this.wasd.S.isDown)) {
      this.player.setRotation((3 * Math.PI) / 4)
    }
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      fireRocket.call(this)
    }
    this.rockets.children.entries.forEach((rocket: any) => {
      if (rocket.active) {
        const bounds = this.physics.world.bounds
        if (
          rocket.x < bounds.x - 100 ||
          rocket.x > bounds.width + 100 ||
          rocket.y < bounds.y - 100 ||
          rocket.y > bounds.height + 100
        ) {
          rocket.destroy()
        }
      }
    })

    // --- Render other players ---
    if (typeof window !== "undefined") {
      // Get latest otherPlayers from React state
      const others = window.__otherPlayers || []
      // Remove sprites for players who left
      Object.keys(this.otherPlayerSprites).forEach((id) => {
        if (!others.find((p: any) => p.id === id)) {
          this.otherPlayerSprites[id].destroy()
          delete this.otherPlayerSprites[id]
        }
      })
      // Add/update sprites for connected players
      others.forEach((p: any) => {
        if (!this.otherPlayerSprites[p.id]) {
          const sprite = this.add.sprite(p.x, p.y, "player")
          sprite.setScale(0.5)
          sprite.setAlpha(0.7)
          sprite.setTint(0x00ffff)
          sprite.setDepth(2)
          this.otherPlayerSprites[p.id] = sprite
        }
        this.otherPlayerSprites[p.id].x = p.x
        this.otherPlayerSprites[p.id].y = p.y
        if (typeof p.rotation === "number") {
          this.otherPlayerSprites[p.id].setRotation(p.rotation)
        }
      })
    }
  }

  // Listen for coin collection events to update myCoins
  // Also sync otherPlayers to window for Phaser
  useEffect(() => {
    function handleCoinCollected() {
      setMyCoins((prev) => prev + 1)
    }
    window.addEventListener("coin-collected", handleCoinCollected)
    // Sync otherPlayers to window for Phaser
    window.__otherPlayers = otherPlayers
    return () => {
      window.removeEventListener("coin-collected", handleCoinCollected)
    }
  }, [otherPlayers])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-purple-600 relative overflow-hidden">
        {/* Game Area - Full Screen */}
        <div className="absolute inset-0">
          <div ref={gameRef} className="w-full h-full" />

          {/* Game UI Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <Button
              onClick={() => router.push("/home")}
              variant="ghost"
              className="text-white hover:bg-white/20 bg-black/50"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Exit Game
            </Button>
          </div>

          {/* Health Bar */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/50 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`w-6 h-6 rounded ${i < 5 ? "bg-red-500" : "bg-gray-600"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Controls Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/50 px-4 py-2 rounded-lg text-white text-sm">
              <div className="text-center">
                <span className="font-bold">WASD</span> to move • <span className="font-bold">SPACE</span> to fire
              </div>
            </div>
          </div>

          {/* Compact Leaderboard - Top Right, taller to fit all content */}
          <div className="absolute top-4 right-4 w-64 bg-black/30 backdrop-blur-sm text-white p-4 rounded-lg z-10 h-80">
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3 flex items-center">
                <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                Leaderboard
              </h2>
              <div className="space-y-2 text-xs">
                {players.map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-2 bg-white/10 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-bold">#{index + 1}</span>
                      <span className="truncate max-w-20">{player.name}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-yellow-400 ml-2">{player.coins}C</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Online
              </h3>
              <div className="text-2xl font-bold text-green-400">{players.length}/20</div>
            </div>

            <div className="border-t border-white/20 pt-3">
              <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 font-bold text-xs">You</span>
                  <span className="truncate max-w-20 text-xs">{myName}</span>
                </div>
                <div className="text-xs">
                  <span className="text-yellow-400 ml-2">{myCoins}C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shoot Button - Bottom Right */}
          <div className="absolute bottom-6 right-6 z-20">
            <Button
              className="w-20 h-20 rounded-full bg-red-600/80 hover:bg-red-700/80 border-4 border-red-800/80 text-white font-bold text-lg shadow-2xl backdrop-blur-sm"
              onMouseDown={() => console.log("Shooting!")}
            >
              <div className="flex flex-col items-center">
                <div className="text-2xl">🔥</div>
                <span className="text-xs">SHOOT</span>
              </div>
            </Button>
          </div>

          {/* Virtual Joystick - Bottom Left */}
          <div className="absolute bottom-6 left-6 z-20">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-black/30 backdrop-blur-sm border-4 border-white/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm border-2 border-white/60"></div>
              </div>
            </div>
          </div>

          {!gameLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-600 z-30">
              <div className="text-white text-2xl font-bold">Loading Game...</div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
