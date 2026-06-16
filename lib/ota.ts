import * as Sentry from "@sentry/react-native";
import * as Updates from "expo-updates";

/**
 * Check for an OTA update on the current channel, download it if there is
 * one, and report whether a new bundle was actually staged. The bundle takes
 * effect on the next call to `applyUpdate()` (or on the next cold start).
 *
 * No-ops in dev (Updates.isEnabled is false under Expo Go / dev client) and
 * swallows network errors so a failed check never disrupts the launch.
 */
export async function checkAndFetchUpdate(): Promise<boolean> {
  if (!Updates.isEnabled) return false;
  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return false;
    const fetched = await Updates.fetchUpdateAsync();
    return fetched.isNew;
  } catch (err) {
    Sentry.captureException(err);
    return false;
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
