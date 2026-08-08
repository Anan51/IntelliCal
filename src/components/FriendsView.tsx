"use client";

import OverlapView from "./OverlapView";
import SharePanel from "./SharePanel";

export default function FriendsView() {
  return (
    <div className="stack">
      <OverlapView />
      <SharePanel />
    </div>
  );
}
