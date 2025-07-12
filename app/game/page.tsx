
import dynamic from "next/dynamic"

const GameClient = dynamic(() => import("./GameClient"), {
  ssr: false,
  loading: () => <div>Loading game...</div>
})

export default function GamePage() {
  return <GameClient />
}
