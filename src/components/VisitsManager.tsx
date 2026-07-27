"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Visit } from "@/lib/tracking";

type Props = {
  initialVisits: Visit[];
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("az-AZ", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function dash(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export default function VisitsManager({ initialVisits }: Props) {
  const router = useRouter();
  const [visits, setVisits] = useState(initialVisits);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setVisits(initialVisits);
  }, [initialVisits]);

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const removeOne = async (id: string) => {
    if (!confirm("Bu ziyarəti silmək istəyirsən?")) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/visits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setVisits((prev) => prev.filter((v) => v.id !== id));
        refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const removeAll = async () => {
    if (!confirm("Bütün ziyarətləri silmək istəyirsən?")) return;
    setClearing(true);
    try {
      const res = await fetch("/api/visits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setVisits([]);
        refresh();
      }
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <header className="visits-header">
        <div className="visits-header-row">
          <h1>Visits</h1>
          {visits.length > 0 ? (
            <button
              type="button"
              className="btn-delete btn-delete-all"
              onClick={removeAll}
              disabled={clearing}
            >
              {clearing ? "Silinir…" : "Hamısını sil"}
            </button>
          ) : null}
        </div>
        <p>
          {visits.length === 0
            ? "Hələ heç bir ziyarət yoxdur."
            : `${visits.length} ziyarət qeydə alınıb.`}
        </p>
      </header>

      {visits.length > 0 ? (
        <div className="visits-list">
          {visits.map((v) => (
            <article key={v.id} className="visit-card">
              <div className="visit-card-top">
                <strong>{dash(v.name)}</strong>
                <div className="visit-card-actions">
                  <span>{formatWhen(v.at)}</span>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => removeOne(v.id)}
                    disabled={busyId === v.id || clearing}
                  >
                    {busyId === v.id ? "…" : "Sil"}
                  </button>
                </div>
              </div>
              <dl className="visit-grid">
                <div>
                  <dt>IP</dt>
                  <dd>
                    <code>{dash(v.ip)}</code>
                  </dd>
                </div>
                <div>
                  <dt>Mənbə</dt>
                  <dd>
                    {v.locationSource === "gps"
                      ? "GPS (dəqiq)"
                      : v.locationSource === "ip"
                        ? "IP (təxmini)"
                        : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Latitude</dt>
                  <dd>{dash(v.latitude)}</dd>
                </div>
                <div>
                  <dt>Longitude</dt>
                  <dd>{dash(v.longitude)}</dd>
                </div>
                <div>
                  <dt>Dəqiqlik</dt>
                  <dd>
                    {typeof v.locationAccuracy === "number"
                      ? `±${Math.round(v.locationAccuracy)} m`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Altitude</dt>
                  <dd>
                    {typeof v.altitude === "number"
                      ? `${Math.round(v.altitude)} m`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Rayon / məhəllə</dt>
                  <dd>{dash(v.district)}</dd>
                </div>
                <div>
                  <dt>Şəhər</dt>
                  <dd>{dash(v.city)}</dd>
                </div>
                <div>
                  <dt>Ölkə</dt>
                  <dd>{dash(v.country)}</dd>
                </div>
                <div>
                  <dt>Timezone</dt>
                  <dd>{dash(v.timezone)}</dd>
                </div>
                <div>
                  <dt>IP lat/long (təxmini)</dt>
                  <dd>
                    {v.ipLatitude != null && v.ipLongitude != null
                      ? `${v.ipLatitude}, ${v.ipLongitude}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Xəritə</dt>
                  <dd>
                    {v.mapsUrl ? (
                      <a href={v.mapsUrl} target="_blank" rel="noreferrer">
                        Google Maps
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="visit-ua">
                  <dt>Ünvan</dt>
                  <dd>{dash(v.address)}</dd>
                </div>
                <div>
                  <dt>Cihaz tipi</dt>
                  <dd>{dash(v.deviceType)}</dd>
                </div>
                <div>
                  <dt>Marka</dt>
                  <dd>{dash(v.deviceVendor)}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{dash(v.deviceModel)}</dd>
                </div>
                <div>
                  <dt>OS</dt>
                  <dd>
                    {dash(v.osName)}
                    {v.osVersion ? ` ${v.osVersion}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>Brauzer</dt>
                  <dd>
                    {dash(v.browserName)}
                    {v.browserVersion ? ` ${v.browserVersion}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>Platform</dt>
                  <dd>{dash(v.platform)}</dd>
                </div>
                <div>
                  <dt>Dil</dt>
                  <dd>
                    {v.languages?.length ? v.languages.join(", ") : dash(v.language)}
                  </dd>
                </div>
                <div>
                  <dt>Ekran</dt>
                  <dd>
                    {v.screenWidth && v.screenHeight
                      ? `${v.screenWidth}×${v.screenHeight}`
                      : "—"}
                    {v.pixelRatio ? ` @${v.pixelRatio}x` : ""}
                  </dd>
                </div>
                <div>
                  <dt>Viewport</dt>
                  <dd>
                    {v.viewportWidth && v.viewportHeight
                      ? `${v.viewportWidth}×${v.viewportHeight}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Touch / CPU</dt>
                  <dd>
                    touch:{dash(v.touchPoints)} / cores:{dash(v.hardwareConcurrency)}
                  </dd>
                </div>
                <div>
                  <dt>Şəbəkə</dt>
                  <dd>{dash(v.connectionType)}</dd>
                </div>
                <div className="visit-ua">
                  <dt>User-Agent</dt>
                  <dd>{dash(v.userAgent)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
