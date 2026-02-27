import { withApiHandler } from "@/lib/with-api-handler";
import { employeeService } from "@/services";
import { createEmployeeSchema, employeeQuerySchema } from "@/validators";

/**
 * GET /api/employees - Get all employees with filtering and pagination
 */
export const GET = withApiHandler(async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const params = {
    companyId: searchParams.get("companyId") || undefined,
    search: searchParams.get("search") || undefined,
    cursor: searchParams.get("cursor") || undefined,
    limit: searchParams.get("limit") || undefined,
  };
  const validatedParams = employeeQuerySchema.parse(params);
  return employeeService.getAllEmployees(validatedParams);
}, "GET /api/employees");

/**
 * POST /api/employees - Create a new employee
 */
export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const validated = createEmployeeSchema.parse(body);
  return employeeService.createEmployee(validated);
}, "POST /api/employees");
