import { withApiHandler } from "@/lib/with-api-handler";
import { companyService } from "@/services";

/**
 * GET /api/companies/list - Get list of all companies
 * Returns: Array of { id, name, type }
 */
export const GET = withApiHandler(async () => {
  return companyService.getCompanyList();
}, "GET /api/companies/list");
