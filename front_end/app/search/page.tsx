"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth, isApiError } from "@/lib/auth-context"
import { api } from "@/lib/api/client"
import type { CatalogGame, GameStatus } from "@/lib/api/types"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, Plus, AlertCircle, Gamepad2, Clock } from "lucide-react"

export default function SearchPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CatalogGame[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState("")

  // Add to library dialog
  const [selectedGame, setSelectedGame] = useState<CatalogGame | null>(null)
  const [status, setStatus] = useState<GameStatus>("wishlist")
  const [hoursPlayed, setHoursPlayed] = useState("0")
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setError("")
    setHasSearched(true)

    try {
      const data = await api.searchGames(query.trim())
      setResults(data)
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message)
      } else {
        setError("Error al buscar juegos. Intentalo de nuevo.")
      }
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToLibrary = async () => {
    if (!selectedGame) return

    setIsAdding(true)
    setAddError("")

    try {
      await api.createLibraryEntry({
        external_game_id: selectedGame.external_game_id,
        status,
        hours_played: parseInt(hoursPlayed) || 0,
      })
      setSelectedGame(null)
      setStatus("wishlist")
      setHoursPlayed("0")
      router.push("/library")
    } catch (err) {
      if (isApiError(err)) {
        if (err.error === "duplicate_entry") {
          setAddError("Este juego ya esta en tu biblioteca")
        } else if (err.error === "invalid_external_game_id") {
          setAddError("El juego no existe en el catalogo externo")
        } else {
          setAddError(err.message)
        }
      } else {
        setAddError("Error al agregar el juego")
      }
    } finally {
      setIsAdding(false)
    }
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
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Search className="h-8 w-8 text-primary" />
            Buscar Juegos
          </h1>
          <p className="text-muted-foreground mb-6">
            Busca en el catalogo y agrega juegos a tu biblioteca
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar por titulo... (ej: mario, zelda, fifa)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSearching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              No se encontraron juegos
            </h2>
            <p className="text-muted-foreground">
              Intenta con otro termino de busqueda
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((game) => (
              <Card key={game.external_game_id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="relative aspect-[16/9] bg-muted">
                  {game.thumb ? (
                    <Image
                      src={game.thumb}
                      alt={game.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-balance line-clamp-2 mb-3">
                    {game.title}
                  </h3>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedGame(game)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar a Biblioteca
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Busca tu proximo juego
            </h2>
            <p className="text-muted-foreground">
              Escribe el nombre de un juego para comenzar
            </p>
          </div>
        ) : null}
      </main>

      {/* Add to Library Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar a tu Biblioteca</DialogTitle>
            <DialogDescription>
              {selectedGame?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedGame && (
            <div className="space-y-4">
              {selectedGame.thumb && (
                <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedGame.thumb}
                    alt={selectedGame.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              {addError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{addError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={status} onValueChange={(v) => setStatus(v as GameStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wishlist">Deseado</SelectItem>
                    <SelectItem value="playing">Jugando</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="dropped">Abandonado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Horas Jugadas</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    value={hoursPlayed}
                    onChange={(e) => setHoursPlayed(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGame(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAddToLibrary} disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
