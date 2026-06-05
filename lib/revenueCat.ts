import { Platform } from "react-native";
import Purchases, { type PurchasesPackage } from "react-native-purchases";

export type SubscriptionTier = "monthly" | "annual";

let offeringsCache: PurchasesPackage[] | null = null;

export async function fetchOfferings(): Promise<PurchasesPackage[]> {
  if (offeringsCache) return offeringsCache;
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    offeringsCache = packages;
    return packages;
  } catch (err) {
    console.error("[RevenueCat] fetchOfferings error:", err);
    return [];
  }
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await Purchases.purchasePackage(pkg);
    return { success: Object.keys(result.customerInfo.entitlements.active).length > 0 };
  } catch (err: any) {
    if (err?.userCancelled) {
      return { success: false, error: "cancelled" };
    }
    console.error("[RevenueCat] purchase error:", err);
    return { success: false, error: err?.message ?? "Purchase failed" };
  }
}

export async function checkEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return Object.keys(info.entitlements.active).length > 0;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return Object.keys(info.entitlements.active).length > 0;
  } catch (err) {
    console.error("[RevenueCat] restore error:", err);
    return false;
  }
}
