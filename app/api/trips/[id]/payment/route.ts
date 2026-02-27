import { withApiHandler } from "@/lib/with-api-handler";
import { tripService } from "@/services";
import { tripIdSchema, updatePartyPaymentSchema } from "@/validators";
import type { PartyType } from "@/validators";

/**
 * PUT /api/trips/[id]/payment - Update trip payment
 * Body: { type: PartyType, ...paymentData }
 */
export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = await params;
  const validatedId = tripIdSchema.parse(id);
  const { type, ...data } = await request.json();
  const validated = updatePartyPaymentSchema.parse(data);
  return tripService.updateTripPayment(validatedId, validated, type as PartyType);
}, "PUT /api/trips/[id]/payment");
