"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api/client"
import type { EnrichedLibraryEntry, GameStatus, CatalogGame } from "@/lib/api/types"
import { Header } from "@/components/header"
import { GameCard } from "@/components/game-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Library, Gamepad2 } from "lucide-react"

type FilterStatus = "all" | GameStatus

export default function LibraryPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [entries, setEntries] = useState<EnrichedLibraryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>("all")

  const fetchLibrary = useCallback(async () => {
    try {
      const libraryData = await api.getLibraryEntries()
      
      // Enrich with game info from catalog
      if (libraryData.length > 0) {
        const gameIds = libraryData.map((e) => e.external_game_id)
        try {
          const gameInfo = await api.resolveGames({ external_game_ids: gameIds })
          const gameMap = new Map<string, CatalogGame>()
          gameInfo.forEach((g) => gameMap.set(g.external_game_id, g))
          
          const enriched = libraryData.map((entry) => ({
            ...entry,
            title: gameMap.get(entry.external_game_id)?.title,
            thumb: gameMap.get(entry.external_game_id)?.thumb,
          }))
          setEntries(enriched)
        } catch {
          // If resolve fails, show entries without enrichment
          setEntries(libraryData)
        }
      } else {
        setEntries([])
      }
    } catch (error) {
      console.error("Error fetching library:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (user) {
      fetchLibrary()
    }
  }, [user, authLoading, router, fetchLibrary])

  const handleDelete = async (id: number) => {
    // Note: DELETE endpoint is not in the spec, but we can remove from UI
    // In a real app, you'd call api.deleteLibraryEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const filteredEntries = entries.filter((entry) => {
    if (filter === "all") return true
    return entry.status === filter
  })

  const statusCounts = {
    all: entries.length,
    wishlist: entries.filter((e) => e.status === "wishlist").length,
    playing: entries.filter((e) => e.status === "playing").length,
    completed: entries.filter((e) => e.status === "completed").length,
    dropped: entries.filter((e) => e.status === "dropped").length,
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Library className="h-8 w-8 text-primary" />
              Mi Biblioteca
            </h1>
            <p className="text-muted-foreground mt-1">
              {entries.length} {entries.length === 1 ? "juego" : "juegos"} en tu coleccion
            </p>
          </div>
          
          <Link href="/search">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Juego
            </Button>
          </Link>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              Todos ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="playing">
              Jugando ({statusCounts.playing})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completados ({statusCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              Deseados ({statusCounts.wishlist})
            </TabsTrigger>
            <TabsTrigger value="dropped">
              Abandonados ({statusCounts.dropped})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {filter === "all" ? "Tu biblioteca esta vacia" : "No hay juegos en esta categoria"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {filter === "all" 
                ? "Busca juegos y agregalos a tu coleccion"
                : "Agrega juegos o cambia el estado de los existentes"}
            </p>
            <Link href="/search">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buscar Juegos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEntries.map((entry) => (
              <GameCard
                key={entry.id}
                entry={entry}
                onUpdate={fetchLibrary}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
