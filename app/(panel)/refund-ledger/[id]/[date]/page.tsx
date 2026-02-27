"use client";

import { RefundTripsByDatePdf } from "@/components/pdf";
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
import { useCompany, useRefundTripsByDate } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import { generateTripNo } from "@/validators";
import {
  Calendar,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function RefundTripsByDatePage() {
  const params = useParams();
  const companyId = params.id as string;
  const date = params.date as string;

  const { data, isLoading, error } = useRefundTripsByDate(companyId, date);
  const { data: companyData } = useCompany(companyId);
  const companyName = companyData?.company?.name || "Company";
  const companyType = companyData?.company?.type as
    | "material"
    | "truck"
    | undefined;
  const isMaterial = companyType === "material";
  const isTruck = companyType === "truck";
  const { setBreadcrumbs } = useBreadcrumbStore();

  const formattedDateLabel = new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Refund Ledger", href: "/refund-ledger" },
      { label: companyName, href: `/refund-ledger/${companyId}` },
      { label: formattedDateLabel },
    ]);
  }, [setBreadcrumbs, companyName, companyId, formattedDateLabel]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Failed to load trip details.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalRefund =
    data?.trips?.reduce((sum, trip) => {
      const materialRefund = isTruck
        ? 0
        : trip.materialPayment?.refund?.refundAmount || 0;
      const truckRefund = isMaterial
        ? 0
        : trip.truckPayment?.refund?.refundAmount || 0;
      return sum + materialRefund + truckRefund;
    }, 0) || 0;

  return (
    <div className="w-full mx-auto py-8 space-y-6">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Refund Trips - {formatDate(date)}
          </h1>
          <p className="text-muted-foreground mt-1">
            All trips with refunds on this date
          </p>
        </div>
        {data?.trips && data.trips.length > 0 && (
          <PdfPreviewDialog
            title={`Refund Trips — ${companyName} — ${formattedDateLabel}`}
            fileName={`refund-trips-${companyName}-${date}`}
            document={
              <RefundTripsByDatePdf
                companyName={companyName}
                date={date}
                trips={data.trips}
              />
            }
            trigger={
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            }
          />
        )}
      </div>

      {/* Summary */}
      {!isLoading && data?.trips && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Total Trips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.trips.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Total Refund Amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalRefund.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>
            Trips with refund information for this date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data?.trips && data.trips.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip No</TableHead>
                    <TableHead>Truck No</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Trip Date</TableHead>
                    <TableHead className="text-right">Refund Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.trips.map((trip) => {
                    const materialRefund = isTruck
                      ? 0
                      : trip.materialPayment?.refund?.refundAmount || 0;
                    const truckRefund = isMaterial
                      ? 0
                      : trip.truckPayment?.refund?.refundAmount || 0;
                    const totalTripRefund = materialRefund + truckRefund;

                    return (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">
                          {generateTripNo(trip.tripNo)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{trip.truckNo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {trip.from} → {trip.to}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(trip.date)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {totalTripRefund > 0 ? (
                            <span>
                              ₹{totalTripRefund.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/trips/${trip.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No trips found for this date.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
