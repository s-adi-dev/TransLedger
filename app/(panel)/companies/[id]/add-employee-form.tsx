"use client";

import { Button } from "@/components/ui/button";
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
import { useCreateEmployee } from "@/query";
import { CreateEmployeeType, createEmployeeSchema } from "@/validators";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

const getInitialFormState = (companyId: string): CreateEmployeeType => ({
  firstName: "",
  lastName: "",
  designation: "",
  email: "",
  phone: "",
  altPhone: "",
  companyId,
});

interface AddEmployeeFormProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeForm({
  companyId,
  open,
  onOpenChange,
}: AddEmployeeFormProps) {
  const createEmployee = useCreateEmployee();
  const [form, setForm] = useState<CreateEmployeeType>(
    getInitialFormState(companyId),
  );

  // Reset form when dialog opens (adjusting state during render)
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(getInitialFormState(companyId));
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validateAndSubmit = async () => {
    const validationResult = createEmployeeSchema.safeParse(form);

    if (!validationResult.success) {
      return toast.warning(formatZodErrors(validationResult.error.issues));
    }

    try {
      const result = await createEmployee.mutateAsync(validationResult.data);

      if (result.success) {
        toast.success(result.message || "Employee added successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to add employee");
      }
    } catch (error) {
      toast.error("An error occurred while adding the employee");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] px-2">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Add a new employee to this company
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[64vh] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <FormField label="First Name" htmlFor="firstName" required>
              <Input
                id="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Last Name" htmlFor="lastName">
              <Input
                id="lastName"
                placeholder="Last name"
                value={form.lastName || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Designation" htmlFor="designation">
              <Input
                id="designation"
                placeholder="Job title"
                value={form.designation || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={form.email || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Phone" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={form.phone || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Alternate Phone" htmlFor="altPhone">
              <Input
                id="altPhone"
                type="tel"
                placeholder="Alt. phone number"
                value={form.altPhone || ""}
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
              disabled={createEmployee.isPending}
            >
              {createEmployee.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
