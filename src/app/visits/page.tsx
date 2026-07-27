import { listVisits } from "@/lib/tracking";

export const dynamic = "force-dynamic";

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

export default async function VisitsPage() {
  const visits = await listVisits();

  return (
    <main className="visits-page">
      <header className="visits-header">
        <h1>Visits</h1>
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
                <span>{formatWhen(v.at)}</span>
              </div>
              <dl className="visit-grid">
                <div>
                  <dt>IP</dt>
                  <dd>
                    <code>{dash(v.ip)}</code>
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
    </main>
  );
}
