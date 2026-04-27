import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import ApiAlert from "../components/ApiAlert";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<{ status: number; error: any } | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const r = await apiFetch<any>("/api/auth/login/", {
      method: "POST",
      json: { username, password },
    });

    setPending(false);

    if (r.ok) {
      navigate("/library");
    } else {
      setErr(r);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <h1 className="h4 mb-3">Login</h1>

        {err && <ApiAlert status={err.status} error={err.error} />}

        <form className="card card-body" onSubmit={onSubmit}>
          <label className="form-label">Usuario</label>
          <input className="form-control mb-3" value={username} onChange={(e) => setUsername(e.target.value)} />

          <label className="form-label">Contraseña</label>
          <input className="form-control mb-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button className="btn btn-primary" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </button>

          <div className="mt-3 small">
            ¿No tienes cuenta? <Link to="/auth/register">Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
