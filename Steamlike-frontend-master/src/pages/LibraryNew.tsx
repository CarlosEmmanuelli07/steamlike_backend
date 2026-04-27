import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiFetch } from "../lib/api";
import type { LibraryEntry } from "../lib/types";

export default function LibraryNew() {
  const [externalGameId, setExternalGameId] = useState("");
  const [status, setStatus] = useState<LibraryEntry["status"]>("wishlist");
  const [hours, setHours] = useState<number>(0);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<{ status: number; error: any } | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const r = await apiFetch<LibraryEntry>("/api/library/entries/", {
      method: "POST",
      json: {
        external_game_id: externalGameId.trim(),
        status,
        hours_played: hours,
      },
    });

    setPending(false);

    if (r.ok) {
      navigate(`/library/${r.data.id}`);
    } else {
      setErr(r);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="h4 m-0">Añadir a biblioteca</h1>
          <Link className="btn btn-outline-secondary btn-sm" to="/library">Volver</Link>
        </div>

        {err && <ApiAlert status={err.status} error={err.error} />}

        <form className="card card-body" onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">external_game_id</label>
            <input className="form-control" value={externalGameId} onChange={(e) => setExternalGameId(e.target.value)} placeholder="Ej: 123" />
            <div className="form-text">Debe existir en el catálogo externo (validación en backend).</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Estado</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="wishlist">wishlist</option>
              <option value="playing">playing</option>
              <option value="completed">completed</option>
              <option value="dropped">dropped</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Horas jugadas</label>
            <input className="form-control" type="number" min={0} value={hours} onChange={(e) => setHours(parseInt(e.target.value || "0", 10))} />
          </div>

          <button className="btn btn-primary" disabled={pending}>
            {pending ? "Guardando..." : "Crear entrada"}
          </button>

          <div className="mt-3 small text-secondary">
            Pista: puedes usar <Link to="/catalog/search">Catálogo</Link> para buscar IDs.
          </div>
        </form>
      </div>
    </div>
  );
}
