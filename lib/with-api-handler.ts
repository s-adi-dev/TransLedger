import { formatZodErrors } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiResult = { success: boolean; message?: string };

type RouteParams = { params: Promise<Record<string, string>> };

type HandlerFn = (
  request: NextRequest,
  context: RouteParams,
) => Promise<ApiResult>;

type NoArgsHandlerFn = () => Promise<ApiResult>;

/**
 * Wraps an API route handler with standardized error handling.
 *
 * @example
 * ```ts
 * export const POST = withApiHandler(async (request) => {
 *   const body = await request.json();
 *   const validated = createCompanySchema.parse(body);
 *   return companyService.createCompany(validated);
 * }, "POST /api/companies");
 * ```
 */
export function withApiHandler(
  handler: HandlerFn | NoArgsHandlerFn,
  routeName?: string,
) {
  return async (request: NextRequest, context: RouteParams) => {
    try {
      const result = await (handler as HandlerFn)(request, context);
      const status = result.success ? 200 : 404;
      return NextResponse.json(result, { status });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid parameters: " + formatZodErrors(error.issues),
          },
          { status: 400 },
        );
      }

      if (routeName) {
        console.error(`Error in ${routeName}:`, error);
      }
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 },
      );
    }
  };
}
