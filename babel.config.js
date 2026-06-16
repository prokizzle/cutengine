const path = require("path");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "react-native-unistyles/plugin",
        {
          root: "app",
          autoProcessPaths: [path.join(__dirname, "components")],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
