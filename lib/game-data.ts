export const SHIP_CATEGORIES = {
  Common: {
    name: "Common",
    color: "#9CA3AF",
    ships: [
      { id: "basic_fighter", name: "Basic Fighter", unlocked: true },
      { id: "scout", name: "Scout", unlocked: false },
      { id: "interceptor", name: "Interceptor", unlocked: false },
      { id: "patrol", name: "Patrol", unlocked: false },
      { id: "courier", name: "Courier", unlocked: false },
      { id: "ranger", name: "Ranger", unlocked: false },
      { id: "guardian", name: "Guardian", unlocked: false },
    ],
  },
  Rare: {
    name: "Rare",
    color: "#3B82F6",
    ships: [
      { id: "assault", name: "Assault", unlocked: false },
      { id: "hunter", name: "Hunter", unlocked: false },
      { id: "striker", name: "Striker", unlocked: false },
      { id: "viper", name: "Viper", unlocked: false },
      { id: "falcon", name: "Falcon", unlocked: false },
      { id: "raptor", name: "Raptor", unlocked: false },
    ],
  },
  Epic: {
    name: "Epic",
    color: "#8B5CF6",
    ships: [
      { id: "destroyer", name: "Destroyer", unlocked: false },
      { id: "phantom", name: "Phantom", unlocked: false },
      { id: "wraith", name: "Wraith", unlocked: false },
      { id: "specter", name: "Specter", unlocked: false },
    ],
  },
  Legendary: {
    name: "Legendary",
    color: "#F59E0B",
    ships: [
      { id: "titan", name: "Titan", unlocked: false },
      { id: "vanguard", name: "Vanguard", unlocked: false },
      { id: "apex", name: "Apex", unlocked: false },
    ],
  },
  Special: {
    name: "Special",
    color: "#EF4444",
    ships: [
      { id: "phoenix", name: "Phoenix", unlocked: false },
      { id: "omega", name: "Omega", unlocked: false },
      { id: "nexus", name: "Nexus", unlocked: false },
    ],
  },
}

export const GAME_CONFIG = {
  MAX_PLAYERS: 20,
  MAX_HEALTH: 7,
  POINTS_PER_KILL: 2,
  POINTS_PER_COIN: 1,
  INITIAL_LIVES: 3,
  INITIAL_CURRENCY: 100,
}

// Ship designs with unique visual characteristics
export const SHIP_DESIGNS = {
  // Common Ships
  basic_fighter: { emoji: "🚀", color: "#6B7280", description: "Standard fighter craft" },
  scout: { emoji: "✈️", color: "#6B7280", description: "Fast reconnaissance ship" },
  interceptor: { emoji: "🛩️", color: "#6B7280", description: "Quick response vessel" },
  patrol: { emoji: "🚁", color: "#6B7280", description: "Area patrol craft" },
  courier: { emoji: "🛸", color: "#6B7280", description: "Message delivery ship" },
  ranger: { emoji: "🚀", color: "#8B7355", description: "Long-range explorer" },
  guardian: { emoji: "🛡️", color: "#6B7280", description: "Defensive escort ship" },

  // Rare Ships
  assault: { emoji: "⚔️", color: "#3B82F6", description: "Heavy assault craft" },
  hunter: { emoji: "🎯", color: "#3B82F6", description: "Target tracking ship" },
  striker: { emoji: "⚡", color: "#3B82F6", description: "Lightning fast attacker" },
  viper: { emoji: "🐍", color: "#3B82F6", description: "Stealth strike vessel" },
  falcon: { emoji: "🦅", color: "#3B82F6", description: "Aerial superiority fighter" },
  raptor: { emoji: "🦖", color: "#3B82F6", description: "Predator class ship" },

  // Epic Ships
  destroyer: { emoji: "💥", color: "#8B5CF6", description: "Heavy weapons platform" },
  phantom: { emoji: "👻", color: "#8B5CF6", description: "Cloaking technology ship" },
  wraith: { emoji: "💀", color: "#8B5CF6", description: "Shadow warfare vessel" },
  specter: { emoji: "🌟", color: "#8B5CF6", description: "Energy-based fighter" },

  // Legendary Ships
  titan: { emoji: "⚡", color: "#F59E0B", description: "Massive battleship" },
  vanguard: { emoji: "🔥", color: "#F59E0B", description: "Elite command vessel" },
  apex: { emoji: "💎", color: "#F59E0B", description: "Ultimate fighter craft" },

  // Special Ships
  phoenix: { emoji: "🔥", color: "#EF4444", description: "Regenerating warship" },
  omega: { emoji: "🌌", color: "#EF4444", description: "Cosmic destroyer" },
  nexus: { emoji: "⭐", color: "#EF4444", description: "Interdimensional craft" },
}
