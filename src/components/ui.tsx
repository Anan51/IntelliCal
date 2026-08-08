"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Section({
  title,
  subtitle,
  children,
  actions,
  kicker,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  kicker?: string;
}) {
  return (
    <section className="panel reveal">
      {(title || actions || kicker) && (
        <div className="panel-head">
          <div>
            {kicker ? <p className="kicker">{kicker}</p> : null}
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p className="subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="section-actions">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props} />
  );
}

export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <nav className="tab-rail" role="tablist" aria-label="IntelliCal views">
      {tabs.map((t, index) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={`tab-item${value === t.id ? " active" : ""}`}
          onClick={() => onChange(t.id)}
          style={{ ["--i" as string]: index }}
        >
          <span className="tab-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="tab-label">{t.label}</span>
          {t.hint ? <span className="tab-hint">{t.hint}</span> : null}
        </button>
      ))}
    </nav>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "accent";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}
