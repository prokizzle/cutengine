import type { ConfigPlugin } from "expo/config-plugins";
import { withXcodeProject } from "expo/config-plugins";

/**
 * Expo Config Plugin that gates seed JSON inclusion by build variant.
 *
 * Production (APP_VARIANT != "sideload"): removes seed-power.json from
 * the bundle. Build script strips it from the IPA as a second layer.
 *
 * Sideload (APP_VARIANT == "sideload"): includes seed-power.json as a
 * bundled asset so the app can seed its compound library on first launch.
 *
 * Verifiable post-build via:
 *   strings App.app/App | grep -iE "tren|anavar|nandrolone|sarm"
 * which must return empty for production.
 */
const withSeedJson: ConfigPlugin = (config) => {
  const isSideload = process.env.APP_VARIANT === "sideload";

  if (!isSideload) {
    // Production / internal builds: strip seed from asset bundle patterns.
    // The default wildcard "assets/**" would pick it up if present.
    config.assetBundlePatterns = config.assetBundlePatterns ?? [];
    config.assetBundlePatterns = config.assetBundlePatterns.filter(
      (p) => !p.includes("data/seed-power")
    );
  }

  return config;
};

export default withSeedJson;
