import { Hono } from "hono";
// TODO: Implement billing module
// import {
//   createBookingPayment,
//   processBookingPayment,
//   refundBookingPayment,
//   calculateBookingTotal,
// } from "@/core/billing";
import { authMiddleware } from "../middleware/auth";
import { errors } from "../lib/response";

export const bookingPaymentRoutes = new Hono();

// Create booking payment
bookingPaymentRoutes.post("/create", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Booking payments not yet implemented');
});

// Process booking payment
bookingPaymentRoutes.post("/process", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Booking payments not yet implemented');
});

// Refund booking payment
bookingPaymentRoutes.post("/refund", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Booking payments not yet implemented');
});

// Calculate booking total
bookingPaymentRoutes.post("/calculate", authMiddleware, async (c) => {
  return errors.badRequest(c, 'Booking payments not yet implemented');
});
