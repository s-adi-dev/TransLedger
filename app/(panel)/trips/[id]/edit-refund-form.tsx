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
import { capitalizeWord } from "@/lib/str";
import { formatZodErrors } from "@/lib/zod";
import { useAddRefund, useDeleteRefund, useUpdateRefund } from "@/query";
import {
  RefundInput,
  UpdateRefund,
  refundInputSchema,
  updateRefundSchema,
} from "@/validators";
import { Trash2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface Refund {
  id: string;
  refundAmount: number;
  refundDate: Date;
}

interface EditRefundFormProps {
  paymentId: string;
  refund: Refund | null | undefined;
  type: "material" | "truck";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRefundForm({
  paymentId,
  refund,
  type,
  open,
  onOpenChange,
}: EditRefundFormProps) {
  const addRefund = useAddRefund();
  const updateRefund = useUpdateRefund();
  const deleteRefund = useDeleteRefund();
  const isNew = !refund;

  const getInitialForm = () => ({
    refundAmount: refund?.refundAmount || 0,
    refundDate: refund?.refundDate ? new Date(refund.refundDate) : new Date(),
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
    if (isNew) {
      const validationResult = refundInputSchema.safeParse(form);
      if (!validationResult.success) {
        return toast.warning(formatZodErrors(validationResult.error.issues));
      }

      try {
        const result = await addRefund.mutateAsync({
          paymentId,
          data: validationResult.data as RefundInput,
        });
        if (result.success) {
          toast.success(result.message || "Refund added successfully!");
          onOpenChange(false);
        } else {
          toast.error(result.message || "Failed to add refund");
        }
      } catch (error) {
        toast.error("An error occurred while adding the refund");
        console.error(error);
      }
    } else {
      const validationResult = updateRefundSchema.safeParse(form);
      if (!validationResult.success) {
        return toast.warning(formatZodErrors(validationResult.error.issues));
      }

      try {
        const result = await updateRefund.mutateAsync({
          refundId: refund.id,
          data: validationResult.data as UpdateRefund,
        });
        if (result.success) {
          toast.success(result.message || "Refund updated successfully!");
          onOpenChange(false);
        } else {
          toast.error(result.message || "Failed to update refund");
        }
      } catch (error) {
        toast.error("An error occurred while updating the refund");
        console.error(error);
      }
    }
  };

  const handleDeleteRefund = async () => {
    if (!refund) return;
    try {
      const result = await deleteRefund.mutateAsync(refund.id);
      if (result.success) {
        toast.success(result.message || "Refund deleted successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to delete refund");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the refund");
      console.error(error);
    }
  };

  const isPending =
    addRefund.isPending || updateRefund.isPending || deleteRefund.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] px-2">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add Refund" : "Edit Refund"} — {capitalizeWord(type)}{" "}
            Payment
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? `Add a refund for the ${type} payment`
              : `Update refund details for the ${type} payment`}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 space-y-4 my-4">
          <FormField label="Refund Amount" htmlFor="refundAmount" required>
            <Input
              id="refundAmount"
              type="number"
              placeholder="Enter refund amount"
              value={form.refundAmount || ""}
              onChange={handleInputChange}
            />
          </FormField>

          <FormField label="Refund Date" htmlFor="refundDate" required>
            <DatePicker
              value={form.refundDate ? new Date(form.refundDate) : undefined}
              onChange={(date: Date | undefined) =>
                setForm((prev) => ({
                  ...prev,
                  refundDate: date || new Date(),
                }))
              }
            />
          </FormField>
        </div>

        <DialogFooter className="px-4 max-sm:gap-3">
          <div className="flex w-full items-center justify-between">
            {/* Delete button (only for existing refunds) */}
            <div>
              {!isNew && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Refund?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove the refund of ₹
                        {refund.refundAmount.toLocaleString("en-IN")} from this{" "}
                        {type} payment. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteRefund}
                        className="bg-destructive dark:text-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-2">
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
                disabled={isPending}
              >
                {isPending
                  ? "Saving..."
                  : isNew
                    ? "Add Refund"
                    : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
