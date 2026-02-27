import { TRIP_INCLUDE_FULL } from "@/lib/prisma-includes";
import { prisma } from "@/lib/prisma";
import type {
  AllPaymentsResponse,
  PartyType,
  PaymentsByCompanyResponse,
  PaymentTripsByDateResponse,
} from "@/validators";

export class PaymentService {
  /**
   * Get all payments grouped by company with advance and balance totals
   */
  async getAllPayments(): Promise<AllPaymentsResponse> {
    try {
      const payments = await prisma.partyPaymentDetails.findMany({
        where: {
          OR: [
            { paymentStatus: "advance" },
            { paymentStatus: "completed" },
          ],
        },
        include: {
          party: { select: { id: true, name: true, type: true } },
        },
      });

      const companyMap = new Map<
        string,
        {
          companyName: string;
          companyId: string;
          companyType: PartyType;
          tripCount: number;
          advanceCount: number;
          advanceTotal: number;
          balanceCount: number;
          balanceTotal: number;
        }
      >();

      payments.forEach((payment) => {
        const { partyId: companyId, party } = payment;

        if (!companyMap.has(companyId)) {
          companyMap.set(companyId, {
            companyName: party.name,
            companyId,
            companyType: party.type as PartyType,
            tripCount: 0,
            advanceCount: 0,
            advanceTotal: 0,
            balanceCount: 0,
            balanceTotal: 0,
          });
        }

        const company = companyMap.get(companyId)!;
        company.tripCount++;

        // Count advance payments
        if (payment.advanceAmount > 0 && payment.advanceDate) {
          company.advanceCount++;
          company.advanceTotal += payment.advanceAmount;
        }

        // Count balance/completed payments
        if (payment.paymentStatus === "completed" && payment.finalPaymentDate) {
          company.balanceCount++;
          company.balanceTotal += payment.freightAmount - payment.advanceAmount;
        }
      });

      const result = Array.from(companyMap.values());

      return {
        success: true,
        message: "All payments retrieved successfully",
        payments: result,
      };
    } catch (error) {
      console.error("Error in getAllPayments:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve all payments",
      };
    }
  }

  /**
   * Get payments for a company grouped by date, split into advance and balance
   */
  async getPaymentsByCompany(
    companyId: string,
  ): Promise<PaymentsByCompanyResponse> {
    try {
      const payments = await prisma.partyPaymentDetails.findMany({
        where: {
          partyId: companyId,
          OR: [
            { paymentStatus: "advance" },
            { paymentStatus: "completed" },
          ],
        },
        include: {
          materialTrip: true,
          truckTrip: true,
        },
      });

      // Group advance payments by advanceDate
      const advanceDateMap = new Map<
        string,
        { date: Date; tripIds: Set<string>; totalAmount: number }
      >();

      // Group balance payments by finalPaymentDate
      const balanceDateMap = new Map<
        string,
        { date: Date; tripIds: Set<string>; totalAmount: number }
      >();

      payments.forEach((payment) => {
        const tripId = payment.materialTripId || payment.truckTripId;

        // Advance payment grouping
        if (payment.advanceAmount > 0 && payment.advanceDate) {
          const dateKey = payment.advanceDate.toISOString().split("T")[0];
          if (!advanceDateMap.has(dateKey)) {
            advanceDateMap.set(dateKey, {
              date: payment.advanceDate,
              tripIds: new Set(),
              totalAmount: 0,
            });
          }
          const group = advanceDateMap.get(dateKey)!;
          if (tripId) group.tripIds.add(tripId);
          group.totalAmount += payment.advanceAmount;
        }

        // Balance/completed payment grouping
        if (
          payment.paymentStatus === "completed" &&
          payment.finalPaymentDate
        ) {
          const dateKey = payment.finalPaymentDate.toISOString().split("T")[0];
          if (!balanceDateMap.has(dateKey)) {
            balanceDateMap.set(dateKey, {
              date: payment.finalPaymentDate,
              tripIds: new Set(),
              totalAmount: 0,
            });
          }
          const group = balanceDateMap.get(dateKey)!;
          if (tripId) group.tripIds.add(tripId);
          group.totalAmount += payment.freightAmount - payment.advanceAmount;
        }
      });

      const advancePayments = Array.from(advanceDateMap.values())
        .map((group) => ({
          date: group.date,
          tripCount: group.tripIds.size,
          totalAmount: group.totalAmount,
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      const balancePayments = Array.from(balanceDateMap.values())
        .map((group) => ({
          date: group.date,
          tripCount: group.tripIds.size,
          totalAmount: group.totalAmount,
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      return {
        success: true,
        message: "Payments by company retrieved successfully",
        advancePayments,
        balancePayments,
      };
    } catch (error) {
      console.error("Error in getPaymentsByCompany:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve payments by company",
      };
    }
  }

  /**
   * Get trips for a company on a specific date filtered by payment type (advance or balance)
   */
  async getPaymentTripsByDate(
    companyId: string,
    type: "advance" | "balance",
    date: Date,
  ): Promise<PaymentTripsByDateResponse> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dateFilter =
        type === "advance"
          ? { advanceDate: { gte: startOfDay, lte: endOfDay } }
          : { finalPaymentDate: { gte: startOfDay, lte: endOfDay } };

      const trips = await prisma.trip.findMany({
        where: {
          OR: [
            {
              materialPayment: {
                partyId: companyId,
                ...dateFilter,
              },
            },
            {
              truckPayment: {
                partyId: companyId,
                ...dateFilter,
              },
            },
          ],
        },
        include: TRIP_INCLUDE_FULL,
        orderBy: { date: "desc" },
      });

      return {
        success: true,
        message: "Payment trips by date retrieved successfully",
        trips,
      };
    } catch (error) {
      console.error("Error in getPaymentTripsByDate:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve payment trips by date",
      };
    }
  }
}

export const paymentService = new PaymentService();
