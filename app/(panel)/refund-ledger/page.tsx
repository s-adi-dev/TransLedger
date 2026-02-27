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
import { useAllRefunds } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import { Building2, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import LoadingRefundLedger from "./loading";

export default function RefundLedgerPage() {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const { data, error, isLoading } = useAllRefunds();

  // Calculate totals
  const totals = data?.refunds?.reduce(
    (acc, refund) => ({
      totalTrips: acc.totalTrips + refund.tripCount,
      totalRefunds: acc.totalRefunds + refund.refundCount,
      totalAmount: acc.totalAmount + refund.refundTotal,
    }),
    { totalTrips: 0, totalRefunds: 0, totalAmount: 0 },
  );

  useEffect(() => {
    setBreadcrumbs([{ label: "Refund Ledger" }]);
  }, [setBreadcrumbs]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load refund data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) return <LoadingRefundLedger />;

  return (
    <div className="w-full mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refund Ledger</h1>
          <p className="text-muted-foreground mt-1">
            View all refunds grouped by company
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data?.refunds?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Refunds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totals?.totalRefunds || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {totals?.totalTrips || 0} trips
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{totals?.totalAmount.toLocaleString("en-IN") || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Refunds</CardTitle>
          <CardDescription>
            Detailed refund information for each company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.refunds && data.refunds.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead className="text-center">Company Type</TableHead>
                    <TableHead className="text-center">Total Trips</TableHead>
                    <TableHead className="text-center">Refund Count</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.refunds.map((refund) => (
                    <TableRow key={refund.companyId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {refund.companyName}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        {capitalizeWord(refund.companyType)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{refund.tripCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{refund.refundCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{refund.refundTotal.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/refund-ledger/${refund.companyId}`}
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
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No refunds found</h3>
              <p className="text-sm text-muted-foreground">
                There are no refund records available at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
