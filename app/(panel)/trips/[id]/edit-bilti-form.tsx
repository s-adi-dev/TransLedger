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
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatZodErrors } from "@/lib/zod";
import { useAddBilti, useUpdateBilti } from "@/query";
import {
  BiltiInput,
  UpdateBilti,
  biltiInputSchema,
  updateBiltiSchema,
} from "@/validators";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface Bilti {
  id: string;
  no: string;
  status: "pending" | "received" | "submitted";
  receivedDate: Date | null;
  submittedDate: Date | null;
}

interface EditBiltiFormProps {
  tripId: string;
  bilti: Bilti | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBiltiForm({
  tripId,
  bilti,
  open,
  onOpenChange,
}: EditBiltiFormProps) {
  const addBilti = useAddBilti();
  const updateBilti = useUpdateBilti();
  const isNew = !bilti;

  const getInitialForm = () => ({
    no: bilti?.no || "",
    receivedDate: bilti?.receivedDate ? new Date(bilti.receivedDate) : null,
    submittedDate: bilti?.submittedDate ? new Date(bilti.submittedDate) : null,
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
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validateAndSubmit = async () => {
    if (isNew) {
      const validationResult = biltiInputSchema.safeParse(form);
      if (!validationResult.success) {
        return toast.warning(formatZodErrors(validationResult.error.issues));
      }

      try {
        const result = await addBilti.mutateAsync({
          tripId,
          data: validationResult.data as BiltiInput,
        });
        if (result.success) {
          toast.success(result.message || "Bilti added successfully!");
          onOpenChange(false);
        } else {
          toast.error(result.message || "Failed to add bilti");
        }
      } catch (error) {
        toast.error("An error occurred while adding the bilti");
        console.error(error);
      }
    } else {
      const validationResult = updateBiltiSchema.safeParse(form);
      if (!validationResult.success) {
        return toast.warning(formatZodErrors(validationResult.error.issues));
      }

      try {
        const result = await updateBilti.mutateAsync({
          tripId,
          data: validationResult.data as UpdateBilti,
        });
        if (result.success) {
          toast.success(result.message || "Bilti updated successfully!");
          onOpenChange(false);
        } else {
          toast.error(result.message || "Failed to update bilti");
        }
      } catch (error) {
        toast.error("An error occurred while updating the bilti");
        console.error(error);
      }
    }
  };

  const isPending = addBilti.isPending || updateBilti.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] px-2">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add Bilti" : "Edit Bilti"}</DialogTitle>
          <DialogDescription>
            {isNew
              ? "Add bilti information for this trip"
              : "Update bilti information"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[64vh] px-4">
          <div className="grid grid-cols-1 gap-4 my-4">
            <FormField label="Bilti Number" htmlFor="no" required>
              <Input
                id="no"
                placeholder="Enter bilti number"
                value={form.no}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Received Date" htmlFor="receivedDate">
              <DatePicker
                value={
                  form.receivedDate ? new Date(form.receivedDate) : undefined
                }
                onChange={(date: Date | undefined) =>
                  setForm((prev) => ({
                    ...prev,
                    receivedDate: date || null,
                  }))
                }
              />
            </FormField>

            <FormField label="Submitted Date" htmlFor="submittedDate">
              <DatePicker
                value={
                  form.submittedDate ? new Date(form.submittedDate) : undefined
                }
                onChange={(date: Date | undefined) =>
                  setForm((prev) => ({
                    ...prev,
                    submittedDate: date || null,
                  }))
                }
              />
            </FormField>
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
              disabled={isPending}
            >
              {isPending
                ? "Saving..."
                : isNew
                  ? "Add Bilti"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
