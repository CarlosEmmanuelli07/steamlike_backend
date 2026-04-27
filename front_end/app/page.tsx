"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Gamepad2, Library, Search, Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/library")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-6">
            <Gamepad2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Tu Biblioteca de Videojuegos
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto text-balance">
            Gestiona tu coleccion de juegos. Busca, organiza y trackea tu progreso en un solo lugar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Crear Cuenta Gratis
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Iniciar Sesion
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
              <Library className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Organiza tu Coleccion</h3>
            <p className="text-sm text-muted-foreground">
              Clasifica tus juegos por estado: jugando, completados, deseados o abandonados
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Busca en el Catalogo</h3>
            <p className="text-sm text-muted-foreground">
              Encuentra juegos en nuestro extenso catalogo y agregalos a tu biblioteca
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Trackea tu Progreso</h3>
            <p className="text-sm text-muted-foreground">
              Registra las horas jugadas y el estado de cada juego en tu coleccion
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>GameVault - Frontend para API Django</p>
      </footer>
    </div>
  )
}
