import { withApiHandler } from "@/lib/with-api-handler";
import { tripService } from "@/services";
import { createTripSchema, tripQuerySchema } from "@/validators";

/**
 * GET /api/trips - Get all trips with filtering and pagination
 */
export const GET = withApiHandler(async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const params = {
    search: searchParams.get("search") || undefined,
    truckNo: searchParams.get("truckNo") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    biltiStatus: searchParams.get("biltiStatus") || undefined,
    paymentStatus: searchParams.get("paymentStatus") || undefined,
    materialPartyId: searchParams.get("materialPartyId") || undefined,
    truckPartyId: searchParams.get("truckPartyId") || undefined,
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  };
  const validatedParams = tripQuerySchema.parse(params);
  return tripService.getAllTrips(validatedParams);
}, "GET /api/trips");

/**
 * POST /api/trips - Create a new trip
 */
export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const validated = createTripSchema.parse(body);
  return tripService.createTrip(validated);
}, "POST /api/trips");
