"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, isApiError } from "@/lib/auth-context"
import { api } from "@/lib/api/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, User, Lock, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()

  // Change password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Delete account
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contrasenas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("La nueva contrasena debe tener al menos 8 caracteres")
      return
    }

    setIsChangingPassword(true)

    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      if (isApiError(err)) {
        if (err.details) {
          const messages = Object.entries(err.details)
            .map(([field, message]) => `${field}: ${message}`)
            .join(". ")
          setPasswordError(messages)
        } else {
          setPasswordError(err.message)
        }
      } else {
        setPasswordError("Error al cambiar la contrasena")
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      await api.deleteAccount()
      await logout()
      router.push("/login")
    } catch (err) {
      console.error("Error deleting account:", err)
      setIsDeleting(false)
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
      
      <main className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          Configuracion
        </h1>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacion de Usuario
              </CardTitle>
              <CardDescription>
                Tu informacion de cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID de Usuario</label>
                  <p className="text-lg">{user?.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre de Usuario</label>
                  <p className="text-lg">{user?.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contrasena
              </CardTitle>
              <CardDescription>
                Actualiza tu contrasena de acceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                
                {passwordSuccess && (
                  <Alert className="border-primary bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary">
                      Contrasena actualizada correctamente
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium">
                    Contrasena Actual
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    Nueva Contrasena
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar Nueva Contrasena
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isChangingPassword}
                  />
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    "Cambiar Contrasena"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Eliminar Cuenta
              </CardTitle>
              <CardDescription>
                Esta accion es permanente y no se puede deshacer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Al eliminar tu cuenta, se borraran todos tus datos incluyendo tu biblioteca de juegos.
                Esta accion no se puede revertir.
              </p>
              
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar mi Cuenta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Eliminacion</DialogTitle>
                    <DialogDescription>
                      Estas seguro de que quieres eliminar tu cuenta? Esta accion es permanente
                      y eliminara todos tus datos, incluyendo tu biblioteca de juegos.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        "Si, eliminar mi cuenta"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
