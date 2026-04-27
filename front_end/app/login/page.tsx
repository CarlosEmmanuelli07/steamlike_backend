"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, isApiError } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gamepad2, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(username, password)
      router.push("/library")
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message)
      } else {
        setError("Error al iniciar sesion. Intentalo de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Iniciar Sesion</CardTitle>
          <CardDescription>
            Accede a tu biblioteca de videojuegos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuario
              </label>
              <Input
                id="username"
                type="text"
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contrasena
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Registrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
