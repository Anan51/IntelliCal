import { eventContentHash } from "./hash";
import type { CalEvent, SyncOp } from "./types";

/**
 * Pure reconciliation between local IntelliCal events and remote Google events.
 * Conflict rule: remote `updatedAt` wins when both sides changed (last-writer-wins).
 * Matching key: externalId. Content compared via contentHash.
 */
export function reconcileSync(args: {
  local: CalEvent[];
  remote: CalEvent[];
}): SyncOp[] {
  const { local, remote } = args;
  const ops: SyncOp[] = [];

  const localByExt = new Map(
    local.filter((e) => e.externalId).map((e) => [e.externalId!, e])
  );
  const remoteByExt = new Map(
    remote.filter((e) => e.externalId).map((e) => [e.externalId!, e])
  );

  for (const [extId, remoteEv] of remoteByExt) {
    const localEv = localByExt.get(extId);
    if (!localEv) {
      ops.push({ op: "create", remote: remoteEv });
      continue;
    }
    const localHash = localEv.contentHash ?? eventContentHash(localEv);
    const remoteHash = remoteEv.contentHash ?? eventContentHash(remoteEv);
    if (localHash === remoteHash) continue;

    const localNewer = localEv.updatedAt > remoteEv.updatedAt;
    ops.push({
      op: "update",
      local: localEv,
      remote: remoteEv,
      winner: localNewer ? "local" : "remote",
    });
  }

  for (const [extId, localEv] of localByExt) {
    if (!remoteByExt.has(extId)) {
      // Local was previously synced but gone remotely → delete local
      ops.push({ op: "delete", side: "local", event: localEv });
    }
  }

  // Local events never pushed (no externalId) → create remote
  for (const localEv of local) {
    if (localEv.externalId) continue;
    if (localEv.source === "sync") continue;
    ops.push({ op: "create", local: localEv });
  }

  return ops;
}

export function applyReconcileOps(
  local: CalEvent[],
  ops: SyncOp[]
): CalEvent[] {
  let next = [...local];
  for (const op of ops) {
    switch (op.op) {
      case "create": {
        if (op.remote) {
          const exists = next.some((e) => e.externalId && e.externalId === op.remote!.externalId);
          if (!exists) next.push(op.remote);
        }
        break;
      }
      case "update": {
        if (op.winner === "remote") {
          next = next.map((e) => (e.id === op.local.id ? { ...op.remote, id: op.local.id } : e));
        }
        break;
      }
      case "delete": {
        if (op.side === "local") {
          next = next.filter((e) => e.id !== op.event.id);
        }
        break;
      }
      default: {
        const _exhaustive: never = op;
        return _exhaustive;
      }
    }
  }
  return next;
}
