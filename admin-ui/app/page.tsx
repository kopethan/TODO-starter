import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Entity workspace",
    description: "Browse, create, and review the entities tracked by the platform."
  },
  {
    title: "Reports moderation",
    description: "Inspect submitted reports and move them through moderation states."
  },
  {
    title: "Structured review flow",
    description: "Keep the admin surface focused instead of forcing an immediate redirect."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
      <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-soft)] px-8 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          TODO Admin
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text-strong)]">
          The root route now stays on <code className="text-3xl">/</code> instead of redirecting to
          <code className="ml-2 text-3xl">/entities</code>.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)]">
          Use this page as the entry point to the admin workspace, then move into entity and report
          management when you choose to.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/entities" className={buttonClasses({})}>
            Open entities
          </Link>
          <Link href="/reports" className={buttonClasses({ variant: "secondary" })}>
            Open reports
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-[var(--text-muted)]">
              {item.description}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
