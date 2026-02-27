import { withApiHandler } from "@/lib/with-api-handler";
import { paymentService } from "@/services";
import { companyIdSchema } from "@/validators";

/**
 * GET /api/payments/company/[id] - Get payments by company grouped by date
 */
export const GET = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = companyIdSchema.parse(id);
  return paymentService.getPaymentsByCompany(validatedId);
}, "GET /api/payments/company/[id]");
