import { withApiHandler } from "@/lib/with-api-handler";
import { refundService } from "@/services";
import { refundIdSchema, updateRefundSchema } from "@/validators";

/**
 * PUT /api/refunds/[id] - Update a refund
 */
export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = await params;
  const validatedId = refundIdSchema.parse(id);
  const body = await request.json();
  const validated = updateRefundSchema.parse(body);
  return refundService.updateRefund(validatedId, validated);
}, "PUT /api/refunds/[id]");

/**
 * DELETE /api/refunds/[id] - Delete a refund
 */
export const DELETE = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = refundIdSchema.parse(id);
  return refundService.deleteRefund(validatedId);
}, "DELETE /api/refunds/[id]");
