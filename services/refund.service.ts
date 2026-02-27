import { TRIP_INCLUDE_FULL } from "@/lib/prisma-includes";
import { prisma } from "@/lib/prisma";
import type {
  AllRefundsResponse,
  PartyType,
  RefundInput,
  RefundsByCompanyResponse,
  RefundTripsByDateResponse,
  TripResponse,
  UpdateRefund,
} from "@/validators";

export class RefundService {
  /** Fetch the full trip by ID (reusable within this service) */
  private async getFullTrip(tripId: string) {
    return prisma.trip.findUnique({
      where: { id: tripId },
      include: TRIP_INCLUDE_FULL,
    });
  }

  async getAllRefunds(): Promise<AllRefundsResponse> {
    try {
      const payments = await prisma.partyPaymentDetails.findMany({
        where: { refund: { isNot: null } },
        include: {
          refund: true,
          party: { select: { id: true, name: true, type: true } },
          materialTrip: true,
          truckTrip: true,
        },
      });

      const companyMap = new Map<
        string,
        { companyName: string; companyId: string; companyType: PartyType; refundCount: number; refundTotal: number }
      >();

      payments.forEach((payment) => {
        const { partyId: companyId, party } = payment;
        if (!companyMap.has(companyId)) {
          companyMap.set(companyId, {
            companyName: party.name,
            companyId,
            companyType: party.type,
            refundCount: 0,
            refundTotal: 0,
          });
        }
        const company = companyMap.get(companyId)!;
        if (payment.refund) {
          company.refundCount++;
          company.refundTotal += payment.refund.refundAmount;
        }
      });

      const companyIds = Array.from(companyMap.keys());
      const tripCounts = await Promise.all(
        companyIds.map(async (companyId) => ({
          companyId,
          count: await prisma.partyPaymentDetails.count({ where: { partyId: companyId } }),
        })),
      );

      const refunds = Array.from(companyMap.values()).map((company) => ({
        ...company,
        tripCount: tripCounts.find((tc) => tc.companyId === company.companyId)?.count || 0,
      }));

      return { success: true, message: "All refunds retrieved successfully", refunds };
    } catch (error) {
      console.error("Error in getAllRefunds:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve all refunds",
      };
    }
  }

  async getRefundsByCompany(companyId: string): Promise<RefundsByCompanyResponse> {
    try {
      const payments = await prisma.partyPaymentDetails.findMany({
        where: { partyId: companyId, refund: { isNot: null } },
        include: { refund: true, materialTrip: true, truckTrip: true },
      });

      const dateMap = new Map<string, { refundDate: Date; tripIds: Set<string>; refundAmt: number }>();

      payments.forEach((payment) => {
        if (!payment.refund) return;
        const refundDate = payment.refund.refundDate;
        const dateKey = refundDate.toISOString().split("T")[0];
        const tripId = payment.materialTripId || payment.truckTripId;

        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { refundDate, tripIds: new Set(), refundAmt: 0 });
        }
        const dateGroup = dateMap.get(dateKey)!;
        if (tripId) dateGroup.tripIds.add(tripId);
        dateGroup.refundAmt += payment.refund.refundAmount;
      });

      const refunds = Array.from(dateMap.values())
        .map((group) => ({
          refundDate: group.refundDate,
          tripCount: group.tripIds.size,
          refundAmt: group.refundAmt,
        }))
        .sort((a, b) => b.refundDate.getTime() - a.refundDate.getTime());

      return { success: true, message: "Refunds by company retrieved successfully", refunds };
    } catch (error) {
      console.error("Error in getRefundsByCompany:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve refunds by company",
      };
    }
  }

  async getRefundTripsByDate(companyId: string, date: Date): Promise<RefundTripsByDateResponse> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const trips = await prisma.trip.findMany({
        where: {
          OR: [
            { materialPayment: { partyId: companyId, refund: { refundDate: { gte: startOfDay, lte: endOfDay } } } },
            { truckPayment: { partyId: companyId, refund: { refundDate: { gte: startOfDay, lte: endOfDay } } } },
          ],
        },
        include: TRIP_INCLUDE_FULL,
        orderBy: { date: "desc" },
      });

      return { success: true, message: "Refund trips by date retrieved successfully", trips };
    } catch (error) {
      console.error("Error in getRefundTripsByDate:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve refund trips by date",
      };
    }
  }

  async addRefund(paymentId: string, data: RefundInput): Promise<TripResponse> {
    try {
      const payment = await prisma.partyPaymentDetails.findUnique({
        where: { id: paymentId },
        include: { refund: true },
      });

      if (!payment) {
        return { success: false, message: "Payment not found" };
      }
      if (payment.refund) {
        return { success: false, message: "Refund already exists for this payment. Use update instead." };
      }

      await prisma.refundDetails.create({ data: { ...data, paymentId } });

      const tripId = payment.materialTripId || payment.truckTripId;
      if (!tripId) {
        return { success: false, message: "Payment is not associated with any trip" };
      }

      const trip = await this.getFullTrip(tripId);
      return { success: true, message: "Refund added successfully", trip: trip! };
    } catch (error) {
      console.error("Error in addRefund:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add refund",
      };
    }
  }

  async updateRefund(refundId: string, data: UpdateRefund): Promise<TripResponse> {
    try {
      const refund = await prisma.refundDetails.findUnique({
        where: { id: refundId },
        include: { payment: true },
      });

      if (!refund) {
        return { success: false, message: "Refund not found" };
      }

      await prisma.refundDetails.update({ where: { id: refundId }, data });

      const tripId = refund.payment.materialTripId || refund.payment.truckTripId;
      if (!tripId) {
        return { success: false, message: "Payment is not associated with any trip" };
      }

      const trip = await this.getFullTrip(tripId);
      return { success: true, message: "Refund updated successfully", trip: trip! };
    } catch (error) {
      console.error("Error in updateRefund:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update refund",
      };
    }
  }

  async deleteRefund(refundId: string): Promise<TripResponse> {
    try {
      const refund = await prisma.refundDetails.findUnique({
        where: { id: refundId },
        include: { payment: true },
      });

      if (!refund) {
        return { success: false, message: "Refund not found" };
      }

      const tripId = refund.payment.materialTripId || refund.payment.truckTripId;
      if (!tripId) {
        return { success: false, message: "Payment is not associated with any trip" };
      }

      await prisma.refundDetails.delete({ where: { id: refundId } });

      const trip = await this.getFullTrip(tripId);
      return { success: true, message: "Refund deleted successfully", trip: trip! };
    } catch (error) {
      console.error("Error in deleteRefund:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete refund",
      };
    }
  }
}

export const refundService = new RefundService();
