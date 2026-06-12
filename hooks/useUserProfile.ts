import { useCallback, useEffect, useState } from "react";
import {
  setMacroOverride,
  updatePhase,
  type MacroRatio,
  type Phase,
  type UserProfile,
} from "../modules/expo-cycle-store/src/userProfile";
import { loadUserProfile, persistUserProfile } from "../lib/cycleStore";

type UseUserProfileResult = {
  profile: UserProfile | null;
  loading: boolean;
  switchPhase: (phase: Phase, weeklyDeltaKg?: number) => Promise<void>;
  setWeeklyDelta: (weeklyDeltaKg: number) => Promise<void>;
  overrideMacros: (phase: Phase, ratio: MacroRatio | null) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const loaded = await loadUserProfile();
    setProfile(loaded);
  }, []);

  useEffect(() => {
    refresh()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refresh]);

  const save = useCallback(async (next: UserProfile) => {
    await persistUserProfile(next);
    setProfile(next);
  }, []);

  const switchPhase = useCallback(
    async (phase: Phase, weeklyDeltaKg?: number) => {
      if (!profile) return;
      await save(updatePhase(profile, phase, { weeklyDeltaKg }));
    },
    [profile, save],
  );

  const setWeeklyDelta = useCallback(
    async (weeklyDeltaKg: number) => {
      if (!profile) return;
      await save({ ...profile, targetWeightDeltaPerWeekKg: weeklyDeltaKg });
    },
    [profile, save],
  );

  const overrideMacros = useCallback(
    async (phase: Phase, ratio: MacroRatio | null) => {
      if (!profile) return;
      await save(setMacroOverride(profile, phase, ratio));
    },
    [profile, save],
  );

  return { profile, loading, switchPhase, setWeeklyDelta, overrideMacros, refresh };
}
