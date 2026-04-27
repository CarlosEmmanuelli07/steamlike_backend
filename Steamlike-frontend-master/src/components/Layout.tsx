import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { User } from "../lib/types";
import { backendUrl } from "../lib/env";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        end
      >
        {label}
      </NavLink>
    </li>
  );
}

export default function Layout() {
  const [me, setMe] = useState<User | null>(null);
  const [meLoading, setMeLoading] = useState(true);
  const [flash, setFlash] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const navigate = useNavigate();

  async function refreshMe() {
    setMeLoading(true);
    const r = await apiFetch<User>("/api/users/me/");
    if (r.ok) setMe(r.data);
    else setMe(null);
    setMeLoading(false);
  }

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    const r = await apiFetch<null>("/api/auth/logout/", { method: "POST" });
    if (r.ok) {
      setFlash({ type: "success", text: "Sesión cerrada." });
      setMe(null);
      navigate("/");
    } else {
      setFlash({ type: "danger", text: "error" in r ? r.error.message : "No se pudo cerrar sesión." });
    }
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">GameLib</Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div id="nav" className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <NavItem to="/" label="Inicio" />
              <NavItem to="/library" label="Biblioteca" />
              <NavItem to="/catalog/search" label="Catálogo" />
            </ul>

            <div className="d-flex align-items-center gap-2">
              <small className="text-secondary d-none d-lg-inline">API: {backendUrl()}</small>
              {meLoading ? (
                <span className="text-light">…</span>
              ) : me ? (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light btn-sm dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    {me.username}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/profile/password">Cambiar contraseña</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={logout}>Cerrar sesión</button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item text-danger" to="/profile/delete">Eliminar cuenta</Link></li>
                  </ul>
                </div>
              ) : (
                <>
                  <Link className="btn btn-outline-light btn-sm" to="/auth/login">Login</Link>
                  <Link className="btn btn-warning btn-sm" to="/auth/register">Registro</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container my-4">
        {flash && (
          <div className={`alert alert-${flash.type} alert-dismissible`} role="alert">
            {flash.text}
            <button type="button" className="btn-close" onClick={() => setFlash(null)} aria-label="Close"></button>
          </div>
        )}
        <Outlet context={{ refreshMe, me }} />
      </main>

      <footer className="border-top py-3">
        <div className="container small text-secondary">
          GameLib Frontend — UA6 · UA7 · Django REST API.
        </div>
      </footer>
    </>
  );
}
