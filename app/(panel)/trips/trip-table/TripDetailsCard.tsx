import { AllTripResponse } from "@/validators";
import { formatDate } from "date-fns";
import { Truck } from "lucide-react";
import { DetailCard, DetailRow } from "./DetailComponents";

interface TripDetailsCardProps {
  trip: NonNullable<AllTripResponse["trips"]>[number];
  className?: string;
}

export function TripDetailsCard({ trip, className }: TripDetailsCardProps) {
  return (
    <DetailCard title="Trip Information" className={className} icon={Truck}>
      <DetailRow label="Truck Number" value={trip.truckNo} />
      <DetailRow label="From Location" value={trip.from} />
      <DetailRow label="To Location" value={trip.to} />
      <DetailRow label="Weight" value={`${trip.weight} Kg`} />
      <DetailRow
        label="Trip Date"
        value={formatDate(trip.date, "dd MMM yyyy")}
      />
      {trip.remarks && (
        <div className="pt-2 mt-2 border-t">
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            REMARKS
          </p>
          <p className="text-sm italic">{trip.remarks}</p>
        </div>
      )}
    </DetailCard>
  );
}
