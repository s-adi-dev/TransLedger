"use client";

import { RefundLedgerPdf } from "@/components/pdf";
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
import { PdfPreviewDialog } from "@/components/ui/pdf-preview-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompany, useRefundsByCompany } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import { formatDate } from "date-fns";
import { Calendar, Loader2, TrendingUp, Truck } from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";

interface CompanyRefundsProps {
  params: Promise<{ id: string }>;
}

export default function CompanyRefundsPage({ params }: CompanyRefundsProps) {
  const { id: companyId } = use(params);
  const { data, isLoading, error } = useRefundsByCompany(companyId);
  const { data: companyData } = useCompany(companyId);
  const companyName = companyData?.company?.name || "Company";
  const { setBreadcrumbs } = useBreadcrumbStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Refund Ledger", href: "/refund-ledger" },
      { label: companyName },
    ]);
  }, [setBreadcrumbs, companyName]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Failed to load company refunds.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalAmount =
    data?.refunds?.reduce((sum, r) => sum + r.refundAmt, 0) || 0;
  const totalTrips =
    data?.refunds?.reduce((sum, r) => sum + r.tripCount, 0) || 0;

  return (
    <div className="w-full mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Company Refunds by Date
          </h1>
          <p className="text-muted-foreground mt-1">
            Refund history grouped by date
          </p>
        </div>
        {data?.refunds && data.refunds.length > 0 && (
          <PdfPreviewDialog
            title={`Refund Ledger — ${companyName}`}
            fileName={`refund-ledger-${companyName.toLowerCase().replace(/\s+/g, "-")}`}
            document={
              <RefundLedgerPdf
                companyName={companyName}
                refunds={data.refunds}
              />
            }
          />
        )}
      </div>

      {/* Summary */}
      {!isLoading && data?.refunds && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Refund Amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalAmount.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Total Trips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrips}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Refunds by Date Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refunds by Date</CardTitle>
          <CardDescription>
            Click on any date to view detailed trips
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data?.refunds && data.refunds.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Refund Date</TableHead>
                    <TableHead className="text-center">Trips Count</TableHead>
                    <TableHead className="text-right">Refund Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.refunds.map((refund, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(refund.refundDate, "dd-MM-yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{refund.tripCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{refund.refundAmt.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/refund-ledger/${companyId}/${formatDate(refund.refundDate, "yyyy-MM-dd")}`}
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
              No refund records found for this company.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
