import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          points: number
          lives: number
          currency: number
          current_ship: string
          unlocked_ships: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points?: number
          lives?: number
          currency?: number
          current_ship?: string
          unlocked_ships?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          lives?: number
          currency?: number
          current_ship?: string
          unlocked_ships?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
