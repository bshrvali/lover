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
        <div className="visits-table-wrap">
          <table className="visits-table">
            <thead>
              <tr>
                <th>Vaxt</th>
                <th>Ad</th>
                <th>IP</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Şəhər</th>
                <th>Ölkə</th>
                <th>User-Agent</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id}>
                  <td>{formatWhen(v.at)}</td>
                  <td>{v.name ?? "—"}</td>
                  <td>
                    <code>{v.ip}</code>
                  </td>
                  <td>{v.latitude ?? "—"}</td>
                  <td>{v.longitude ?? "—"}</td>
                  <td>{v.city ?? "—"}</td>
                  <td>{v.country ?? "—"}</td>
                  <td className="ua">{v.userAgent ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
