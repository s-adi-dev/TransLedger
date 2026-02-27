import { AppConfig } from "@/lib/config";
import { z } from "zod";
import {
  apiResponseSchema,
  refundInputSchema,
  refundResponseSchema,
} from "./global.schema";

// Utility Functions
export const generateTripNo = (n: number) =>
  `${AppConfig.company.initials}-${`${n}`.padStart(5, "0")}`;

// Enums
export const PaymentStatusEnum = z.enum(["pending", "advance", "completed"]);

export const ExtraChargeTypeEnum = z.enum([
  "discount",
  "late_delivery",
  "detention",
  "extra_loading",
  "penalty",
  "other",
]);

export const BiltiStatusEnum = z.enum(["pending", "received", "submitted"]);

// Input Schemas
export const biltiInputSchema = z
  .object({
    no: z.string().min(1, "Bilti number is required"),
    receivedDate: z.coerce.date().optional().nullable(),
    submittedDate: z.coerce.date().optional().nullable(),
  })
  .refine(
    (data) => {
      // submittedDate requires receivedDate
      if (data.submittedDate && !data.receivedDate) {
        return false;
      }
      return true;
    },
    {
      message: "Received date is required before submitted date",
      path: ["receivedDate"],
    },
  )
  .refine(
    (data) => {
      // submittedDate must be >= receivedDate
      if (data.receivedDate && data.submittedDate) {
        return data.submittedDate >= data.receivedDate;
      }
      return true;
    },
    {
      message: "Submitted date must be on or after received date",
      path: ["submittedDate"],
    },
  )
  .transform((data) => {
    // Auto-determine bilti status
    let status: "pending" | "received" | "submitted" = "pending";

    if (data.submittedDate) {
      status = "submitted";
    } else if (data.receivedDate) {
      status = "received";
    }

    return { ...data, status };
  });

export const updateBiltiSchema = z
  .object({
    no: z.string().min(1).optional(),
    receivedDate: z.coerce.date().optional().nullable(),
    submittedDate: z.coerce.date().optional().nullable(),
  })
  .refine(
    (data) => {
      // Cannot set submittedDate without receivedDate
      if (data.submittedDate && data.receivedDate === null) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot set submitted date without received date",
      path: ["submittedDate"],
    },
  )
  .transform((data) => {
    // Auto-determine status if relevant fields present
    let status: "pending" | "received" | "submitted" | undefined = undefined;

    if (data.submittedDate !== undefined) {
      status = data.submittedDate ? "submitted" : undefined;
    } else if (data.receivedDate !== undefined) {
      if (data.receivedDate) {
        status = "received";
      } else if (data.receivedDate === null) {
        status = "pending";
      }
    }

    return {
      ...data,
      ...(status && { status }),
    };
  });

export const partyPaymentInputSchema = z
  .object({
    partyId: z.string().uuid("Invalid party ID"),
    freightAmount: z.coerce
      .number()
      .positive({ message: "Freight amount must be greater than 0" }),
    advanceAmount: z.coerce.number().min(0).default(0),
    advanceDate: z.coerce.date().optional().nullable(),
    loadingCharge: z.coerce.number().min(0).default(0),
    unloadingCharge: z.coerce.number().min(0).default(0),
    damageCharge: z.coerce.number().min(0).default(0),
    tdsAmount: z.coerce.number().min(0).default(0),
    commissionAmount: z.coerce.number().min(0).default(0),
    extraChargesAmount: z.coerce.number().min(0).default(0),
    extraChargesType: ExtraChargeTypeEnum.optional().nullable(),
    finalPaymentDate: z.coerce.date().optional().nullable(),
    refund: refundInputSchema.optional(),
  })
  .refine(
    (data) => {
      // extraChargesAmount and extraChargesType must exist together
      const hasExtraChargesAmount = data.extraChargesAmount > 0;
      const hasExtraChargesType = data.extraChargesType != null;
      return hasExtraChargesAmount === hasExtraChargesType;
    },
    {
      message: "Both extra charges amount and type must be provided together",
      path: ["extraCharges"],
    },
  )
  .refine(
    (data) => {
      // advanceAmount and advanceDate must exist together
      const hasAdvanceAmount = data.advanceAmount > 0;
      const hasAdvanceDate = data.advanceDate != null;
      return hasAdvanceAmount === hasAdvanceDate;
    },
    {
      message: "Both advance amount and advance date must be provided together",
      path: ["advanceDate"],
    },
  )
  .refine(
    (data) => {
      // Refund amount must be > 0 if refund exists
      if (data.refund) {
        return data.refund.refundAmount > 0;
      }
      return true;
    },
    {
      message: "Refund amount must be greater than 0 when refund is provided",
      path: ["refund", "refundAmount"],
    },
  )
  .transform((data) => {
    // Auto-determine payment status
    let paymentStatus: "pending" | "advance" | "completed" = "pending";

    if (data.finalPaymentDate) {
      paymentStatus = "completed";
    } else if (data.advanceAmount > 0 && data.advanceDate) {
      paymentStatus = "advance";
    }

    return { ...data, paymentStatus };
  });

