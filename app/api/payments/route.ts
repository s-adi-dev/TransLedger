import { withApiHandler } from "@/lib/with-api-handler";
import { paymentService } from "@/services";

/**
 * GET /api/payments - Get all payments grouped by company
 */
export const GET = withApiHandler(async () => {
  return paymentService.getAllPayments();
}, "GET /api/payments");
