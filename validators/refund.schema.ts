import { z } from "zod";
import {
  apiResponseSchema,
  PartyTypeEnum,
  refundInputSchema,
  refundResponseSchema,
} from "./global.schema";
import { tripBaseSchema } from "./trip.schema";

// Input Schemas
export const updateRefundSchema = z.object({
  refundAmount: z.coerce.number().min(0).optional(),
  refundDate: z.coerce.date().optional(),
});

// Response Schemas
export const companyRefundSummarySchema = z.object({
  companyName: z.string(),
  companyId: z.string(),
  companyType: PartyTypeEnum,
  tripCount: z.number(),
  refundCount: z.number(),
  refundTotal: z.number(),
});

export const refundsByDateSchema = z.object({
  refundDate: z.date(),
  tripCount: z.number(),
  refundAmt: z.number(),
});

export const allRefundsResponseSchema = apiResponseSchema.extend({
  refunds: z.array(companyRefundSummarySchema).optional(),
});

export const refundsByCompanyResponseSchema = apiResponseSchema.extend({
  refunds: z.array(refundsByDateSchema).optional(),
});

export const refundTripsByDateResponseSchema = apiResponseSchema.extend({
  trips: z.array(tripBaseSchema).optional(),
});

// Type Exports
export type RefundInput = z.infer<typeof refundInputSchema>;
export type UpdateRefund = z.infer<typeof updateRefundSchema>;
export type RefundResponse = z.infer<typeof refundResponseSchema>;
export type CompanyRefundSummary = z.infer<typeof companyRefundSummarySchema>;
export type RefundsByDate = z.infer<typeof refundsByDateSchema>;
export type AllRefundsResponse = z.infer<typeof allRefundsResponseSchema>;
export type RefundsByCompanyResponse = z.infer<
  typeof refundsByCompanyResponseSchema
>;
export type RefundTripsByDateResponse = z.infer<
  typeof refundTripsByDateResponseSchema
>;
