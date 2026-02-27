import { Prisma } from "@/generated/prisma";
import { TRIP_INCLUDE_FULL } from "@/lib/prisma-includes";
import { prisma } from "@/lib/prisma";
import { capitalizeWord } from "@/lib/str";
import type {
  AllTripResponse,
  BiltiInput,
  CreateTripType,
  LocationsResponse,
  PartyType,
  TripQueryType,
  TripResponse,
  UpdateBilti,
  UpdatePartyPayment,
  UpdateTripType,
} from "@/validators";

export class TripService {
  async getTripById(id: string): Promise<TripResponse> {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
        include: TRIP_INCLUDE_FULL,
      });

      if (!trip) {
        return { success: false, message: "Trip not found" };
      }

      return { success: true, message: "Trip retrieved successfully", trip };
    } catch (error) {
      console.error("Error in getTripById:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve trip",
      };
    }
  }

  async getAllTrips(params: TripQueryType): Promise<AllTripResponse> {
    try {
      const {
        search, truckNo, from, to, dateFrom, dateTo,
        biltiStatus, paymentStatus, materialPartyId, truckPartyId,
        page, limit,
      } = params;

      const where: Prisma.TripWhereInput = {};

      if (search) {
        where.OR = [
          { truckNo: { contains: search } },
          { from: { contains: search } },
          { to: { contains: search } },
        ];
      }
      if (truckNo) where.truckNo = { contains: truckNo };
      if (from) where.from = { contains: from };
      if (to) where.to = { contains: to };

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          where.date.gte = fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          where.date.lte = toDate;
        }
      }

      if (biltiStatus) {
        where.bilti = { status: biltiStatus };
      }

      if (materialPartyId) {
        where.materialPayment = {
          ...(where.materialPayment as object),
          partyId: materialPartyId,
        };
      }

      if (truckPartyId) {
        where.truckPayment = {
          ...(where.truckPayment as object),
          partyId: truckPartyId,
        };
      }

      if (paymentStatus) {
        where.OR = [
          { materialPayment: { paymentStatus } },
          { truckPayment: { paymentStatus } },
        ];
      }

      const skip = (page - 1) * limit;
      const total = await prisma.trip.count({ where });

      const trips = await prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: TRIP_INCLUDE_FULL,
        orderBy: { date: "desc" },
      });

      return {
        success: true,
        message: "Trips retrieved successfully",
        trips,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error("Error in getAllTrips:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve trips",
      };
    }
  }

  async createTrip(data: CreateTripType): Promise<TripResponse> {
    try {
      const { bilti, materialPayment, truckPayment, ...tripData } = data;

      const last = await prisma.trip.findFirst({
        orderBy: { tripNo: "desc" },
        select: { tripNo: true },
      });
      const nextTripNo = (last?.tripNo ?? 0) + 1;

      const { refund: materialRefund, ...materialPaymentData } = materialPayment || {};
      const { refund: truckRefund, ...truckPaymentData } = truckPayment || {};

      const trip = await prisma.trip.create({
        data: {
          tripNo: nextTripNo,
          ...tripData,
          ...(bilti && { bilti: { create: bilti } }),
          materialPayment: {
            create: {
              ...materialPaymentData,
              ...(materialRefund && { refund: { create: materialRefund } }),
            },
          },
          truckPayment: {
            create: {
              ...truckPaymentData,
              ...(truckRefund && { refund: { create: truckRefund } }),
            },
          },
        },
        include: TRIP_INCLUDE_FULL,
      });

      return { success: true, message: "Trip created successfully", trip };
    } catch (error) {
      console.error("Error in createTrip:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create trip",
      };
    }
  }

  async updateTrip(id: string, data: UpdateTripType): Promise<TripResponse> {
    try {
      const existing = await this.getTripById(id);
      if (!existing.trip) {
        return { success: false, message: "Trip does not exist" };
      }

      const trip = await prisma.trip.update({
        where: { id },
        data,
        include: TRIP_INCLUDE_FULL,
      });

      return { success: true, message: "Trip updated successfully", trip };
    } catch (error) {
      console.error("Error in updateTrip:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update trip",
      };
    }
  }

  async deleteTrip(id: string): Promise<TripResponse> {
    try {
      const existing = await this.getTripById(id);
      if (!existing.trip) {
        return { success: false, message: "Trip does not exist" };
      }

      await prisma.trip.delete({ where: { id } });

      return { success: true, message: "Trip deleted successfully" };
    } catch (error) {
      console.error("Error in deleteTrip:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete trip",
      };
    }
  }

  async addBilti(tripId: string, data: BiltiInput): Promise<TripResponse> {
    try {
      const existing = await this.getTripById(tripId);
      if (!existing.trip) {
        return { success: false, message: "Trip does not exist" };
      }
      if (existing.trip.bilti) {
        return { success: false, message: "Bilti already exists for this trip. Use update instead." };
      }

      await prisma.bilti.create({ data: { ...data, tripId } });

      return await this.getTripById(tripId);
    } catch (error) {
      console.error("Error in addBilti:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add bilti",
      };
    }
  }

  async updateBilti(tripId: string, data: UpdateBilti): Promise<TripResponse> {
    try {
      const existing = await this.getTripById(tripId);
      if (!existing.trip) {
        return { success: false, message: "Trip does not exist" };
      }
      if (!existing.trip.bilti) {
        return { success: false, message: "Bilti does not exist for this trip" };
      }

      await prisma.bilti.update({ where: { tripId }, data });

      return await this.getTripById(tripId);
    } catch (error) {
      console.error("Error in updateBilti:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update bilti",
      };
    }
  }

  async updateTripPayment(
    tripId: string,
    data: UpdatePartyPayment,
    paymentType: PartyType,
  ): Promise<TripResponse> {
    try {
      const existing = await this.getTripById(tripId);
      if (!existing.trip) {
        return { success: false, message: "Trip does not exist" };
      }

      const payment = paymentType === "material"
        ? existing.trip.materialPayment
        : existing.trip.truckPayment;

      if (!payment) {
        return {
          success: false,
          message: `${capitalizeWord(paymentType)} payment does not exist to update`,
        };
      }

      await prisma.partyPaymentDetails.update({ where: { id: payment.id }, data });

      return await this.getTripById(tripId);
    } catch (error) {
      console.error("Error in updateTripPayment:", error);
      return {
        success: false,
        message: error instanceof Error
          ? error.message
          : `Failed to update ${capitalizeWord(paymentType)} payment`,
      };
    }
  }

  async getUniqueLocations(): Promise<LocationsResponse> {
    try {
      const trips = await prisma.trip.findMany({
        select: { from: true, to: true },
      });

      const locationMap = new Map<string, { location: string; type: "from" | "to" }>();

      trips.forEach((trip) => {
        const fromKey = `${trip.from}-from`;
        if (!locationMap.has(fromKey)) {
          locationMap.set(fromKey, { location: trip.from, type: "from" });
        }
        const toKey = `${trip.to}-to`;
        if (!locationMap.has(toKey)) {
          locationMap.set(toKey, { location: trip.to, type: "to" });
        }
      });

      return {
        success: true,
        message: "Unique locations retrieved successfully",
        locations: Array.from(locationMap.values()),
      };
    } catch (error) {
      console.error("Error in getUniqueLocations:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve unique locations",
      };
    }
  }
}

export const tripService = new TripService();
