"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { capitalizeWord } from "@/lib/str";
import { formatZodErrors } from "@/lib/zod";
import { useUpdatePayment } from "@/query";
import {
  ExtraChargeType,
  UpdatePartyPayment,
  updatePartyPaymentSchema,
} from "@/validators";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface Payment {
  id: string;
  partyId: string;
  freightAmount: number;
  advanceAmount: number;
  advanceDate: Date | null;
  loadingCharge: number;
  unloadingCharge: number;
  damageCharge: number;
  tdsAmount: number;
  commissionAmount: number;
  extraChargesAmount: number;
  extraChargesType: ExtraChargeType | null;
  paymentStatus: string;
  finalPaymentDate: Date | null;
  party?: { id: string; name: string; type: string } | null;
}

interface EditPaymentFormProps {
  tripId: string;
  payment: Payment;
  type: "material" | "truck";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentForm({
  tripId,
  payment,
  type,
  open,
  onOpenChange,
}: EditPaymentFormProps) {
  const updatePayment = useUpdatePayment();

  const getInitialForm = (): UpdatePartyPayment => ({
    freightAmount: payment.freightAmount,
    advanceAmount: payment.advanceAmount,
    advanceDate: payment.advanceDate ? new Date(payment.advanceDate) : null,
    loadingCharge: payment.loadingCharge,
    unloadingCharge: payment.unloadingCharge,
    damageCharge: payment.damageCharge,
    tdsAmount: payment.tdsAmount,
    commissionAmount: payment.commissionAmount,
    extraChargesAmount: payment.extraChargesAmount,
    extraChargesType: payment.extraChargesType || null,
    finalPaymentDate: payment.finalPaymentDate
      ? new Date(payment.finalPaymentDate)
      : null,
  });

  const [form, setForm] = useState(getInitialForm());

  // Reset form when dialog opens
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(getInitialForm());
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type: inputType } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: inputType === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const validateAndSubmit = async () => {
    const validationResult = updatePartyPaymentSchema.safeParse(form);

    if (!validationResult.success) {
      return toast.warning(formatZodErrors(validationResult.error.issues));
    }

    try {
      const result = await updatePayment.mutateAsync({
        tripId,
        data: validationResult.data,
        type,
      });

      if (result.success) {
        toast.success(result.message || "Payment updated successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to update payment");
      }
    } catch (error) {
      toast.error("An error occurred while updating the payment");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] px-2">
        <DialogHeader>
          <DialogTitle>Edit {capitalizeWord(type)} Payment</DialogTitle>
          <DialogDescription>
            Update {type} payment details for this trip
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[64vh] px-4">
          <div className="space-y-4 my-4">
            {/* Party info (read-only) */}
            {payment.party && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Party</p>
                <p className="font-medium">{payment.party.name}</p>
              </div>
            )}

            {/* Freight & Charges */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Freight & Charges
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Freight Amount" htmlFor="freightAmount">
                <Input
                  id="freightAmount"
                  type="number"
                  placeholder="0"
                  value={form.freightAmount || ""}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Loading Charge" htmlFor="loadingCharge">
                <Input
                  id="loadingCharge"
                  type="number"
                  placeholder="0"
                  value={form.loadingCharge || ""}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Unloading Charge" htmlFor="unloadingCharge">
                <Input
                  id="unloadingCharge"
                  type="number"
                  placeholder="0"
                  value={form.unloadingCharge || ""}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Damage Charge" htmlFor="damageCharge">
                <Input
                  id="damageCharge"
                  type="number"
                  placeholder="0"
                  value={form.damageCharge || ""}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Extra Charges" htmlFor="extraChargesAmount">
                <Input
                  id="extraChargesAmount"
                  type="number"
                  placeholder="0"
                  value={form.extraChargesAmount || ""}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Extra Charge Type" htmlFor="extraChargesType">
                <Select
                  value={form.extraChargesType || ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      extraChargesType: (value || null) as ExtraChargeType | null,
                    }))
                  }
                >
                  <SelectTrigger id="extraChargesType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="late_delivery">Late Delivery</SelectItem>
                    <SelectItem value="detention">Detention</SelectItem>
                    <SelectItem value="extra_loading">Extra Loading</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Deductions */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">
              Deductions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="TDS Amount" htmlFor="tdsAmount">
                <Input
                  id="tdsAmount"
                  type="number"
                  placeholder="0"
                  value={form.tdsAmount || ""}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Commission" htmlFor="commissionAmount">
                <Input
                  id="commissionAmount"
                  type="number"
                  placeholder="0"
                  value={form.commissionAmount || ""}
                  onChange={handleInputChange}
                />
              </FormField>
            </div>

            {/* Payment Details */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">
              Payment Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Advance Amount" htmlFor="advanceAmount">
                <Input
                  id="advanceAmount"
                  type="number"
                  placeholder="0"
                  value={form.advanceAmount || ""}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField label="Advance Date" htmlFor="advanceDate">
                <DatePicker
                  value={
                    form.advanceDate ? new Date(form.advanceDate) : undefined
                  }
                  onChange={(date: Date | undefined) =>
                    setForm((prev) => ({
                      ...prev,
                      advanceDate: date || null,
                    }))
                  }
                />
              </FormField>

              <FormField
                label="Final Payment Date"
                htmlFor="finalPaymentDate"
                className="md:col-span-2"
              >
                <DatePicker
                  value={
                    form.finalPaymentDate
                      ? new Date(form.finalPaymentDate)
                      : undefined
                  }
                  onChange={(date: Date | undefined) =>
                    setForm((prev) => ({
                      ...prev,
                      finalPaymentDate: date || null,
                    }))
                  }
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="max-sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={validateAndSubmit}
              disabled={updatePayment.isPending}
            >
              {updatePayment.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
