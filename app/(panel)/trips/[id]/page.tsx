"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDeleteTrip, useTrip } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import { generateTripNo } from "@/validators";
import { formatDate } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Edit,
  FileText,
  IndianRupee,
  MapPin,
  Trash2,
  Truck,
  Weight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { EditBiltiForm } from "./edit-bilti-form";
import { EditPaymentForm } from "./edit-payment-form";
import { EditRefundForm } from "./edit-refund-form";
import { EditTripForm } from "./edit-trip-form";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

const getPaymentStatusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500 hover:bg-green-500 text-white";
    case "advance":
      return "bg-yellow-500 hover:bg-yellow-500 text-white";
    case "pending":
      return "bg-red-500 hover:bg-red-500 text-white";
    default:
      return "bg-gray-500 hover:bg-gray-500 text-white";
  }
};

const getBiltiStatusVariant = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-green-500 text-white";
    case "received":
      return "bg-blue-500 text-white";
    case "pending":
      return "bg-orange-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// ─── Detail Row Component ────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium",
          highlight && "text-primary font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

interface TripDetailProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailPage({ params }: TripDetailProps) {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useTrip(id);
  const deleteTrip = useDeleteTrip();

  const [editTripOpen, setEditTripOpen] = useState(false);
  const [editBiltiOpen, setEditBiltiOpen] = useState(false);
  const [editPaymentType, setEditPaymentType] = useState<
    "material" | "truck" | null
  >(null);
  const [editRefundType, setEditRefundType] = useState<
    "material" | "truck" | null
  >(null);

  useEffect(() => {
    const tripLabel = data?.trip
      ? generateTripNo(data.trip.tripNo)
      : "Trip Detail";
    setBreadcrumbs([{ label: "Trips", href: "/trips" }, { label: tripLabel }]);
  }, [setBreadcrumbs, data]);

