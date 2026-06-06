/**
 * Gates seed JSON inclusion by build variant.
 *
 * Production/Internal (APP_VARIANT != "sideload"): omits seed-power.json
 * by not bundling assets/data (positive patterns only — no negated globs).
 *
 * Sideload (APP_VARIANT == "sideload"): bundles seed-power.json only.
 *
 * Verify production build:
 *   strings App.app/App | grep -qiE '\b(tren|anavar|nandrolone)\b'
 * must return empty.
 */
const withSeedJson = (config) => {
  const isSideload = process.env.APP_VARIANT === "sideload";

  if (isSideload) {
    config.assetBundlePatterns = ["assets/data/seed-power.json"];
  } else {
    config.assetBundlePatterns = [];
  }

  return config;
};

module.exports = withSeedJson;
