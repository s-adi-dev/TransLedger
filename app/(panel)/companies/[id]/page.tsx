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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompany,
  useDeleteCompany,
  useDeleteEmployee,
} from "@/query";
import { useBreadcrumbStore } from "@/stores";
import {
  ArrowLeft,
  Building2,
  Edit,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Trash2,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { AddEmployeeForm } from "./add-employee-form";
import { EditCompanyForm } from "./edit-company-form";
import { EditEmployeeForm } from "./edit-employee-form";

interface CompanyDetailProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetail({ params }: CompanyDetailProps) {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useCompany(id);
  const deleteCompany = useDeleteCompany();
  const deleteEmployee = useDeleteEmployee();

  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<{
    id: string;
    firstName: string;
    lastName?: string | null;
    designation?: string | null;
    email?: string | null;
    phone?: string | null;
    altPhone?: string | null;
  } | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Companies", href: "/companies" },
      { label: `${data?.company?.name || "Company"} Details` },
    ]);
  }, [setBreadcrumbs, data]);

  const handleDelete = async () => {
    try {
      const result = await deleteCompany.mutateAsync(id);

      if (result.success) {
        toast.success(result.message || "Company deleted successfully!");
        router.push("/companies");
      } else {
        toast.error(result.message || "Failed to delete company");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the company");
      console.error(error);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const result = await deleteEmployee.mutateAsync(employeeId);

      if (result.success) {
        toast.success(result.message || "Employee deleted successfully!");
      } else {
        toast.error(result.message || "Failed to delete employee");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the employee");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.company) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Company not found</h3>
              <p className="text-muted-foreground mb-6">
                The company you&apos;re looking for doesn&apos;t exist
              </p>
              <Button onClick={() => router.push("/companies")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const company = data.company;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/companies")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {company.name}
            </h1>
            <p className="text-muted-foreground mt-1">Company details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setEditCompanyOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
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
                  This action cannot be undone. This will permanently delete the
                  company &quot;{company.name}&quot; and all associated data.
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

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Company Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Company Name
              </p>
              <p className="text-base">{company.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Type
              </p>
              <Badge
                variant={company.type === "material" ? "default" : "secondary"}
              >
                {company.type === "material" ? "Material" : "Truck"}
              </Badge>
            </div>

            {company.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </p>
                <p className="text-base">{company.phone}</p>
              </div>
            )}

            {company.email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>
                <p className="text-base">{company.email}</p>
              </div>
            )}

            {company.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Address
                </p>
                <p className="text-base">{company.address}</p>
              </div>
            )}

            {company.note && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-base text-muted-foreground">
                  {company.note}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold">
                  {company._count?.employees || 0}
                </span>{" "}
                employees
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold">
                  {company._count?.payments || 0}
                </span>{" "}
                payments
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>
                Employees ({company.employees?.length || 0})
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddEmployeeOpen(true)}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
          <CardDescription>
            List of all employees associated with this company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {company.employees && company.employees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.employees.map((employee) => (
                <Card
                  key={employee.id}
                  className="hover:shadow-sm transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1 min-w-0">
                        <p className="font-semibold">
                          {employee.firstName}{" "}
                          {employee.lastName && employee.lastName}
                        </p>
                        {employee.designation && (
                          <p className="text-sm text-muted-foreground">
                            {employee.designation}
                          </p>
                        )}
                        {employee.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setEditingEmployee({
                                id: employee.id,
                                firstName: employee.firstName,
                                lastName: employee.lastName,
                                designation: employee.designation,
                                email: employee.email,
                                phone: employee.phone,
                                altPhone: employee.altPhone,
                              })
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete{" "}
                                  {employee.firstName} {employee.lastName}. This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="bg-destructive dark:text-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No employees added yet</p>
              <p className="text-xs mt-1">
                Click &quot;Add Employee&quot; to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EditCompanyForm
        company={company}
        open={editCompanyOpen}
        onOpenChange={setEditCompanyOpen}
      />
      <AddEmployeeForm
        companyId={id}
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
      />
      {editingEmployee && (
        <EditEmployeeForm
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => {
            if (!open) setEditingEmployee(null);
          }}
        />
      )}
    </div>
  );
}
