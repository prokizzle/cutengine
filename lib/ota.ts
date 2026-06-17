import * as Sentry from "@sentry/react-native";
import * as Updates from "expo-updates";

export type UpdateCheckOutcome =
  | { status: "disabled" }
  | { status: "up-to-date" }
  | { status: "staged" }
  | { status: "already-pending" }
  | { status: "error"; error: unknown };

/**
 * Check for an OTA update on the current channel, download it if there is
 * one, and report a discriminated outcome so callers can show the right
 * message instead of collapsing every non-success into "up to date":
 *
 *   - `disabled`         — Updates module is off (Expo Go / dev client)
 *   - `up-to-date`       — no update available on the server
 *   - `staged`           — a new bundle was downloaded; restart to apply
 *   - `already-pending`  — server returned a bundle we'd already fetched but
 *                          haven't restarted into yet
 *   - `error`            — checkForUpdate or fetchUpdate threw; also
 *                          reported to Sentry
 */
export async function checkAndFetchUpdate(): Promise<UpdateCheckOutcome> {
  if (!Updates.isEnabled) return { status: "disabled" };
  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return { status: "up-to-date" };
    const fetched = await Updates.fetchUpdateAsync();
    return { status: fetched.isNew ? "staged" : "already-pending" };
  } catch (error) {
    Sentry.captureException(error);
    return { status: "error", error };
  }
}

/**
 * Restart the JS runtime so the most recently fetched update takes effect.
 * Throws if no update has been fetched yet, so call this only after
 * `checkAndFetchUpdate()` returned true or `useUpdates().isUpdatePending`
 * is true.
 */
export async function applyUpdate(): Promise<void> {
  await Updates.reloadAsync();
}
