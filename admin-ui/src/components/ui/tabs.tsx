import { cn } from "@/lib/utils/cn";

export function Tabs({ tabs, value, onChange }: { tabs: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-muted)] p-1">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className={cn("rounded-lg px-3 py-2 text-sm font-medium transition", value === tab.value ? "bg-[var(--theme-tint)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
