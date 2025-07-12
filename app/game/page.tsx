
"use client";

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

socket.on("connect", () => {
  console.log("Connected to Socket.IO server:", socket.id)
})
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [players, setPlayers] = useState([])
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
  const router = useRouter()

  useEffect(() => {
    // Example: emit player movement (replace with real data)
    // socket.emit("playerMove", { x: 100, y: 200 })
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
        // Fallback to placeholder
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

    // Create darker purple rocks/obstacles
    this.add
      .graphics()
      .fillStyle(0x3c0a5c)
      .fillCircle(16, 16, 16)
      .fillStyle(0x2d0a42)
      .fillCircle(16, 16, 12)
      .generateTexture("rock", 32, 32)
  }

  function create(this: any) {
    // Create world bounds (much larger world)
    const worldWidth = 4000
    const worldHeight = 4000
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)

    // Create plain purple ground tiles across the world
    for (let x = 0; x < worldWidth; x += 64) {
      for (let y = 0; y < worldHeight; y += 64) {
        this.add.image(x, y, "purpleGround").setOrigin(0, 0)
      }
    }

    // Place the volcano in the center of the world (twice as large again - now 40% of viewport)
    const volcanoX = worldWidth / 2
    const volcanoY = worldHeight / 2
    const volcano = this.add.image(volcanoX, volcanoY, "volcano")

    // Calculate volcano size to be 40% of viewport (twice the previous 20%)
    const viewportWidth = this.cameras.main.width
    const viewportHeight = this.cameras.main.height
    const targetSize = Math.min(viewportWidth, viewportHeight) * 0.4
    const volcanoScale = targetSize / 512 // Assuming volcano image is roughly 512px
    volcano.setScale(volcanoScale)
    volcano.setDepth(1) // Ensure it's above ground tiles

    // Add some rocks/obstacles around the map
    this.rocks = this.physics.add.staticGroup()
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(100, worldWidth - 100)
      const y = Phaser.Math.Between(100, worldHeight - 100)

      // Don't place rocks too close to the volcano (increased distance due to larger volcano)
      const distanceFromVolcano = Phaser.Math.Distance.Between(x, y, volcanoX, volcanoY)
      if (distanceFromVolcano > 300) {
        const rock = this.rocks.create(x, y, "rock")
        rock.setScale(Phaser.Math.FloatBetween(0.5, 1.5))
        rock.setDepth(0.5)
      }
    }

    // Create player (start away from volcano) with proper scaling
    this.player = this.physics.add.sprite(volcanoX - 600, volcanoY, "player")
    this.player.setScale(0.5) // Reduced scale from 0.8 to 0.5 to make spaceship smaller
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(2) // Above everything else

    // Create rockets group
    this.rockets = this.physics.add.group({
      defaultKey: "rocket",
      maxSize: 20, // Limit number of rockets on screen
    })

    // Remove missile collision with rocks. Missiles should only impact ships or the volcano.

    // Create coins scattered around using the new pixelated coin image
    this.coins = this.physics.add.group()
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(100, worldWidth - 100)
      const y = Phaser.Math.Between(100, worldHeight - 100)

      // Don't place coins too close to the volcano
      const distanceFromVolcano = Phaser.Math.Distance.Between(x, y, volcanoX, volcanoY)
      if (distanceFromVolcano > 300) {
        const coin = this.coins.create(x, y, "coin")
        coin.setScale(0.5) // Scale down the pixelated coin to appropriate size
        coin.setDepth(1.5)

        // Add floating animation to coins
        this.tweens.add({
          targets: coin,
          y: coin.y - 10,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        })

        // Add rotation animation for extra visual appeal
        this.tweens.add({
          targets: coin,
          rotation: Math.PI * 2,
          duration: 3000,
          repeat: -1,
          ease: "Linear",
        })
      }
    }

    // Collect coins
    this.physics.add.overlap(this.player, this.coins, (player: any, coin: any) => {
      coin.destroy()
      // Emit coin collection event to server
      if (typeof window !== "undefined" && window.socket) {
        window.socket.emit("coinCollected", { playerId: window.socket.id })
      } else if (typeof socket !== "undefined") {
        socket.emit("coinCollected", { playerId: socket.id })
      }
      // Update score logic would go here
    })

    // Rockets can destroy coins too
    this.physics.add.overlap(this.rockets, this.coins, (rocket: any, coin: any) => {
      coin.destroy()
      // Could add bonus points for rocket collection
    })

    // Camera follows player with smooth movement
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05)

    // Set zoom so player can only see 20% of world at once
    const worldViewPercentage = 0.2
    const zoomX = (viewportWidth * worldViewPercentage) / worldWidth
    const zoomY = (viewportHeight * worldViewPercentage) / worldHeight
    const zoom = Math.max(zoomX, zoomY) * 5 // Multiply by 5 to get proper 20% view
    this.cameras.main.setZoom(zoom)

    // Removed joystick background dots

    // Input controls
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys("W,S,A,D")
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Firing cooldown
    this.lastFired = 0
    this.fireRate = 250 // Milliseconds between shots
  }

  function fireRocket(this: any) {
    const time = this.time.now

    // Check firing cooldown
    if (time < this.lastFired + this.fireRate) {
      return
    }

    // Get or create rocket from pool
    const rocket = this.rockets.get()
    if (!rocket) return

    // Position rocket at player location
    rocket.setActive(true)
    rocket.setVisible(true)
    rocket.setPosition(this.player.x, this.player.y)
    rocket.setScale(0.4) // Scale rocket appropriately
    rocket.setDepth(1.8) // Above coins but below player

    // Set rocket rotation to match player direction
    rocket.setRotation(this.player.rotation)

    // Calculate velocity based on player rotation
    const speed = 400
    const velocityX = Math.cos(this.player.rotation - Math.PI / 2) * speed
    const velocityY = Math.sin(this.player.rotation - Math.PI / 2) * speed

    rocket.setVelocity(velocityX, velocityY)

    // Auto-destroy rocket after 3 seconds or when it goes off-screen
    this.time.delayedCall(3000, () => {
      if (rocket.active) {
        rocket.destroy()
      }
    })

    // Update last fired time
    this.lastFired = time
  }

  // update is a Phaser scene method, not a React render

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
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 font-bold">#{index + 1}</span>
                        <span className="truncate max-w-20">{player.id === socket.id ? "You" : player.id.slice(0, 8)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-yellow-400 ml-2">{player.score} pts</span>
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
                  <span className="text-blue-400 font-bold">You</span>
                  <span className="truncate max-w-20">Player</span>
                </div>
                <div className="text-xs">
                  <span className="text-yellow-400 ml-2">{playerScore} pts</span>
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

// Main React component render
export default function GamePage() {
  const gameRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [gameLoaded, setGameLoaded] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [players, setPlayers] = useState([])

  // ...existing hooks and logic...

  return (
    <AuthGuard>
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
              {[...players]
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-bold">#{index + 1}</span>
                      <span className="truncate max-w-20">{player.id === (typeof socket !== "undefined" ? socket.id : "") ? "You" : player.id.slice(0, 8)}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-yellow-400 ml-2">{player.score} pts</span>
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
                <span className="text-blue-400 font-bold">You</span>
                <span className="truncate max-w-20">Player</span>
              </div>
              <div className="text-xs">
                <span className="text-yellow-400 ml-2">{playerScore} pts</span>
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
    </AuthGuard>
  )
}
