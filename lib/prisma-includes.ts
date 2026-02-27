import { Prisma } from "@/generated/prisma";

/**
 * Shared Prisma include/select blocks to eliminate duplication
 */

// ─── Company Includes ────────────────────────────────────────────────────────

export const COMPANY_SELECT_BRIEF = {
  id: true,
  name: true,
  type: true,
} satisfies Prisma.CompanySelect;

export const COMPANY_INCLUDE_FULL = {
  employees: {
    orderBy: { createdAt: "desc" as const },
  },
  _count: {
    select: {
      employees: true,
      payments: true,
    },
  },
} satisfies Prisma.CompanyInclude;

export const COMPANY_INCLUDE_COUNT = {
  _count: {
    select: {
      employees: true,
      payments: true,
    },
  },
} satisfies Prisma.CompanyInclude;

// ─── Employee Includes ──────────────────────────────────────────────────────

export const EMPLOYEE_INCLUDE_COMPANY = {
  company: {
    select: COMPANY_SELECT_BRIEF,
  },
} satisfies Prisma.EmployeeInclude;

// ─── Trip Includes ──────────────────────────────────────────────────────────

const PARTY_PAYMENT_INCLUDE = {
  include: {
    party: {
      select: COMPANY_SELECT_BRIEF,
    },
    refund: true,
  },
} as const;

export const TRIP_INCLUDE_FULL = {
  bilti: true,
  materialPayment: PARTY_PAYMENT_INCLUDE,
  truckPayment: PARTY_PAYMENT_INCLUDE,
} satisfies Prisma.TripInclude;


