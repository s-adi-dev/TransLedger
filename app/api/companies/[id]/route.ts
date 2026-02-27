import { withApiHandler } from "@/lib/with-api-handler";
import { companyService } from "@/services";
import { companyIdSchema, updateCompanySchema } from "@/validators";

/**
 * GET /api/companies/[id] - Get a company by ID
 */
export const GET = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = companyIdSchema.parse(id);
  return companyService.getCompanyById(validatedId);
}, "GET /api/companies/[id]");

/**
 * PUT /api/companies/[id] - Update a company
 */
export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = await params;
  const validatedId = companyIdSchema.parse(id);
  const body = await request.json();
  const validated = updateCompanySchema.parse(body);
  return companyService.updateCompany(validatedId, validated);
}, "PUT /api/companies/[id]");

/**
 * DELETE /api/companies/[id] - Delete a company
 */
export const DELETE = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = companyIdSchema.parse(id);
  return companyService.deleteCompany(validatedId);
}, "DELETE /api/companies/[id]");
