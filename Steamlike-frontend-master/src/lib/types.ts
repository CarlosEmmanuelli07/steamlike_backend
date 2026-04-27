export type User = { id: number; username: string };

export type LibraryEntry = {
  id: number;
  external_game_id: string;
  status: "wishlist" | "playing" | "completed" | "dropped";
  hours_played: number;
};

export type CatalogItem = {
  external_game_id: string;
  title: string;
  thumb?: string;
};

// Semana 4 — cambio de contraseña
export type PasswordChangePayload = {
  current_password: string;
  new_password: string;
};
