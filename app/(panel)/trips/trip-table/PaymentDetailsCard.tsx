import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AllTripResponse } from "@/validators";
import { formatDate } from "date-fns";
import { IndianRupee } from "lucide-react";
import { DetailCard, DetailRow } from "./DetailComponents";

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

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

interface PaymentDetailsCardProps {
  trip: NonNullable<AllTripResponse["trips"]>[number];
  type: "Material" | "Truck";
}

export function PaymentDetailsCard({ trip, type }: PaymentDetailsCardProps) {
  const payment = type == "Material" ? trip.materialPayment : trip.truckPayment;
  if (!payment) return null;

  const rate = payment.freightAmount / trip.weight;
  const totalCharges =
    payment.loadingCharge +
    payment.unloadingCharge +
    payment.damageCharge +
    payment.extraChargesAmount;
  const totalDeductions = payment.tdsAmount + payment.commissionAmount;
  const netAmount = payment.freightAmount - (totalCharges + totalDeductions);
  const balanceAmount =
    netAmount - payment.advanceAmount - (payment.refund?.refundAmount || 0);

  return (
    <DetailCard title={`${type} Payment Details`} icon={IndianRupee}>
      {/* Party & Status */}
      <div className="bg-muted/50 rounded p-3 space-y-2">
        <DetailRow label="Party Name" value={payment.party?.name || "N/A"} />
        <DetailRow
          label="Payment Status"
          value={
            <Badge
              className={cn(
                "text-white cursor-default uppercase",
                getPaymentStatusColor(payment.paymentStatus),
              )}
            >
              {payment.paymentStatus}
            </Badge>
          }
        />
      </div>

      {/* Freight & Charges */}
      <div className="pt-2 border-t">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          FREIGHT & CHARGES
        </p>

        <DetailRow label="Weight" value={`${trip.weight} Kg`} />

        <DetailRow label="Rate" value={formatCurrency(rate)} />

        <DetailRow
          label="Freight Amount"
          value={formatCurrency(payment.freightAmount)}
          highlight
        />

        <DetailRow
          label="Loading Charge"
          value={formatCurrency(payment.loadingCharge)}
        />
        <DetailRow
          label="Unloading Charge"
          value={formatCurrency(payment.unloadingCharge)}
        />
        {payment.damageCharge > 0 && (
          <DetailRow
            label="Damage Charge"
            value={formatCurrency(payment.damageCharge)}
          />
        )}
        {payment.extraChargesAmount > 0 && (
          <>
            <DetailRow
              label="Extra Charges"
              value={formatCurrency(payment.extraChargesAmount)}
            />
            {payment.extraChargesType && (
              <DetailRow
                label="Type"
                value={payment.extraChargesType.replace("_", " ").toUpperCase()}
              />
            )}
          </>
        )}
      </div>

      {/* Deductions */}
      <div className="pt-2 border-t">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          DEDUCTIONS
        </p>
        <DetailRow
          label="TDS Amount"
          value={formatCurrency(payment.tdsAmount)}
        />
        <DetailRow
          label="Commission"
          value={formatCurrency(payment.commissionAmount)}
        />
      </div>

      {/* Payment Details */}
      <div className="pt-2 border-t">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          PAYMENT DETAILS
        </p>
        <DetailRow
          label="Net Payable"
          value={formatCurrency(netAmount)}
          highlight
        />
        {payment.advanceAmount > 0 && payment.advanceDate && (
          <>
            <DetailRow
              label="Advance Paid"
              value={formatCurrency(payment.advanceAmount)}
            />
            <DetailRow
              label="Advance Date"
              value={formatDate(payment.advanceDate, "dd MMM yyyy")}
            />
          </>
        )}
        {payment.refund && (
          <>
            <DetailRow
              label="Refund Amount"
              value={formatCurrency(payment.refund.refundAmount)}
            />
            <DetailRow
              label="Refund Date"
              value={formatDate(payment.refund.refundDate, "dd MMM yyyy")}
            />
          </>
        )}
        {payment.finalPaymentDate && (
          <DetailRow
            label="Final Payment Date"
            value={formatDate(payment.finalPaymentDate, "dd MMM yyyy")}
          />
        )}
        <div className="pt-2 mt-2 border-t">
          <DetailRow
            label="Balance Due"
            value={formatCurrency(balanceAmount)}
            highlight
          />
        </div>
      </div>
    </DetailCard>
  );
}
