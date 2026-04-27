import type {
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  LibraryEntry,
  CreateLibraryEntryRequest,
  UpdateLibraryEntryRequest,
  FullUpdateLibraryEntryRequest,
  CatalogGame,
  ResolveGamesRequest,
  ApiError,
} from "./types"

// Configure your Django backend URL here
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      credentials: "include", // Important for session-based auth with Django
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T
    }

    const data = await response.json()

    if (!response.ok) {
      throw data as ApiError
    }

    return data
  }

  // ============ AUTH ============

  async register(data: RegisterRequest): Promise<User> {
    return this.request<User>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginRequest): Promise<User> {
    return this.request<User>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<void> {
    return this.request<void>("/api/auth/logout/", {
      method: "POST",
    })
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/users/me/")
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>("/api/users/me/password/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteAccount(): Promise<void> {
    return this.request<void>("/api/users/me/", {
      method: "DELETE",
    })
  }

  // ============ LIBRARY ============

  async getLibraryEntries(): Promise<LibraryEntry[]> {
    return this.request<LibraryEntry[]>("/api/library/entries/")
  }

  async getLibraryEntry(id: number): Promise<LibraryEntry> {
    return this.request<LibraryEntry>(`/api/library/entries/${id}/`)
  }

  async createLibraryEntry(data: CreateLibraryEntryRequest): Promise<LibraryEntry> {
    return this.request<LibraryEntry>("/api/library/entries/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateLibraryEntry(
    id: number,
    data: UpdateLibraryEntryRequest
  ): Promise<LibraryEntry> {
    return this.request<LibraryEntry>(`/api/library/entries/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async replaceLibraryEntry(
    id: number,
    data: FullUpdateLibraryEntryRequest
  ): Promise<LibraryEntry> {
    return this.request<LibraryEntry>(`/api/library/entries/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // ============ CATALOG ============

  async searchGames(query: string): Promise<CatalogGame[]> {
    return this.request<CatalogGame[]>(
      `/api/catalog/search/?q=${encodeURIComponent(query)}`
    )
  }

  async resolveGames(data: ResolveGamesRequest): Promise<CatalogGame[]> {
    return this.request<CatalogGame[]>("/api/catalog/resolve/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
