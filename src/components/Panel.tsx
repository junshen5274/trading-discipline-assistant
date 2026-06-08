import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

export function Panel({ title, children, action }: PanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
