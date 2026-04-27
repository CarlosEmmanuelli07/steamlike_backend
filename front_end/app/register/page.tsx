"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, isApiError } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gamepad2, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres")
      return
    }

    setIsLoading(true)

    try {
      await register(username, password)
      router.push("/library")
    } catch (err) {
      if (isApiError(err)) {
        if (err.details) {
          const messages = Object.entries(err.details)
            .map(([field, message]) => `${field}: ${message}`)
            .join(". ")
          setError(messages)
        } else {
          setError(err.message)
        }
      } else {
        setError("Error al registrarse. Intentalo de nuevo.")
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
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Unete a GameVault y gestiona tu biblioteca
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
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {password.length > 0 && (
                <div className={`flex items-center gap-1 text-xs ${passwordValid ? "text-primary" : "text-muted-foreground"}`}>
                  {passwordValid ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {passwordValid ? "Longitud valida" : "Minimo 8 caracteres"}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contrasena
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite la contrasena"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1 text-xs ${passwordsMatch ? "text-primary" : "text-destructive"}`}>
                  {passwordsMatch ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {passwordsMatch ? "Las contrasenas coinciden" : "Las contrasenas no coinciden"}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !passwordValid || !passwordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
