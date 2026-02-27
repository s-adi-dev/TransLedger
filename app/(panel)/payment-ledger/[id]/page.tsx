"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany, usePaymentsByCompany } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import { formatDate } from "date-fns";
import {
  Calendar,
  IndianRupee,
  Loader2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";

interface CompanyPaymentsProps {
  params: Promise<{ id: string }>;
}

export default function CompanyPaymentsPage({ params }: CompanyPaymentsProps) {
  const { id: companyId } = use(params);
  const { data, isLoading, error } = usePaymentsByCompany(companyId);
  const { data: companyData } = useCompany(companyId);
  const companyName = companyData?.company?.name || "Company";
  const { setBreadcrumbs } = useBreadcrumbStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Payment Ledger", href: "/payment-ledger" },
      { label: companyName },
    ]);
  }, [setBreadcrumbs, companyName]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Failed to load company payments.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalAdvance =
    data?.advancePayments?.reduce((sum, p) => sum + p.totalAmount, 0) || 0;
  const totalBalance =
    data?.balancePayments?.reduce((sum, p) => sum + p.totalAmount, 0) || 0;
  const totalAdvanceTrips =
    data?.advancePayments?.reduce((sum, p) => sum + p.tripCount, 0) || 0;
  const totalBalanceTrips =
    data?.balancePayments?.reduce((sum, p) => sum + p.tripCount, 0) || 0;

  return (
    <div className="w-full mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Company Payments
          </h1>
          <p className="text-muted-foreground mt-1">
            Payment history grouped by advance and balance
          </p>
        </div>
      </div>

      {/* Summary */}
      {!isLoading && data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Total Advance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalAdvance.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {totalAdvanceTrips} trips &middot;{" "}
                {data.advancePayments?.length || 0} dates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Total Balance Paid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalBalance.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {totalBalanceTrips} trips &middot;{" "}
                {data.balancePayments?.length || 0} dates
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Advance / Balance */}
      <Tabs defaultValue="advance">
        <TabsList>
          <TabsTrigger value="advance" className="gap-1.5">
            <Wallet className="h-4 w-4" />
            Advance
          </TabsTrigger>
          <TabsTrigger value="balance" className="gap-1.5">
            <IndianRupee className="h-4 w-4" />
            Balance
          </TabsTrigger>
        </TabsList>

        {/* Advance Tab */}
        <TabsContent value="advance">
          <Card>
            <CardHeader>
              <CardTitle>Advance Payments</CardTitle>
              <CardDescription>
                Advance payments grouped by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : data?.advancePayments && data.advancePayments.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment Date</TableHead>
                        <TableHead className="text-center">
                          Trips Count
                        </TableHead>
                        <TableHead className="text-right">
                          Total Amount
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.advancePayments.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(payment.date, "dd-MM-yyyy")}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">
                              {payment.tripCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{payment.totalAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/payment-ledger/${companyId}/advance/${formatDate(payment.date, "yyyy-MM-dd")}`}
                              >
                                View Trips
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No advance payment records found for this company.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Tab */}
        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Balance Payments</CardTitle>
              <CardDescription>
                Final/balance payments grouped by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : data?.balancePayments && data.balancePayments.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment Date</TableHead>
                        <TableHead className="text-center">
                          Trips Count
                        </TableHead>
                        <TableHead className="text-right">
                          Total Amount
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.balancePayments.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(payment.date, "dd-MM-yyyy")}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">
                              {payment.tripCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{payment.totalAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/payment-ledger/${companyId}/balance/${formatDate(payment.date, "yyyy-MM-dd")}`}
                              >
                                View Trips
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No balance payment records found for this company.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
