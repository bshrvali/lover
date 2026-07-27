import Link from "next/link";
import Proposal from "@/components/Proposal";
import { decodeName } from "@/lib/name";
import { extractYoutubeId } from "@/lib/youtube";

type Props = {
  params: Promise<{ encoded: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProposalPage({ params, searchParams }: Props) {
  const { encoded } = await params;
  const query = await searchParams;
  const joined = encoded.map((part) => decodeURIComponent(part)).join("/");
  const name = decodeName(joined);

  const ytRaw = Array.isArray(query.yt) ? query.yt[0] : query.yt;
  const youtubeId = extractYoutubeId(ytRaw ?? null);

  if (!name) {
    return (
      <div className="stage">
        <div className="home-card">
          <h1>Lover</h1>
          <p>Link düzgün deyil.</p>
          <Link className="btn btn-yes" href="/visits" style={{ display: "inline-block", textDecoration: "none" }}>
            Visits
          </Link>
        </div>
      </div>
    );
  }

  return <Proposal name={name} youtubeId={youtubeId} />;
}
