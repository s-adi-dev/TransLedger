"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatZodErrors } from "@/lib/zod";
import { useCreateCompany } from "@/query/use-company";
import {
  CreateCompanyType,
  createCompanySchema,
} from "@/validators/company.schema";
import { Building2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { EmployeeSection } from "./employee-section";

const getInitialFormState = (): CreateCompanyType => ({
  name: "",
  type: "material",
  address: "",
  phone: "",
  email: "",
  note: "",
  employees: [],
});

export default function CompanyForm() {
  const createCompany = useCreateCompany();
  const [form, setForm] = useState<CreateCompanyType>(getInitialFormState());

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFieldUpdate = <K extends keyof CreateCompanyType>(
    field: K,
    value: CreateCompanyType[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setForm(getInitialFormState());
  };

  const validateAndSubmit = async () => {
    const validationResult = createCompanySchema.safeParse(form);

    if (!validationResult.success) {
      return toast.warning(formatZodErrors(validationResult.error.issues));
    }

    try {
      const result = await createCompany.mutateAsync(validationResult.data);

      if (result.success) {
        toast.success(result.message || "Company created successfully!");
        handleReset();
      } else {
        toast.error(result.message || "Failed to create company");
      }
    } catch (error) {
      toast.error("An error occurred while creating the company");
      console.error(error);
    }
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Form
        </CardTitle>
        <CardDescription>Enter company and employee details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Company Details Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Company Name" htmlFor="name" required>
                  <Input
                    id="name"
                    placeholder="Enter company name"
                    value={form.name}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField label="Company Type" htmlFor="type" required>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      handleFieldUpdate(
                        "type",
                        value as CreateCompanyType["type"],
                      )
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

                <FormField
                  label="Notes"
                  htmlFor="note"
                  className="md:col-span-2"
                >
                  <Textarea
                    id="note"
                    placeholder="Additional notes or comments"
                    rows={3}
                    value={form.note || ""}
                    onChange={handleInputChange}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employees Section */}
          <EmployeeSection
            employees={form.employees || []}
            onEmployeesChange={(employees) =>
              handleFieldUpdate("employees", employees)
            }
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={createCompany.isPending}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={validateAndSubmit}
              disabled={createCompany.isPending}
            >
              {createCompany.isPending ? "Saving..." : "Save Company"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
