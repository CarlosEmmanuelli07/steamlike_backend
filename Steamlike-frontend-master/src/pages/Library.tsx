import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiFetch } from "../lib/api";
import type { CatalogItem, LibraryEntry } from "../lib/types";

type LibraryRow = LibraryEntry & { title?: string; thumb?: string };

export default function Library() {
  const [items, setItems] = useState<LibraryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<{ status: number; error: any } | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => (x.title || x.external_game_id).toLowerCase().includes(s));
  }, [items, q]);

  async function load() {
    setLoading(true);
    setErr(null);

    const r = await apiFetch<LibraryEntry[]>("/api/library/entries/");
    if (!r.ok) {
      setErr(r);
      setLoading(false);
      return;
    }

    const entries = r.data;

    // Enriquecer con catálogo (resolve) para mostrar títulos/miniaturas
    const ids = entries.map((e) => e.external_game_id);
    let catalog: CatalogItem[] = [];
    if (ids.length) {
      const cr = await apiFetch<CatalogItem[]>("/api/catalog/resolve/", {
        method: "POST",
        json: { external_game_ids: ids },
      });
      if (cr.ok) catalog = cr.data;
      // si falla, seguimos sin enriquecer
    }

    const byId = new Map(catalog.map((c) => [c.external_game_id, c]));
    setItems(
      entries.map((e) => {
        const c = byId.get(e.external_game_id);
        return { ...e, title: c?.title, thumb: c?.thumb };
      })
    );

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function statusBadge(status: LibraryEntry["status"]) {
    const map: Record<string, string> = {
      wishlist: "secondary",
      playing: "primary",
      completed: "success",
      dropped: "danger",
    };
    const cls = map[status] || "secondary";
    return <span className={`badge text-bg-${cls}`}>{status}</span>;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
        <h1 className="h4 m-0">Mi biblioteca</h1>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ maxWidth: 260 }}
            placeholder="Filtrar por título/ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link className="btn btn-primary" to="/library/new">Añadir</Link>
          <button className="btn btn-outline-secondary" onClick={load}>Refrescar</button>
        </div>
      </div>

      {err && (
        <>
          <ApiAlert status={err.status} error={err.error} />
          {err.status === 401 && (
            <div className="alert alert-info">
              Necesitas <Link to="/auth/login">login</Link> para ver tu biblioteca.
            </div>
          )}
        </>
      )}

      {loading ? (
        <div className="text-secondary">Cargando…</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: 72 }}></th>
                <th>Juego</th>
                <th>Estado</th>
                <th className="text-end">Horas</th>
                <th style={{ width: 140 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-secondary">
                    No hay entradas (o el filtro no devuelve resultados).
                  </td>
                </tr>
              ) : (
                filtered.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {x.thumb ? (
                        <img src={x.thumb} alt="" style={{ width: 56, height: 56, objectFit: "cover" }} className="rounded border" />
                      ) : (
                        <div className="rounded border bg-light" style={{ width: 56, height: 56 }}></div>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold">{x.title || "(sin título)"}</div>
                      <div className="small text-secondary">external_game_id: {x.external_game_id}</div>
                    </td>
                    <td>{statusBadge(x.status)}</td>
                    <td className="text-end">{x.hours_played}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/library/${x.id}`)}>
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
