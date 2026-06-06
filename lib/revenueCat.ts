import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesOfferings,
} from "react-native-purchases";

// ---- config ----------------------------------------------------------------

export const PRO_ENTITLEMENT = "CutEngine Pro";

export function configureRevenueCat(apiKey: string): void {
  Purchases.configure({
    apiKey,
    appUserID: undefined, // RevenueCat generates anonymous ID
  });
  if (__DEV__) {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  }
}

// ---- offerings -------------------------------------------------------------

let offeringsCache: PurchasesOfferings | null = null;

export async function fetchOfferings(): Promise<PurchasesPackage[]> {
  if (offeringsCache?.current?.availablePackages.length) {
    return offeringsCache.current.availablePackages;
  }
  try {
    const offerings = await Purchases.getOfferings();
    offeringsCache = offerings;
    return offerings.current?.availablePackages ?? [];
  } catch (err) {
    console.error("[RevenueCat] fetchOfferings error:", err);
    return [];
  }
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (offeringsCache) return offeringsCache;
  try {
    const offerings = await Purchases.getOfferings();
    offeringsCache = offerings;
    return offerings;
  } catch (err) {
    console.error("[RevenueCat] getOfferings error:", err);
    return null;
  }
}

// ---- entitlements ----------------------------------------------------------

export async function checkEntitlement(
  identifier: string = PRO_ENTITLEMENT,
): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[identifier] !== undefined;
  } catch {
    return false;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.error("[RevenueCat] getCustomerInfo error:", err);
    return null;
  }
}

// ---- purchase --------------------------------------------------------------

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await Purchases.purchasePackage(pkg);
    const hasPro =
      result.customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined;
    return { success: hasPro };
  } catch (err: any) {
    if (err?.userCancelled) {
      return { success: false, error: "cancelled" };
    }
    console.error("[RevenueCat] purchase error:", err);
    return { success: false, error: err?.message ?? "Purchase failed" };
  }
}

// ---- restore ---------------------------------------------------------------

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[PRO_ENTITLEMENT] !== undefined;
  } catch (err) {
    console.error("[RevenueCat] restore error:", err);
    return false;
  }
}

// ---- display names ---------------------------------------------------------

export function tierDisplayName(
  pkg: PurchasesPackage,
): { title: string; subtitle: string } {
  switch (pkg.identifier) {
    case "$rc_lifetime":
      return { title: "Lifetime", subtitle: "Pay once, own forever" };
    case "$rc_annual":
      return { title: "Annual", subtitle: "Best value — save 58%" };
    case "$rc_monthly":
      return { title: "Monthly", subtitle: "Full access, cancel anytime" };
    default:
      return {
        title: pkg.product.title,
        subtitle: pkg.product.description ?? "",
      };
  }
}
