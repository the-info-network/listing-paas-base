import { Hono } from "hono";
// TODO: Implement billing module
// import {
//   getAvailableUpgrades,
//   previewUpgrade,
//   upgradeSubscription,
//   downgradeSubscription,
// } from "@/core/billing";
import { authMiddleware } from "../middleware/auth";
import { errors } from "../lib/response";

export const subscriptionUpgradeRoutes = new Hono();

// Get available upgrades
subscriptionUpgradeRoutes.get("/upgrades", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Subscription upgrades not yet implemented');
});

// Preview upgrade cost
subscriptionUpgradeRoutes.post("/preview", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Subscription upgrades not yet implemented');
});

// Upgrade subscription
subscriptionUpgradeRoutes.post("/upgrade", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Subscription upgrades not yet implemented');
});

// Downgrade subscription
subscriptionUpgradeRoutes.post("/downgrade", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Subscription upgrades not yet implemented');
});
