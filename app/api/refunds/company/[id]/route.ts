import { withApiHandler } from "@/lib/with-api-handler";
import { refundService } from "@/services";
import { companyIdSchema } from "@/validators";

/**
 * GET /api/refunds/company/[id] - Get refunds by company
 */
export const GET = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = companyIdSchema.parse(id);
  return refundService.getRefundsByCompany(validatedId);
}, "GET /api/refunds/company/[id]");
