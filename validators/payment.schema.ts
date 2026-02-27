import { z } from "zod";
import { apiResponseSchema, PartyTypeEnum } from "./global.schema";
import { tripBaseSchema } from "./trip.schema";

// Response Schemas
export const companyPaymentSummarySchema = z.object({
  companyName: z.string(),
  companyId: z.string(),
  companyType: PartyTypeEnum,
  tripCount: z.number(),
  advanceCount: z.number(),
  advanceTotal: z.number(),
  balanceCount: z.number(),
  balanceTotal: z.number(),
});

export const paymentsByDateSchema = z.object({
  date: z.date(),
  tripCount: z.number(),
  totalAmount: z.number(),
});

export const allPaymentsResponseSchema = apiResponseSchema.extend({
  payments: z.array(companyPaymentSummarySchema).optional(),
});

export const paymentsByCompanyResponseSchema = apiResponseSchema.extend({
  advancePayments: z.array(paymentsByDateSchema).optional(),
  balancePayments: z.array(paymentsByDateSchema).optional(),
});

export const paymentTripsByDateResponseSchema = apiResponseSchema.extend({
  trips: z.array(tripBaseSchema).optional(),
});

// Type Exports
export type CompanyPaymentSummary = z.infer<typeof companyPaymentSummarySchema>;
export type PaymentsByDate = z.infer<typeof paymentsByDateSchema>;
export type AllPaymentsResponse = z.infer<typeof allPaymentsResponseSchema>;
export type PaymentsByCompanyResponse = z.infer<
  typeof paymentsByCompanyResponseSchema
>;
export type PaymentTripsByDateResponse = z.infer<
  typeof paymentTripsByDateResponseSchema
>;
