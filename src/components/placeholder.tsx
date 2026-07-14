import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";

export function Placeholder({
  title,
  description,
  backHref,
  phase,
}: {
  title: string;
  description: string;
  backHref: string;
  phase: string;
}) {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-brand/20 bg-white p-12 text-center">
        <Construction className="mx-auto mb-4 h-12 w-12 text-brand/40" />
        <h1 className="mb-2 font-serif text-2xl font-bold text-ink">{title}</h1>
        <p className="mb-4 text-muted-foreground">{description}</p>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-xs font-medium text-brand">
          🚧 {phase}
        </div>
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg border border-brand/20 px-4 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
