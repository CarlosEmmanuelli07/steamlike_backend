import React, { useState } from "react";
import { Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiFetch } from "../lib/api";
import type { CatalogItem } from "../lib/types";

export default function CatalogSearch() {
  const [q, setQ] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<{ status: number; error: any } | null>(null);
  const [results, setResults] = useState<CatalogItem[]>([]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const r = await apiFetch<CatalogItem[]>(`/api/catalog/search/?q=${encodeURIComponent(q.trim())}`);
    setPending(false);

    if (r.ok) setResults(r.data);
    else setErr(r);
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
        <h1 className="h4 m-0">Catálogo</h1>
        <Link className="btn btn-outline-secondary btn-sm" to="/library/new">Añadir (manual)</Link>
      </div>

      {err && <ApiAlert status={err.status} error={err.error} />}

      <form className="card card-body mb-3" onSubmit={search}>
        <label className="form-label">Buscar por título</label>
        <div className="d-flex gap-2">
          <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: portal" />
          <button className="btn btn-primary" disabled={pending || !q.trim()}>
            {pending ? "Buscando..." : "Buscar"}
          </button>
        </div>
        <div className="form-text">
          Devuelve una lista de resultados mínimos: <code>external_game_id</code>, <code>title</code>, <code>thumb</code>.
        </div>
      </form>

      <div className="row g-3">
        {results.length === 0 ? (
          <div className="text-secondary">Sin resultados (o aún no has buscado).</div>
        ) : (
          results.map((x) => (
            <div className="col-md-6 col-lg-4" key={x.external_game_id}>
              <div className="card h-100">
                {x.thumb ? (
                  <img src={x.thumb} className="card-img-top" alt="" style={{ height: 160, objectFit: "cover" }} />
                ) : null}
                <div className="card-body">
                  <div className="fw-semibold">{x.title}</div>
                  <div className="small text-secondary">ID: {x.external_game_id}</div>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <Link className="btn btn-outline-primary btn-sm" to="/library/new">
                    Usar este ID
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
