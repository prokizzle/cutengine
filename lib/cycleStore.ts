import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
import type {
  BiofeedbackEntry,
  UserProfile,
} from "../modules/expo-cycle-store/src/index";

// Local Expo Module — resolved at build time, not by tsc
const CycleStore = require("../modules/expo-cycle-store/src").default as {
  getUserProfile: () => Promise<UserProfile>;
  hasUserProfile: () => Promise<boolean>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  getBiofeedbackEntries: () => Promise<BiofeedbackEntry[]>;
  saveBiofeedbackEntry: (entry: BiofeedbackEntry) => Promise<void>;
};

export async function loadUserProfile(): Promise<UserProfile | null> {
  if (Platform.OS !== "ios") return null;
  try {
    return await CycleStore.getUserProfile();
  } catch (err) {
    console.error("[CycleStore] getUserProfile error:", err);
    Sentry.captureException(err);
    return null;
  }
}

export async function persistUserProfile(profile: UserProfile): Promise<void> {
  if (Platform.OS !== "ios") return;
  await CycleStore.saveUserProfile(profile);
}

/** True when the singleton row exists — used to skip first-launch onboarding.
 *  Off-iOS returns true so the gate never traps non-iOS dev sessions.
 *  Errors fail CLOSED (false): if we cannot confirm a profile, treat the user
 *  as new and route them to onboarding rather than stranding them on a
 *  half-empty dashboard. This is safe because onboarding guards against
 *  overwriting an existing profile (see app/onboarding.tsx), and when the
 *  store is genuinely broken a re-save fails too — so no data is lost. */
export async function hasUserProfile(): Promise<boolean> {
  if (Platform.OS !== "ios") return true;
  try {
    return await CycleStore.hasUserProfile();
  } catch (err) {
    console.error("[CycleStore] hasUserProfile error:", err);
    Sentry.captureException(err);
    return false;
  }
}

export async function loadBiofeedbackEntries(): Promise<BiofeedbackEntry[]> {
  if (Platform.OS !== "ios") return [];
  try {
    return await CycleStore.getBiofeedbackEntries();
  } catch (err) {
    console.error("[CycleStore] getBiofeedbackEntries error:", err);
    Sentry.captureException(err);
    return [];
  }
}

export async function persistBiofeedbackEntry(entry: BiofeedbackEntry): Promise<void> {
  if (Platform.OS !== "ios") return;
  await CycleStore.saveBiofeedbackEntry(entry);
}
