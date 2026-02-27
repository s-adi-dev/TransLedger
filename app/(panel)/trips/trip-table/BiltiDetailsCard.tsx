import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AllTripResponse } from "@/validators";
import { formatDate } from "date-fns";
import { FileText } from "lucide-react";
import { DetailCard, DetailRow } from "./DetailComponents";

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

interface BiltiDetailsCardProps {
  bilti: NonNullable<AllTripResponse["trips"]>[number]["bilti"];
  className?: string;
}

export function BiltiDetailsCard({ bilti, className }: BiltiDetailsCardProps) {
  if (!bilti) return null;

  return (
    <DetailCard title="Bilti Information" icon={FileText} className={className}>
      <DetailRow label="Bilti Number" value={bilti.no} highlight />
      <DetailRow
        label="Status"
        value={
          <Badge
            className={cn(
              "text-white cursor-default uppercase",
              getBiltiStatusColor(bilti.status),
            )}
          >
            {bilti.status}
          </Badge>
        }
      />
      {bilti.receivedDate && (
        <DetailRow
          label="Received Date"
          value={formatDate(bilti.receivedDate, "dd MMM yyyy")}
        />
      )}
      {bilti.submittedDate && (
        <DetailRow
          label="Submitted Date"
          value={formatDate(bilti.submittedDate, "dd MMM yyyy")}
        />
      )}
    </DetailCard>
  );
}
