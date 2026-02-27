import { withApiHandler } from "@/lib/with-api-handler";
import { refundService } from "@/services";
import { companyIdSchema } from "@/validators";
import { z } from "zod";

const dateParamSchema = z
  .string()
  .pipe(z.coerce.date({ message: "Invalid date format. Use YYYY-MM-DD" }));

/**
 * GET /api/refunds/company/:companyId/date/:date - Get refund trips by date
 */
export const GET = withApiHandler(async (_request, { params }) => {
  const { id, date } = await params;
  const validatedId = companyIdSchema.parse(id);
  const parsedDate = dateParamSchema.parse(date);
  return refundService.getRefundTripsByDate(validatedId, parsedDate);
}, "GET /api/refunds/company/[id]/date/[date]");
