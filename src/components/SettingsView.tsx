"use client";

import PreferencesPanel from "./PreferencesPanel";
import SyncPanel from "./SyncPanel";
import WalkAlerts from "./WalkAlerts";

export default function SettingsView() {
  return (
    <div className="stack">
      <PreferencesPanel />
      <WalkAlerts />
      <SyncPanel />
    </div>
  );
}
