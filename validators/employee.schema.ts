import { z } from "zod";
import { apiResponseSchema } from "./global.schema";

// Base employee input schema (for nested creation in company)
export const employeeInputSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  designation: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
});

// Employee Schemas
export const createEmployeeSchema = employeeInputSchema.extend({
  companyId: z.string().uuid("Invalid company ID").optional(),
});

export const updateEmployeeSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    designation: z.string().optional(),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    altPhone: z.string().optional(),
    companyId: z.string().uuid("Invalid company ID").optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const employeeIdSchema = z.string().uuid("Invalid employee ID");

// Employee query params schema for filtering
export const employeeQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Employee Response Schema
export const employeeResponseSchema = apiResponseSchema.extend({
  employee: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string().nullable(),
      designation: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      altPhone: z.string().nullable(),
      companyId: z.string().nullable(),
      company: z
        .object({
          id: z.string(),
          name: z.string(),
          type: z.enum(["material", "truck"]),
        })
        .nullable()
        .optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
    .optional(),
});

export const allEmployeeResponseSchema = apiResponseSchema.extend({
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
        companyId: z.string().nullable(),
        company: z
          .object({
            id: z.string(),
            name: z.string(),
            type: z.enum(["material", "truck"]),
          })
          .nullable()
          .optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    )
    .optional(),
  nextCursor: z.string().optional().nullable(),
  hasMore: z.boolean().optional(),
});

// Type exports
export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type CreateEmployeeType = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeType = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryType = z.infer<typeof employeeQuerySchema>;
export type EmployeeResponse = z.infer<typeof employeeResponseSchema>;
export type AllEmployeeResponse = z.infer<typeof allEmployeeResponseSchema>;
