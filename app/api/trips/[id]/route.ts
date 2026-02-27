import { withApiHandler } from "@/lib/with-api-handler";
import { tripService } from "@/services";
import { tripIdSchema, updateTripSchema } from "@/validators";

/**
 * GET /api/trips/[id] - Get a trip by ID
 */
export const GET = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = tripIdSchema.parse(id);
  return tripService.getTripById(validatedId);
}, "GET /api/trips/[id]");

/**
 * PUT /api/trips/[id] - Update a trip
 */
export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = await params;
  const validatedId = tripIdSchema.parse(id);
  const body = await request.json();
  const validated = updateTripSchema.parse(body);
  return tripService.updateTrip(validatedId, validated);
}, "PUT /api/trips/[id]");

/**
 * DELETE /api/trips/[id] - Delete a trip
 */
export const DELETE = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = tripIdSchema.parse(id);
  return tripService.deleteTrip(validatedId);
}, "DELETE /api/trips/[id]");