  const handleDelete = async () => {
    try {
      const result = await deleteTrip.mutateAsync(id);
      if (result.success) {
        toast.success(result.message || "Trip deleted successfully!");
        router.push("/trips");
      } else {
        toast.error(result.message || "Failed to delete trip");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the trip");
      console.error(error);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="w-full mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // ─── Not Found State ─────────────────────────────────────────────────────

  if (!data?.trip) {
    return (
      <div className="w-full mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trip not found</h3>
              <p className="text-muted-foreground mb-6">
                The trip you&apos;re looking for doesn&apos;t exist
              </p>
              <Button onClick={() => router.push("/trips")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trips
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trip = data.trip;
  const materialPayment = trip.materialPayment;
  const truckPayment = trip.truckPayment;

  // ─── Payment calculations ────────────────────────────────────────────────

  const calcPayment = (payment: NonNullable<typeof materialPayment>) => {
    const rate = payment.freightAmount / trip.weight;
    const totalCharges =
      payment.loadingCharge +
      payment.unloadingCharge +
      payment.damageCharge +
      payment.extraChargesAmount;
    const totalDeductions = payment.tdsAmount + payment.commissionAmount;
    const netAmount = payment.freightAmount - totalDeductions + totalCharges;
    const balanceAmount =
      netAmount - payment.advanceAmount - (payment.refund?.refundAmount || 0);
    return { rate, totalCharges, totalDeductions, netAmount, balanceAmount };
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full mx-auto py-6 space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/trips")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {generateTripNo(trip.tripNo)}
            </h1>
            <p className="text-muted-foreground mt-1">
              Created on {formatDate(trip.createdAt, "dd MMM yyyy, hh:mm a")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setEditTripOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Trip
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  trip <strong>{generateTripNo(trip.tripNo)}</strong> and all
                  associated payment and bilti data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive dark:text-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ─── Trip Info & Bilti ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Information */}
        <Card>
          <div className="flex items-center gap-2 p-6 pb-4 border-b">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              Trip Information
            </h3>
          </div>
          <CardContent className="p-6 space-y-1">
            <DetailRow
              label="Trip Date"
              value={
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(trip.date, "dd MMM yyyy")}
                </span>
              }
            />
            <DetailRow
              label="Truck Number"
              value={
                <span className="font-semibold tracking-wide">
                  {trip.truckNo}
                </span>
              }
            />
            <DetailRow
              label="Route"
              value={
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {trip.from}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  {trip.to}
                </span>
              }
            />
            <DetailRow
              label="Weight"
              value={
                <span className="flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                  {trip.weight} Kg
                </span>
              }
            />
            {trip.remarks && (
              <div className="pt-3 mt-3 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  REMARKS
                </p>
                <p className="text-sm italic text-muted-foreground">
                  {trip.remarks}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bilti Information */}
        <Card>
          <div className="flex items-center justify-between p-6 pb-4 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Bilti Information
              </h3>
            </div>
            {trip.bilti && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditBiltiOpen(true)}
                className="gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
          <CardContent className="p-6">
            {trip.bilti ? (
              <div className="space-y-1">
                <DetailRow
                  label="Bilti Number"
                  value={trip.bilti.no}
                  highlight
                />
                <DetailRow
                  label="Status"
                  value={
                    <Badge
                      className={cn(
                        "cursor-default uppercase",
                        getBiltiStatusVariant(trip.bilti.status),
                      )}
                    >
                      {trip.bilti.status}
                    </Badge>
                  }
                />
                {trip.bilti.receivedDate && (
                  <DetailRow
                    label="Received Date"
                    value={formatDate(trip.bilti.receivedDate, "dd MMM yyyy")}
                  />
                )}
                {trip.bilti.submittedDate && (
                  <DetailRow
                    label="Submitted Date"
                    value={formatDate(trip.bilti.submittedDate, "dd MMM yyyy")}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No bilti added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setEditBiltiOpen(true)}
                >
                  Add Bilti
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Payment Details ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Payment */}
        {materialPayment && (
          <PaymentCard
            title="Material Payment"
            payment={materialPayment}
            weight={trip.weight}
            calc={calcPayment(materialPayment)}
            onEdit={() => setEditPaymentType("material")}
            onEditRefund={() => setEditRefundType("material")}
          />
        )}

        {/* Truck Payment */}
        {truckPayment && (
          <PaymentCard
            title="Truck Payment"
            payment={truckPayment}
            weight={trip.weight}
            calc={calcPayment(truckPayment)}
            onEdit={() => setEditPaymentType("truck")}
            onEditRefund={() => setEditRefundType("truck")}
          />
        )}
      </div>

      {/* ─── Edit Dialogs ────────────────────────────────────────────────── */}
      <EditTripForm
        trip={trip}
        open={editTripOpen}
        onOpenChange={setEditTripOpen}
      />
      <EditBiltiForm
        tripId={trip.id}
        bilti={trip.bilti}
        open={editBiltiOpen}
        onOpenChange={setEditBiltiOpen}
      />
      {editPaymentType && (
        <EditPaymentForm
          tripId={trip.id}
          payment={
            editPaymentType === "material" ? materialPayment! : truckPayment!
          }
          type={editPaymentType}
          open={!!editPaymentType}
          onOpenChange={(open: boolean) => {
            if (!open) setEditPaymentType(null);
          }}
        />
      )}
      {editRefundType && (
        <EditRefundForm
          paymentId={
            editRefundType === "material"
              ? materialPayment!.id
              : truckPayment!.id
          }
          refund={
            editRefundType === "material"
              ? (materialPayment?.refund ?? null)
              : (truckPayment?.refund ?? null)
          }
          type={editRefundType}
          open={!!editRefundType}
          onOpenChange={(open: boolean) => {
            if (!open) setEditRefundType(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Payment Card Sub-Component ──────────────────────────────────────────────

function PaymentCard({
  title,
  payment,
  weight,
  calc,
  onEdit,
  onEditRefund,
}: {
  title: string;
  payment: NonNullable<
    NonNullable<ReturnType<typeof useTrip>["data"]>["trip"]
  >["materialPayment"];
  weight: number;
  calc: {
    rate: number;
    totalCharges: number;
    totalDeductions: number;
    netAmount: number;
    balanceAmount: number;
  };
  onEdit: () => void;
  onEditRefund: () => void;
}) {
  if (!payment) return null;

  return (
    <Card>
      <div className="flex items-center justify-between p-6 pb-4 border-b">
        <div className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="gap-1.5"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
      <CardContent className="p-6 space-y-4">
        {/* Party & Status */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <DetailRow
            label="Party Name"
            value={payment.party?.name || "N/A"}
            highlight
          />
          <DetailRow
            label="Payment Status"
            value={
              <Badge
                className={cn(
                  "cursor-default uppercase",
                  getPaymentStatusVariant(payment.paymentStatus),
                )}
              >
                {payment.paymentStatus}
              </Badge>
            }
          />
        </div>

        {/* Freight & Charges */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            FREIGHT & CHARGES
          </p>
          <DetailRow label="Weight" value={`${weight} Kg`} />
          <DetailRow label="Rate" value={formatCurrency(calc.rate)} />
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
                  value={payment.extraChargesType
                    .replace("_", " ")
                    .toUpperCase()}
                />
              )}
            </>
          )}
        </div>

        {/* Deductions */}
        <div className="border-t pt-3 space-y-1">
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

        {/* Payment Summary */}
        <div className="border-t pt-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            PAYMENT DETAILS
          </p>
          <DetailRow
            label="Net Payable"
            value={formatCurrency(calc.netAmount)}
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
          {/* Refund Section */}
          <div className="border-t pt-3 mt-2 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">
                REFUND
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditRefund}
                className="gap-1 text-xs h-7 px-2"
              >
                <Edit className="h-3 w-3" />
                {payment.refund ? "Edit" : "Add"}
              </Button>
            </div>
            {payment.refund ? (
              <>
                <DetailRow
                  label="Refund Amount"
                  value={formatCurrency(payment.refund.refundAmount)}
                  highlight
                />
                <DetailRow
                  label="Refund Date"
                  value={formatDate(payment.refund.refundDate, "dd MMM yyyy")}
                />
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No refund added
              </p>
            )}
          </div>
          {payment.finalPaymentDate && (
            <DetailRow
              label="Final Payment"
              value={formatDate(payment.finalPaymentDate, "dd MMM yyyy")}
            />
          )}
          <div className="pt-2 mt-2 border-t">
            <DetailRow
              label="Balance Due"
              value={formatCurrency(calc.balanceAmount)}
              highlight
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
