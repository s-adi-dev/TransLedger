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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatZodErrors } from "@/lib/zod";
import { useUpdateCompany } from "@/query";
import { UpdateCompanyType, updateCompanySchema } from "@/validators";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  type: "material" | "truck";
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
}

interface EditCompanyFormProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCompanyForm({
  company,
  open,
  onOpenChange,
}: EditCompanyFormProps) {
  const updateCompany = useUpdateCompany();

  const [form, setForm] = useState<UpdateCompanyType>({
    name: company.name,
    type: company.type,
    address: company.address || "",
    phone: company.phone || "",
    email: company.email || "",
    note: company.note || "",
  });

  // Reset form when dialog opens (adjusting state during render)
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm({
        name: company.name,
        type: company.type,
        address: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
        note: company.note || "",
      });
    }
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFieldUpdate = <K extends keyof UpdateCompanyType>(
    field: K,
    value: UpdateCompanyType[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateAndSubmit = async () => {
    const validationResult = updateCompanySchema.safeParse(form);

    if (!validationResult.success) {
      return toast.warning(formatZodErrors(validationResult.error.issues));
    }

    try {
      const result = await updateCompany.mutateAsync({
        id: company.id,
        data: validationResult.data,
      });

      if (result.success) {
        toast.success(result.message || "Company updated successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to update company");
      }
    } catch (error) {
      toast.error("An error occurred while updating the company");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] px-2">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>Update company information</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[64vh] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <FormField label="Company Name" htmlFor="name" required>
              <Input
                id="name"
                placeholder="Enter company name"
                value={form.name || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Company Type" htmlFor="type" required>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  handleFieldUpdate("type", value as UpdateCompanyType["type"])
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Phone" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={form.email || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField
              label="Address"
              htmlFor="address"
              className="md:col-span-2"
            >
              <Textarea
                id="address"
                placeholder="Enter company address"
                rows={2}
                value={form.address || ""}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Notes" htmlFor="note" className="md:col-span-2">
              <Textarea
                id="note"
                placeholder="Additional notes or comments"
                rows={3}
                value={form.note || ""}
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
              disabled={updateCompany.isPending}
            >
              {updateCompany.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
