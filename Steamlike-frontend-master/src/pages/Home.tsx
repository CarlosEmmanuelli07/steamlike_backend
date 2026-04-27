import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="p-4 bg-light rounded border">
          <h1 className="h3 mb-2">GameLib — Frontend de referencia</h1>
          <p className="mb-0 text-secondary">
            Consume el backend Django implementado en UA6 y UA7.
            Flujo sugerido: <strong>Registro → Login → Catálogo → Biblioteca</strong>.
          </p>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-body">
            <span className="badge bg-secondary mb-2">UA6 — Semanas 1 y 2</span>
            <h2 className="h5">Autenticación</h2>
            <p className="text-secondary">Registro, login y comprobación de sesión con cookies Django.</p>
            <div className="d-flex gap-2">
              <Link className="btn btn-outline-primary btn-sm" to="/auth/register">Registro</Link>
              <Link className="btn btn-primary btn-sm" to="/auth/login">Login</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-body">
            <span className="badge bg-secondary mb-2">UA6 — Semanas 1 y 2</span>
            <h2 className="h5">Biblioteca</h2>
            <p className="text-secondary">
              CRUD de entradas: crear, listar, ver detalle y actualizar (PATCH + PUT).
              Cada entrada pertenece al usuario autenticado.
            </p>
            <Link className="btn btn-primary btn-sm" to="/library">Ir a biblioteca</Link>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-body">
            <span className="badge bg-secondary mb-2">UA7 — Semana 3</span>
            <h2 className="h5">Catálogo (CheapShark)</h2>
            <p className="text-secondary">
              Búsqueda de juegos por texto y resolución de IDs. El backend actúa
              como proxy hacia CheapShark, sin exponer la API externa.
            </p>
            <Link className="btn btn-outline-primary btn-sm" to="/catalog/search">Buscar juegos</Link>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-body">
            <span className="badge bg-secondary mb-2">UA7 — Semana 4</span>
            <h2 className="h5">Gestión de cuenta</h2>
            <p className="text-secondary">
              Cambio de contraseña, logout y eliminación de cuenta con borrado en cascada
              de entradas de biblioteca.
            </p>
            <Link className="btn btn-outline-secondary btn-sm" to="/profile/password">Cambiar contraseña</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
