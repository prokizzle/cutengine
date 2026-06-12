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
 *  Errors deliberately fail OPEN (true): failing closed would re-run
 *  onboarding for an existing user after a transient store error, and
 *  completing it overwrites their saved profile. Failing open only means a
 *  brand-new user lands on the dashboard with defaults, fixable in Settings. */
export async function hasUserProfile(): Promise<boolean> {
  if (Platform.OS !== "ios") return true;
  try {
    return await CycleStore.hasUserProfile();
  } catch (err) {
    console.error("[CycleStore] hasUserProfile error:", err);
    Sentry.captureException(err);
    return true;
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
