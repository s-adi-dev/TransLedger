import { withApiHandler } from "@/lib/with-api-handler";
import { employeeService } from "@/services";
import { employeeIdSchema, updateEmployeeSchema } from "@/validators";

/**
 * GET /api/employees/[id] - Get an employee by ID
 */
export const GET = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = employeeIdSchema.parse(id);
  return employeeService.getEmployeeById(validatedId);
}, "GET /api/employees/[id]");

/**
 * PUT /api/employees/[id] - Update an employee
 */
export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = await params;
  const validatedId = employeeIdSchema.parse(id);
  const body = await request.json();
  const validated = updateEmployeeSchema.parse(body);
  return employeeService.updateEmployee(validatedId, validated);
}, "PUT /api/employees/[id]");

/**
 * DELETE /api/employees/[id] - Delete an employee
 */
export const DELETE = withApiHandler(async (_request, { params }) => {
  const { id } = await params;
  const validatedId = employeeIdSchema.parse(id);
  return employeeService.deleteEmployee(validatedId);
}, "DELETE /api/employees/[id]");
