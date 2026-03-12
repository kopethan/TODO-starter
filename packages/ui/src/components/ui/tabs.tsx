import { cn } from "../../lib/cn";

export function Tabs({ tabs, value, onChange }: { tabs: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex rounded-2xl bg-[var(--bg-surface-muted)] p-1 shadow-[var(--button-secondary-shadow)]">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className={cn("rounded-xl px-3 py-2 text-sm font-medium transition", value === tab.value ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_10px_20px_rgba(15,23,32,0.08)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.22)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
