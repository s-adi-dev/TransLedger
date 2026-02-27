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
import { capitalizeWord } from "@/lib/str";
import { useAllPayments } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import {
  Building2,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import LoadingPaymentLedger from "./loading";

export default function PaymentLedgerPage() {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const { data, error, isLoading } = useAllPayments();

  const totals = data?.payments?.reduce(
    (acc, p) => ({
      totalTrips: acc.totalTrips + p.tripCount,
      totalAdvance: acc.totalAdvance + p.advanceTotal,
      totalBalance: acc.totalBalance + p.balanceTotal,
    }),
    { totalTrips: 0, totalAdvance: 0, totalBalance: 0 },
  );

  useEffect(() => {
    setBreadcrumbs([{ label: "Payment Ledger" }]);
  }, [setBreadcrumbs]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load payment data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) return <LoadingPaymentLedger />;

  return (
    <div className="w-full mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Ledger</h1>
          <p className="text-muted-foreground mt-1">
            View all payments grouped by company
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data?.payments?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Total Trips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totals?.totalTrips || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Advance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{totals?.totalAdvance.toLocaleString("en-IN") || 0}
            </div>
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
            <div className="text-3xl font-bold">
              ₹{totals?.totalBalance.toLocaleString("en-IN") || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Payments</CardTitle>
          <CardDescription>
            Payment summary for each company showing advance and balance details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.payments && data.payments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead className="text-center">Company Type</TableHead>
                    <TableHead className="text-center">Total Trips</TableHead>
                    <TableHead className="text-center">Advance Count</TableHead>
                    <TableHead className="text-right">Advance Total</TableHead>
                    <TableHead className="text-center">Balance Count</TableHead>
                    <TableHead className="text-right">Balance Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payments.map((payment) => (
                    <TableRow key={payment.companyId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {payment.companyName}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {capitalizeWord(payment.companyType)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{payment.tripCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{payment.advanceCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{payment.advanceTotal.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{payment.balanceCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{payment.balanceTotal.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/payment-ledger/${payment.companyId}`}
                            className="flex items-center gap-1"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-sm text-muted-foreground">
                There are no payment records available at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
