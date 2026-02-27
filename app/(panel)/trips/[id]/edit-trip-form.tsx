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
import { Textarea } from "@/components/ui/textarea";
import { formatZodErrors } from "@/lib/zod";
import { useUpdateTrip } from "@/query";
import { UpdateTripType, updateTripSchema } from "@/validators";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface Trip {
  id: string;
  date: Date;
  truckNo: string;
  from: string;
  to: string;
  weight: number;
  remarks?: string | null;
}

interface EditTripFormProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTripForm({ trip, open, onOpenChange }: EditTripFormProps) {
  const updateTrip = useUpdateTrip();

  const [form, setForm] = useState<UpdateTripType>({
    date: new Date(trip.date),
    truckNo: trip.truckNo,
    from: trip.from,
    to: trip.to,
    weight: trip.weight,
    remarks: trip.remarks || "",
  });

  // Reset form when dialog opens
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm({
        date: new Date(trip.date),
        truckNo: trip.truckNo,
        from: trip.from,
        to: trip.to,
        weight: trip.weight,
        remarks: trip.remarks || "",
      });
    }
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value, type } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [id]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const validateAndSubmit = async () => {
    const validationResult = updateTripSchema.safeParse(form);

    if (!validationResult.success) {
      return toast.warning(formatZodErrors(validationResult.error.issues));
    }

    try {
      const result = await updateTrip.mutateAsync({
        id: trip.id,
        data: validationResult.data,
      });

      if (result.success) {
        toast.success(result.message || "Trip updated successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to update trip");
      }
    } catch (error) {
      toast.error("An error occurred while updating the trip");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] px-2">
        <DialogHeader>
          <DialogTitle>Edit Trip</DialogTitle>
          <DialogDescription>Update trip information</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[64vh] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <FormField label="Trip Date" htmlFor="date" required>
              <DatePicker
                value={form.date ? new Date(form.date) : undefined}
                onChange={(date: Date | undefined) =>
                  setForm((prev) => ({ ...prev, date: date || new Date() }))
                }
              />
            </FormField>

            <FormField label="Truck Number" htmlFor="truckNo" required>
              <Input
                id="truckNo"
                placeholder="e.g. MH12AB1234"
                value={form.truckNo || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="From" htmlFor="from" required>
              <Input
                id="from"
                placeholder="Origin location"
                value={form.from || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="To" htmlFor="to" required>
              <Input
                id="to"
                placeholder="Destination location"
                value={form.to || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Weight (Kg)" htmlFor="weight" required>
              <Input
                id="weight"
                type="number"
                placeholder="Weight in Kg"
                value={form.weight || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField
              label="Remarks"
              htmlFor="remarks"
              className="md:col-span-2"
            >
              <Textarea
                id="remarks"
                placeholder="Additional notes"
                rows={2}
                value={form.remarks || ""}
                onChange={handleInputChange}
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
              disabled={updateTrip.isPending}
            >
              {updateTrip.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
