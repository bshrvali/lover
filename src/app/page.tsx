"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { encodeName, toPathSegment } from "@/lib/name";

export default function HomePage() {
  const [name, setName] = useState("Səbinə");

  const path = useMemo(() => {
    if (!name.trim()) return "";
    return `/${toPathSegment(encodeName(name))}`;
  }, [name]);

  const link = useMemo(() => {
    if (!path) return "";
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [path]);

  return (
    <div className="stage">
      <div className="home-card">
        <h1>Lover</h1>
        <p>Adını yaz, linki kopyala və göndər.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sevgilinin adı"
          aria-label="Ad"
        />
        {path ? (
          <Link className="btn btn-yes" href={path} style={{ display: "inline-block", textDecoration: "none" }}>
            Aç
          </Link>
        ) : (
          <button type="button" className="btn btn-yes" disabled>
            Aç
          </button>
        )}
        {link ? (
          <Link className="link-out" href={path}>
            {link}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
