import PocketBase from "pocketbase";

export const pb = new PocketBase("https://apibetonabi.vmst.com.vn/");

// PocketBase JS SDK auto-cancels duplicate in-flight requests by default.
// With multiple components fetching the same endpoint concurrently (eg. articles list + article by slug),
// this can lead to intermittent "not found" states on reload/navigation.
// Disable it to make data loading deterministic.
try {
  (
    pb as unknown as { autoCancellation?: (enabled: boolean) => void }
  ).autoCancellation?.(false);
} catch {
  // ignore
}
