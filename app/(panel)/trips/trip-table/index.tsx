import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollapsibleTable } from "@/hooks/use-collapsible-table";
import { cn } from "@/lib/utils";
import { AllTripResponse, generateTripNo } from "@/validators";
import { formatDate } from "date-fns";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  MapPin,
  Truck,
} from "lucide-react";
import React from "react";
import { BiltiDetailsCard } from "./BiltiDetailsCard";
import { PaymentDetailsCard } from "./PaymentDetailsCard";
import { TripDetailsCard } from "./TripDetailsCard";

interface TripsTableProps {
  trips: NonNullable<AllTripResponse["trips"]>;
  onViewDetails?: (tripId: string) => void;
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500 hover:bg-green-500";
    case "advance":
      return "bg-yellow-500 hover:bg-yellow-500";
    case "pending":
      return "bg-red-500 hover:bg-red-500";
    default:
      return "bg-gray-500 hover:bg-gray-500";
  }
};

const getBiltiStatusColor = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-green-500";
    case "received":
      return "bg-blue-500";
    case "pending":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

export const TripsTable = ({ trips, onViewDetails }: TripsTableProps) => {
  const { toggleItem, isOpen, setContentRef, getExpandableStyle } =
    useCollapsibleTable(trips);

  if (!trips.length) {
    return (
      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-card">
              <TableHead>Trip No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Truck No</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Material Party</TableHead>
              <TableHead>Truck Party</TableHead>
              <TableHead>Bilti Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                No Trip Data
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead>Trip No</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Truck No</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Material Party</TableHead>
            <TableHead>Truck Party</TableHead>
            <TableHead>Bilti</TableHead>
            <TableHead>Payment Status</TableHead>
            {onViewDetails && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => {
            const tripId = trip.id;
            const open = isOpen(tripId);
            const materialPayment = trip.materialPayment;
            const truckPayment = trip.truckPayment;

            return (
              <React.Fragment key={tripId}>
                <TableRow
                  className={`cursor-pointer transition-colors duration-200 ${
                    open ? "bg-muted/30" : ""
                  }`}
                  onClick={() => toggleItem(tripId)}
                >
                  <TableCell className="font-medium">
                    {generateTripNo(trip.tripNo)}
                  </TableCell>

                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(trip.date, "dd-MM-yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      {trip.truckNo}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{trip.from}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{trip.to}</span>
                    </div>
                  </TableCell>
                  <TableCell>{materialPayment?.party?.name || "N/A"}</TableCell>
                  <TableCell>{truckPayment?.party?.name || "N/A"}</TableCell>
                  <TableCell>
                    {trip.bilti ? (
                      <Badge
                        className={cn(
                          "text-white cursor-default uppercase",
                          getBiltiStatusColor(trip.bilti.status),
                        )}
                      >
                        {trip.bilti.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No Bilti
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {materialPayment && (
                        <Badge
                          className={cn(
                            "text-white whitespace-nowrap cursor-default uppercase",
                            getPaymentStatusColor(
                              materialPayment.paymentStatus,
                            ),
                          )}
                        >
                          M: {materialPayment.paymentStatus}
                        </Badge>
                      )}
                      {truckPayment && (
                        <Badge
                          className={cn(
                            "text-white whitespace-nowrap cursor-default uppercase",
                            getPaymentStatusColor(truckPayment.paymentStatus),
                          )}
                        >
                          T: {truckPayment.paymentStatus}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {onViewDetails && (
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(trip.id);
                        }}
                      >
                        <ChevronRight />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>

                {/* Expandable Content */}
                <TableRow className="expandable-row">
                  <TableCell
                    colSpan={onViewDetails ? 9 : 8}
                    className="p-0 border-b border-t-0"
                  >
                    <div style={getExpandableStyle(tripId)}>
                      <div
                        ref={(e) => setContentRef(tripId, e)}
                        className="p-6 bg-muted/30"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {/* Trip & Bilti Details */}
                          <div className="max-xl:col-span-2 flex xl:flex-col gap-6">
                            <TripDetailsCard trip={trip} className="flex-1" />
                            <BiltiDetailsCard
                              bilti={trip.bilti}
                              className="flex-1"
                            />
                          </div>

                          {/* Material Payment Details */}
                          {materialPayment && (
                            <PaymentDetailsCard trip={trip} type="Material" />
                          )}

                          {/* Truck Payment Details */}
                          {truckPayment && (
                            <PaymentDetailsCard trip={trip} type="Truck" />
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
