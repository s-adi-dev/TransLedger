import { withApiHandler } from "@/lib/with-api-handler";
import { companyService } from "@/services";
import { companyQuerySchema, createCompanySchema } from "@/validators";

/**
 * GET /api/companies - Get all companies with filtering and pagination
 */
export const GET = withApiHandler(async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const params = {
    type: searchParams.get("type") || undefined,
    search: searchParams.get("search") || undefined,
    cursor: searchParams.get("cursor") || undefined,
    limit: searchParams.get("limit") || undefined,
  };
  const validatedParams = companyQuerySchema.parse(params);
  return companyService.getAllCompanies(validatedParams);
}, "GET /api/companies");

/**
 * POST /api/companies - Create a new company
 */
export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const validated = createCompanySchema.parse(body);
  return companyService.createCompany(validated);
}, "POST /api/companies");
