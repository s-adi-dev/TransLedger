import { withApiHandler } from "@/lib/with-api-handler";
import { tripService } from "@/services";
import { biltiInputSchema, tripIdSchema, updateBiltiSchema } from "@/validators";

/**
 * POST /api/trips/[id]/bilti - Add a bilti to a trip
 */
export const POST = withApiHandler(async (request, { params }) => {
  const { id } = await params;
  const validatedId = tripIdSchema.parse(id);
  const body = await request.json();
  const validated = biltiInputSchema.parse(body);
  return tripService.addBilti(validatedId, validated);
}, "POST /api/trips/[id]/bilti");

/**
 * PUT /api/trips/[id]/bilti - Update a bilti
 */
export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = await params;
  const validatedId = tripIdSchema.parse(id);
  const body = await request.json();
  const validated = updateBiltiSchema.parse(body);
  return tripService.updateBilti(validatedId, validated);
}, "PUT /api/trips/[id]/bilti");
