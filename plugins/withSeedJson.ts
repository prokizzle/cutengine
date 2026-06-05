import type { ConfigPlugin } from "expo/config-plugins";

/**
 * Gates seed JSON inclusion by build variant.
 *
 * Production/Internal (APP_VARIANT != "sideload"): strips seed-power.json
 * from bundled assets via exclusion glob.
 *
 * Sideload (APP_VARIANT == "sideload"): includes seed-power.json so the
 * app can seed its compound library on first launch.
 *
 * Verify production build:
 *   strings App.app/App | grep -qiE '\b(tren|anavar|nandrolone)\b'
 * must return empty.
 */
const withSeedJson: ConfigPlugin = (config) => {
  const isSideload = process.env.APP_VARIANT === "sideload";

  if (!isSideload) {
    // Explicit assetBundlePatterns with seed file excluded via negated glob.
    // The Expo default ("assets/**") would pick it up; we enumerate
    // wanted patterns and prepend the exclusion.
    config.assetBundlePatterns = [
      "!assets/data/seed-power.json",
      "assets/**",
    ];
  }

  return config;
};

export default withSeedJson;
