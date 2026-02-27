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
import { useUpdateEmployee } from "@/query";
import { UpdateEmployeeType, updateEmployeeSchema } from "@/validators";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface Employee {
  id: string;
  firstName: string;
  lastName?: string | null;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  altPhone?: string | null;
}

interface EditEmployeeFormProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmployeeForm({
  employee,
  open,
  onOpenChange,
}: EditEmployeeFormProps) {
  const updateEmployee = useUpdateEmployee();

  const [form, setForm] = useState<UpdateEmployeeType>({
    firstName: employee.firstName,
    lastName: employee.lastName || "",
    designation: employee.designation || "",
    email: employee.email || "",
    phone: employee.phone || "",
    altPhone: employee.altPhone || "",
  });

  // Reset form when dialog opens (adjusting state during render)
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm({
        firstName: employee.firstName,
        lastName: employee.lastName || "",
        designation: employee.designation || "",
        email: employee.email || "",
        phone: employee.phone || "",
        altPhone: employee.altPhone || "",
      });
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validateAndSubmit = async () => {
    const validationResult = updateEmployeeSchema.safeParse(form);

    if (!validationResult.success) {
      return toast.warning(formatZodErrors(validationResult.error.issues));
    }

    try {
      const result = await updateEmployee.mutateAsync({
        id: employee.id,
        data: validationResult.data,
      });

      if (result.success) {
        toast.success(result.message || "Employee updated successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to update employee");
      }
    } catch (error) {
      toast.error("An error occurred while updating the employee");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] px-2">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update employee information</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[64vh] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <FormField label="First Name" htmlFor="firstName" required>
              <Input
                id="firstName"
                placeholder="First name"
                value={form.firstName || ""}
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
              disabled={updateEmployee.isPending}
            >
              {updateEmployee.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