export const updatePartyPaymentSchema = z
  .object({
    partyId: z.string().uuid().optional(),
    freightAmount: z.coerce.number().min(0).optional(),
    advanceAmount: z.coerce.number().min(0).optional(),
    advanceDate: z.coerce.date().optional().nullable(),
    loadingCharge: z.coerce.number().min(0).optional(),
    unloadingCharge: z.coerce.number().min(0).optional(),
    damageCharge: z.coerce.number().min(0).optional(),
    tdsAmount: z.coerce.number().min(0).optional(),
    commissionAmount: z.coerce.number().min(0).optional(),
    extraChargesAmount: z.coerce.number().min(0).optional(),
    extraChargesType: ExtraChargeTypeEnum.optional().nullable(),
    finalPaymentDate: z.coerce.date().optional().nullable(),
  })
  .transform((data) => {
    // Auto-determine payment status if relevant fields present
    let paymentStatus: "pending" | "advance" | "completed" | undefined =
      undefined;

    if (data.finalPaymentDate !== undefined) {
      paymentStatus = data.finalPaymentDate ? "completed" : undefined;
    } else if (
      data.advanceAmount !== undefined &&
      data.advanceDate !== undefined
    ) {
      if (data.advanceAmount > 0 && data.advanceDate) {
        paymentStatus = "advance";
      } else if (data.advanceAmount === 0 && !data.advanceDate) {
        paymentStatus = "pending";
      }
    }

    return {
      ...data,
      ...(paymentStatus && { paymentStatus }),
    };
  });

export const createTripSchema = z.object({
  date: z.coerce.date(),
  truckNo: z
    .string()
    .min(1, "Truck number is required")
    .transform((val) => val.toUpperCase()),
  from: z.string().trim().min(1, "From location is required"),
  to: z.string().trim().min(1, "To location is required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  remarks: z.string().optional().nullable(),
  bilti: biltiInputSchema.optional(),
  materialPayment: partyPaymentInputSchema,
  truckPayment: partyPaymentInputSchema,
});

export const updateTripSchema = z.object({
  date: z.coerce.date().optional(),
  truckNo: z.string().min(1).optional(),
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
  weight: z.coerce.number().positive().optional(),
  remarks: z.string().optional().nullable(),
});

export const tripIdSchema = z.string().uuid("Invalid trip ID");

export const tripQuerySchema = z.object({
  search: z.string().optional(),
  truckNo: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  biltiStatus: BiltiStatusEnum.optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  materialPartyId: z.string().uuid().optional(),
  truckPartyId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Response Schemas
const biltiResponseSchema = z.object({
  id: z.string(),
  no: z.string(),
  status: BiltiStatusEnum,
  receivedDate: z.date().nullable(),
  submittedDate: z.date().nullable(),
  tripId: z.string(),
});

const partyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["material", "truck"]),
});

const partyPaymentResponseSchema = z.object({
  id: z.string(),
  partyId: z.string(),
  freightAmount: z.number(),
  advanceAmount: z.number(),
  advanceDate: z.date().nullable(),
  loadingCharge: z.number(),
  unloadingCharge: z.number(),
  damageCharge: z.number(),
  tdsAmount: z.number(),
  commissionAmount: z.number(),
  extraChargesAmount: z.number(),
  extraChargesType: ExtraChargeTypeEnum.nullable(),
  paymentStatus: PaymentStatusEnum,
  finalPaymentDate: z.date().nullable(),
  party: partyResponseSchema.optional(),
  refund: refundResponseSchema.nullable().optional(),
});

export const tripBaseSchema = z.object({
  id: z.string(),
  tripNo: z.number(),
  date: z.date(),
  truckNo: z.string(),
  from: z.string(),
  to: z.string(),
  weight: z.number(),
  remarks: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  bilti: biltiResponseSchema.nullable().optional(),
  materialPayment: partyPaymentResponseSchema.nullable().optional(),
  truckPayment: partyPaymentResponseSchema.nullable().optional(),
});

export const tripResponseSchema = apiResponseSchema.extend({
  trip: tripBaseSchema.optional(),
});

export const allTripResponseSchema = apiResponseSchema.extend({
  trips: z.array(tripBaseSchema).optional(),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    })
    .optional(),
});

export const locationsResponseSchema = apiResponseSchema.extend({
  locations: z
    .array(
      z.object({
        location: z.string(),
        type: z.enum(["from", "to"]),
      }),
    )
    .optional(),
});

// Type Exports
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type ExtraChargeType = z.infer<typeof ExtraChargeTypeEnum>;
export type BiltiStatus = z.infer<typeof BiltiStatusEnum>;

export type BiltiInput = z.infer<typeof biltiInputSchema>;
export type UpdateBilti = z.infer<typeof updateBiltiSchema>;

export type PartyPaymentInput = z.infer<typeof partyPaymentInputSchema>;
export type UpdatePartyPayment = z.infer<typeof updatePartyPaymentSchema>;

export type CreateTripType = z.infer<typeof createTripSchema>;
export type UpdateTripType = z.infer<typeof updateTripSchema>;
export type TripQueryType = z.infer<typeof tripQuerySchema>;

export type TripResponse = z.infer<typeof tripResponseSchema>;
export type AllTripResponse = z.infer<typeof allTripResponseSchema>;
export type LocationsResponse = z.infer<typeof locationsResponseSchema>;
