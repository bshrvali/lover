import Link from "next/link";
import Proposal from "@/components/Proposal";
import { decodeName } from "@/lib/name";

type Props = {
  params: Promise<{ encoded: string[] }>;
};

export default async function ProposalPage({ params }: Props) {
  const { encoded } = await params;
  const joined = encoded.map((part) => decodeURIComponent(part)).join("/");
  const name = decodeName(joined);

  if (!name) {
    return (
      <div className="stage">
        <div className="home-card">
          <h1>Lover</h1>
          <p>Link düzgün deyil. Ana səhifədən yeni link yarat.</p>
          <Link className="btn btn-yes" href="/" style={{ display: "inline-block", textDecoration: "none" }}>
            Ana səhifə
          </Link>
        </div>
      </div>
    );
  }

  return <Proposal name={name} />;
}
