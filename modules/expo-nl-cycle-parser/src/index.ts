import { requireNativeModule } from "expo-modules-core";

export interface ParsedRule {
  token: string;
  amountMg?: number;
  cadenceText: string;
  daysOfWeek?: number[];
  startWeek?: number;
  endWeek?: number;
  timeOfDay?: string;
}

export interface ParseResult {
  scheduleName?: string;
  rules: ParsedRule[];
  tokenMap: Record<string, string>;
  method: "llm" | "deterministic";
}

const NativeModule = requireNativeModule("ExpoNLCycleParser");

export default {
  /** Parse NL dosing input into structured schedule rules. */
  parse: (input: string, compounds: string[]): Promise<ParseResult> =>
    NativeModule.parse(input, compounds),
};
