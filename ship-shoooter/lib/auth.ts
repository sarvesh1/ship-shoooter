// Mock authentication functions for demo purposes
export async function signUp(email: string, password: string, username: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Store user data in localStorage for demo
  const userData = {
    id: "demo-user-id",
    email,
    username,
    points: 0,
    lives: 3,
    currency: 100,
    current_ship: "basic_fighter",
    unlocked_ships: ["basic_fighter"],
  }

  localStorage.setItem("user", JSON.stringify(userData))
  localStorage.setItem("isAuthenticated", "true")

  return { user: { id: "demo-user-id", email } }
}

export async function signIn(email: string, password: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock successful login
  const userData = {
    id: "demo-user-id",
    email,
    username: "DemoPlayer",
    points: 150,
    lives: 3,
    currency: 250,
    current_ship: "basic_fighter",
    unlocked_ships: ["basic_fighter", "scout"],
  }

  localStorage.setItem("user", JSON.stringify(userData))
  localStorage.setItem("isAuthenticated", "true")

  return { user: { id: "demo-user-id", email } }
}

export async function signOut() {
  localStorage.removeItem("user")
  localStorage.removeItem("isAuthenticated")
}

export async function getCurrentUser() {
  const isAuthenticated = localStorage.getItem("isAuthenticated")
  if (!isAuthenticated) return null

  const userData = localStorage.getItem("user")
  if (!userData) return null

  const user = JSON.parse(userData)
  return { id: user.id, email: user.email }
}

// Mock data functions
export async function getUserData() {
  const userData = localStorage.getItem("user")
  if (!userData) return null
  return JSON.parse(userData)
}

export async function updateUserData(updates: any) {
  const userData = localStorage.getItem("user")
  if (!userData) return

  const user = JSON.parse(userData)
  const updatedUser = { ...user, ...updates }
  localStorage.setItem("user", JSON.stringify(updatedUser))
  return updatedUser
}
