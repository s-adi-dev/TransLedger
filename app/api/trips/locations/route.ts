import { withApiHandler } from "@/lib/with-api-handler";
import { tripService } from "@/services";

/**
 * GET /api/trips/locations - Get unique locations from all trips
 */
export const GET = withApiHandler(async () => {
  return tripService.getUniqueLocations();
}, "GET /api/trips/locations");
