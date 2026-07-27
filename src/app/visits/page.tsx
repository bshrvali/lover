import VisitsManager from "@/components/VisitsManager";
import { listVisits } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const visits = await listVisits();

  return (
    <main className="visits-page">
      <VisitsManager initialVisits={visits} />
    </main>
  );
}
