// User types
export interface User {
  id: number
  username: string
}

// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// Library Entry types
export type GameStatus = "wishlist" | "playing" | "completed" | "dropped"

export interface LibraryEntry {
  id: number
  external_game_id: string
  status: GameStatus
  hours_played: number
}

export interface CreateLibraryEntryRequest {
  external_game_id: string
  status: GameStatus
  hours_played: number
}

export interface UpdateLibraryEntryRequest {
  status?: GameStatus
  hours_played?: number
}

export interface FullUpdateLibraryEntryRequest {
  external_game_id: string
  status: GameStatus
  hours_played: number
}

// Catalog types
export interface CatalogGame {
  external_game_id: string
  title: string
  thumb: string
}

export interface ResolveGamesRequest {
  external_game_ids: string[]
}

// API Error types
export interface ApiError {
  error: string
  message: string
  details?: Record<string, string>
}

// Enriched library entry with game info
export interface EnrichedLibraryEntry extends LibraryEntry {
  title?: string
  thumb?: string
}
