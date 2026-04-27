import React from "react";
import type { ApiError } from "../lib/api";

export default function ApiAlert({ status, error }: { status: number; error: ApiError }) {
  return (
    <div className="alert alert-danger" role="alert">
      <div><strong>Error {status}</strong>: {error.message}</div>
      {"details" in error && error.details ? (
        <pre className="mt-2 mb-0 small">{JSON.stringify(error.details, null, 2)}</pre>
      ) : null}
    </div>
  );
}
