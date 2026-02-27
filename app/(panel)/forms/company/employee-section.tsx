import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { EmployeeInput } from "@/validators";
import { Trash2, UserPlus } from "lucide-react";
import { ChangeEvent } from "react";

const getEmptyEmployee = (): EmployeeInput => ({
  firstName: "",
  lastName: "",
  designation: "",
  email: "",
  phone: "",
  altPhone: "",
});

interface EmployeeSectionProps {
  employees: EmployeeInput[];
  onEmployeesChange: (employees: EmployeeInput[]) => void;
}

export function EmployeeSection({
  employees,
  onEmployeesChange,
}: EmployeeSectionProps) {
  const addEmployee = () => {
    onEmployeesChange([...employees, getEmptyEmployee()]);
  };

  const removeEmployee = (index: number) => {
    onEmployeesChange(employees.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof EmployeeInput,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const updated = [...employees];
    updated[index] = { ...updated[index], [field]: e.target.value };
    onEmployeesChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Employee Details</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEmployee}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="space-y-6">
        {employees.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No employees added yet</p>
                <p className="text-xs mt-1">
                  {'Click "Add Employee" to get started'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          employees.map((employee, index) => (
            <Card key={index} className="border-muted">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Employee {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmployee(index)}
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="First Name"
                      htmlFor={`emp-${index}-firstName`}
                      required
                    >
                      <Input
                        id={`emp-${index}-firstName`}
                        placeholder="First name"
                        value={employee.firstName}
                        onChange={(e) => handleChange(index, "firstName", e)}
                      />
                    </FormField>

                    <FormField
                      label="Last Name"
                      htmlFor={`emp-${index}-lastName`}
                    >
                      <Input
                        id={`emp-${index}-lastName`}
                        placeholder="Last name"
                        value={employee.lastName || ""}
                        onChange={(e) => handleChange(index, "lastName", e)}
                      />
                    </FormField>

                    <FormField
                      label="Designation"
                      htmlFor={`emp-${index}-designation`}
                    >
                      <Input
                        id={`emp-${index}-designation`}
                        placeholder="Job title"
                        value={employee.designation || ""}
                        onChange={(e) => handleChange(index, "designation", e)}
                      />
                    </FormField>

                    <FormField label="Email" htmlFor={`emp-${index}-email`}>
                      <Input
                        id={`emp-${index}-email`}
                        type="email"
                        placeholder="email@example.com"
                        value={employee.email || ""}
                        onChange={(e) => handleChange(index, "email", e)}
                      />
                    </FormField>

                    <FormField label="Phone" htmlFor={`emp-${index}-phone`}>
                      <Input
                        id={`emp-${index}-phone`}
                        type="tel"
                        placeholder="Phone number"
                        value={employee.phone || ""}
                        onChange={(e) => handleChange(index, "phone", e)}
                      />
                    </FormField>

                    <FormField
                      label="Alternate Phone"
                      htmlFor={`emp-${index}-altPhone`}
                    >
                      <Input
                        id={`emp-${index}-altPhone`}
                        type="tel"
                        placeholder="Alt. phone number"
                        value={employee.altPhone || ""}
                        onChange={(e) => handleChange(index, "altPhone", e)}
                      />
                    </FormField>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
