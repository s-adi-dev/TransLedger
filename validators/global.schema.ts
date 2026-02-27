import { AxiosError } from "axios";
import z from "zod";

// ─── Shared Enums ────────────────────────────────────────────────────────────

export const PartyTypeEnum = z.enum(["material", "truck"]);
export type PartyType = z.infer<typeof PartyTypeEnum>;

// ─── Shared ID Schemas ──────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid("Invalid ID");
export const refundIdSchema = z.string().uuid("Invalid refund ID");

// ─── Shared ID Schemas ──────────────────────────────────────────────────────

export const refundInputSchema = z.object({
  refundAmount: z.coerce.number().min(0, "Refund amount must be positive"),
  refundDate: z.coerce.date(),
});

export const refundResponseSchema = z.object({
  id: z.string(),
  refundAmount: z.number(),
  refundDate: z.date(),
});

// ─── Base Response ──────────────────────────────────────────────────────────

export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Interfaces
export interface ApiErrorData {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Type exports
export type ApiErrorResponse<T = ApiErrorData> = AxiosError<T>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
