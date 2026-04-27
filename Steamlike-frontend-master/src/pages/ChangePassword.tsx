import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import ApiAlert from "../components/ApiAlert";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<{ status: number; error: any } | null>(null);
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    setOk(false);

    const r = await apiFetch<{ ok: boolean }>("/api/users/me/password/", {
      method: "POST",
      json: { current_password: current, new_password: next },
    });

    setPending(false);

    if (r.ok) {
      setOk(true);
      setCurrent("");
      setNext("");
      // Redirigir a inicio tras 1.5s
      setTimeout(() => navigate("/"), 1500);
    } else {
      setErr(r);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="h4 m-0">Cambiar contraseña</h1>
          <Link className="btn btn-outline-secondary btn-sm" to="/">Volver</Link>
        </div>

        {ok && (
          <div className="alert alert-success">
            Contraseña actualizada correctamente. Redirigiendo…
          </div>
        )}

        {err && <ApiAlert status={err.status} error={err.error} />}

        {err?.status === 401 && (
          <div className="alert alert-info">
            Necesitas <Link to="/auth/login">iniciar sesión</Link> para cambiar la contraseña.
          </div>
        )}

        <form className="card card-body" onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Contraseña actual</label>
            <input
              className="form-control"
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Nueva contraseña</label>
            <input
              className="form-control"
              type="password"
              value={next}
              onChange={e => setNext(e.target.value)}
              required
            />
            <div className="form-text">Mínimo 8 caracteres.</div>
          </div>

          <button className="btn btn-primary" disabled={pending || ok}>
            {pending ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
