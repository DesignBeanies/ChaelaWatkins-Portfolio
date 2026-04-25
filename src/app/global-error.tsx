"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#f7f8f8",
          color: "#0f0000",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100dvh",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 400 }}>
            <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>App error</h1>
            <p style={{ margin: "0 0 20px", opacity: 0.8, lineHeight: 1.4 }}>
              Try{" "}
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  font: "inherit",
                  padding: 0,
                }}
              >
                reload
              </button>
              . If that fails, run <code>npm run dev:clean</code> and start the dev
              server again.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
