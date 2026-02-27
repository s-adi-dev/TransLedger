import { withApiHandler } from "@/lib/with-api-handler";
import { paymentService } from "@/services";
import { companyIdSchema } from "@/validators";
import { z } from "zod";

const dateParamSchema = z
  .string()
  .pipe(z.coerce.date({ message: "Invalid date format. Use YYYY-MM-DD" }));

const typeParamSchema = z.enum(["advance", "balance"], {
  message: "Type must be 'advance' or 'balance'",
});

/**
 * GET /api/payments/company/:id/:type/:date - Get payment trips by type and date
 */
export const GET = withApiHandler(async (_request, { params }) => {
  const { id, type, date } = await params;
  const validatedId = companyIdSchema.parse(id);
  const validatedType = typeParamSchema.parse(type);
  const parsedDate = dateParamSchema.parse(date);
  return paymentService.getPaymentTripsByDate(
    validatedId,
    validatedType,
    parsedDate,
  );
}, "GET /api/payments/company/[id]/[type]/[date]");
