import { withApiHandler } from "@/lib/with-api-handler";
import { refundService } from "@/services";
import { refundIdSchema, refundInputSchema } from "@/validators";

/**
 * GET /api/refunds - Get all refunds grouped by company
 */
export const GET = withApiHandler(async () => {
  return refundService.getAllRefunds();
}, "GET /api/refunds");

/**
 * POST /api/refunds - Add a refund
 */
export const POST = withApiHandler(async (request) => {
  const { paymentId, ...data } = await request.json();
  const validatedId = refundIdSchema.parse(paymentId);
  const validated = refundInputSchema.parse(data);
  return refundService.addRefund(validatedId, validated);
}, "POST /api/refunds");
