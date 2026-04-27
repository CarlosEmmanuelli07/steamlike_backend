import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiFetch } from "../lib/api";
import type { CatalogItem, LibraryEntry } from "../lib/types";

export default function LibraryDetail() {
  const { id } = useParams();
  const entryId = Number(id);

  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<{ status: number; error: any } | null>(null);

  const [status, setStatus] = useState<LibraryEntry["status"]>("wishlist");
  const [hours, setHours] = useState<number>(0);

  async function load() {
    setErr(null);
    const r = await apiFetch<LibraryEntry>(`/api/library/entries/${entryId}/`);
    if (!r.ok) {
      setErr(r);
      return;
    }
    setEntry(r.data);
    setStatus(r.data.status);
    setHours(r.data.hours_played);

    // resolve details
    const cr = await apiFetch<CatalogItem[]>("/api/catalog/resolve/", {
      method: "POST",
      json: { external_game_ids: [r.data.external_game_id] },
    });
    if (cr.ok && cr.data.length) setCatalog(cr.data[0]);
    else setCatalog(null);
  }

  useEffect(() => {
    if (!Number.isFinite(entryId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  async function savePatch(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const r = await apiFetch<LibraryEntry>(`/api/library/entries/${entryId}/`, {
      method: "PATCH",
      json: { status, hours_played: hours },
    });

    setPending(false);

    if (r.ok) {
      setEntry(r.data);
    } else {
      setErr(r);
    }
  }

  async function savePut() {
    if (!entry) return;
    setPending(true);
    setErr(null);

    const r = await apiFetch<LibraryEntry>(`/api/library/entries/${entryId}/`, {
      method: "PUT",
      json: {
        external_game_id: entry.external_game_id,
        status,
        hours_played: hours,
      },
    });

    setPending(false);

    if (r.ok) setEntry(r.data);
    else setErr(r);
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="h4 m-0">Entrada #{entryId}</h1>
          <Link className="btn btn-outline-secondary btn-sm" to="/library">Volver</Link>
        </div>

        {err && <ApiAlert status={err.status} error={err.error} />}

        {!entry ? (
          <div className="text-secondary">Cargando…</div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="d-flex gap-3">
                {catalog?.thumb ? (
                  <img src={catalog.thumb} alt="" style={{ width: 96, height: 96, objectFit: "cover" }} className="rounded border" />
                ) : (
                  <div className="rounded border bg-light" style={{ width: 96, height: 96 }}></div>
                )}

                <div className="flex-grow-1">
                  <div className="fw-semibold">{catalog?.title || "(sin título)"}</div>
                  <div className="small text-secondary">external_game_id: {entry.external_game_id}</div>

                  <hr />

                  <form onSubmit={savePatch}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Estado</label>
                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                          <option value="wishlist">wishlist</option>
                          <option value="playing">playing</option>
                          <option value="completed">completed</option>
                          <option value="dropped">dropped</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Horas jugadas</label>
                        <input className="form-control" type="number" min={0} value={hours} onChange={(e) => setHours(parseInt(e.target.value || "0", 10))} />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-primary" disabled={pending} type="submit">
                        {pending ? "Guardando..." : "Guardar (PATCH)"}
                      </button>
                      <button className="btn btn-outline-primary" disabled={pending} type="button" onClick={savePut}>
                        Guardar (PUT)
                      </button>
                      <button className="btn btn-outline-secondary" type="button" onClick={load}>
                        Recargar
                      </button>
                    </div>

                    <div className="form-text mt-2">
                      PATCH actualiza campos parciales; PUT sustituye el recurso completo.
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
