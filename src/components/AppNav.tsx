"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList } from "lucide-react";

const items = [
  { href: "/", label: "交易日志", icon: ClipboardList },
  { href: "/analyze", label: "图表分析", icon: BarChart3 }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex w-fit gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
              active ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
