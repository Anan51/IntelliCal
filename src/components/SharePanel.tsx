"use client";

import { useState } from "react";
import { newId } from "@/lib/id";
import type { ShareLink } from "@/lib/types";
import { YOU_ID, useCalendarStore } from "@/store/calendarStore";
import { Badge, Button, Empty, Section } from "./ui";

export default function SharePanel() {
  const shareLinks = useCalendarStore((s) => s.shareLinks);
  const addShareLink = useCalendarStore((s) => s.addShareLink);
  const revokeShareLink = useCalendarStore((s) => s.revokeShareLink);
  const prefsAsFree = useCalendarStore((s) => s.prefsAsFreeForOverlap);
  const [copied, setCopied] = useState<string | null>(null);

  async function createLink() {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    let link: ShareLink = {
      token: newId("share"),
      personId: YOU_ID,
      expiresAt: expires.toISOString(),
      scope: "free_busy",
      revoked: false,
      prefsAsFree,
    };

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personId: YOU_ID, prefsAsFree }),
      });
      if (res.ok) {
        link = (await res.json()) as ShareLink;
      }
    } catch {
      // local fallback
    }
    addShareLink(link);
  }

  function shareUrl(token: string): string {
    if (typeof window === "undefined") return `/share/${token}`;
    return `${window.location.origin}/share/${token}`;
  }

  async function copy(token: string) {
    const url = shareUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(token);
    } catch {
      setCopied(token);
    }
  }

  const active = shareLinks.filter((l) => !l.revoked);

  return (
    <Section
      title="Share links"
      subtitle="Friends see free/busy only — never titles or locations."
      actions={<Button onClick={createLink}>Create share link</Button>}
    >
      {active.length === 0 ? (
        <Empty>No active share links. Create one to find overlapping free time.</Empty>
      ) : (
        <ul className="share-list">
          {active.map((l) => (
            <li key={l.token} className="share-card">
              <div className="share-card-top">
                <code>{shareUrl(l.token)}</code>
                <Badge tone={l.prefsAsFree ? "accent" : "neutral"}>
                  {l.prefsAsFree ? "prefs free" : "prefs busy"}
                </Badge>
              </div>
              <p className="muted">Expires {new Date(l.expiresAt).toLocaleDateString()}</p>
              <div className="share-actions">
                <Button variant="secondary" onClick={() => copy(l.token)}>
                  {copied === l.token ? "Copied" : "Copy link"}
                </Button>
                <a className="btn btn-secondary" href={`/share/${l.token}`}>
                  Open
                </a>
                <Button
                  variant="danger"
                  onClick={async () => {
                    revokeShareLink(l.token);
                    try {
                      await fetch("/api/share", {
                        method: "DELETE",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ token: l.token }),
                      });
                    } catch {
                      // local revoke already applied
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
