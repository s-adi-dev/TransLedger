import { z } from "zod";
import { employeeInputSchema } from "./employee.schema";
import { apiResponseSchema, PartyTypeEnum } from "./global.schema";

// Company Schemas
export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  type: PartyTypeEnum,
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  note: z.string().optional(),
  employees: z.array(employeeInputSchema).optional(),
});

export const updateCompanySchema = z
  .object({
    name: z.string().min(1).optional(),
    type: PartyTypeEnum.optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    note: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const companyIdSchema = z.string().uuid("Invalid company ID");

// Company query params schema for filtering
export const companyQuerySchema = z.object({
  type: PartyTypeEnum.optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Company Response Schema
export const companyResponseSchema = apiResponseSchema.extend({
  company: z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["material", "truck"]),
      address: z.string().nullable(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
      note: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
      employees: z
        .array(
          z.object({
            id: z.string(),
            firstName: z.string(),
            lastName: z.string().nullable(),
            designation: z.string().nullable(),
            email: z.string().nullable(),
            phone: z.string().nullable(),
            altPhone: z.string().nullable(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
        )
        .optional(),
      _count: z
        .object({
          employees: z.number(),
          payments: z.number(),
        })
        .optional(),
    })
    .optional(),
});

export const allCompanyResponseSchema = apiResponseSchema.extend({
  companies: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["material", "truck"]),
        address: z.string().nullable(),
        phone: z.string().nullable(),
        email: z.string().nullable(),
        note: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
        _count: z
          .object({
            employees: z.number(),
            payments: z.number(),
          })
          .optional(),
      }),
    )
    .optional(),
  nextCursor: z.string().optional().nullable(),
  hasMore: z.boolean().optional(),
});

export const companyListResponseSchema = apiResponseSchema.extend({
  companies: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["material", "truck"]),
      }),
    )
    .optional(),
});

// Type exports
export type CreateCompanyType = z.infer<typeof createCompanySchema>;
export type UpdateCompanyType = z.infer<typeof updateCompanySchema>;
export type CompanyQueryType = z.infer<typeof companyQuerySchema>;
export type CompanyResponse = z.infer<typeof companyResponseSchema>;
export type AllCompanyResponse = z.infer<typeof allCompanyResponseSchema>;
export type CompanyListResponse = z.infer<typeof companyListResponseSchema>;
