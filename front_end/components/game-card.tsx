"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Clock, Edit2, Check, X, Trash2, Loader2 } from "lucide-react"
import type { EnrichedLibraryEntry, GameStatus } from "@/lib/api/types"
import { api } from "@/lib/api/client"

const statusConfig: Record<GameStatus, { label: string; color: string }> = {
  wishlist: { label: "Deseado", color: "bg-accent text-accent-foreground" },
  playing: { label: "Jugando", color: "bg-primary text-primary-foreground" },
  completed: { label: "Completado", color: "bg-chart-1 text-primary-foreground" },
  dropped: { label: "Abandonado", color: "bg-muted text-muted-foreground" },
}

interface GameCardProps {
  entry: EnrichedLibraryEntry
  onUpdate: () => void
  onDelete: (id: number) => void
}

export function GameCard({ entry, onUpdate, onDelete }: GameCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<GameStatus>(entry.status)
  const [hoursPlayed, setHoursPlayed] = useState(entry.hours_played.toString())

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await api.updateLibraryEntry(entry.id, {
        status,
        hours_played: parseInt(hoursPlayed) || 0,
      })
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error("Error updating entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setStatus(entry.status)
    setHoursPlayed(entry.hours_played.toString())
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm("Estas seguro de que quieres eliminar este juego de tu biblioteca?")) {
      return
    }
    onDelete(entry.id)
  }

  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
      <div className="relative aspect-[16/9] bg-muted">
        {entry.thumb ? (
          <Image
            src={entry.thumb}
            alt={entry.title || "Game thumbnail"}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-balance line-clamp-2 mb-3">
          {entry.title || `Juego #${entry.external_game_id}`}
        </h3>
        
        {isEditing ? (
          <div className="space-y-3">
            <Select value={status} onValueChange={(v: string) => setStatus(v as GameS
              : stringtatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(e.target.value)}
                className="h-9"
                placeholder="Horas"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Badge className={statusConfig[entry.status].color}>
              {statusConfig[entry.status].label}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {entry.hours_played}h
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
