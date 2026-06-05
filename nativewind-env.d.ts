/// <reference types="nativewind/types" />

// Allow CSS imports for NativeWind
declare module "*.css" {
  const content: void;
  export default content;
}
