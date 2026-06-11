export type TimeOfDay =
  | "morning"
  | "midday"
  | "afternoon"
  | "withMeals"
  | "evening"
  | "bedtime"
  | "anytime";

export type DoseEvent = {
  id: string;
  name: string;
  dose?: number;
  unit?: string;
  timeOfDay?: TimeOfDay | string;
  sortOrder: number;
  taken: boolean;
  regimen?: string;
  weekLabel?: string;
};
