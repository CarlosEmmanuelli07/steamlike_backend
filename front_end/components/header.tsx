"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Gamepad2, Library, Search, User, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { href: "/library", label: "Mi Biblioteca", icon: Library },
    { href: "/search", label: "Buscar Juegos", icon: Search },
  ]

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/library" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">GameVault</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline-block">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Configuracion
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
