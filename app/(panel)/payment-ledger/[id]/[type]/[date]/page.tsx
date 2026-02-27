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
import { useCompany, usePaymentTripsByDate } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import { generateTripNo } from "@/validators";
import {
  ExternalLink,
  IndianRupee,
  Loader2,
  MapPin,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentTripsByDatePage() {
  const params = useParams();
  const companyId = params.id as string;
  const type = params.type as "advance" | "balance";
  const date = params.date as string;

  const { data, isLoading, error } = usePaymentTripsByDate(
    companyId,
    type,
    date,
  );
  const { data: companyData } = useCompany(companyId);
  const companyName = companyData?.company?.name || "Company";
  const companyType = companyData?.company?.type as "material" | "truck" | undefined;
  const { setBreadcrumbs } = useBreadcrumbStore();

  const formattedDateLabel = new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const typeLabel = type === "advance" ? "Advance" : "Balance";

  useEffect(() => {
    setBreadcrumbs([
      { label: "Payment Ledger", href: "/payment-ledger" },
      { label: companyName, href: `/payment-ledger/${companyId}` },
      { label: `${typeLabel} — ${formattedDateLabel}` },
    ]);
  }, [setBreadcrumbs, companyName, companyId, formattedDateLabel, typeLabel]);

  const formatTripDate = (d: string | Date) => {
    return new Date(d).toLocaleDateString("en-IN", {
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

  const isMaterial = companyType === "material";
  const isTruck = companyType === "truck";

  const totalAmount =
    data?.trips?.reduce((sum, trip) => {
      if (type === "advance") {
        const materialAdvance = isTruck ? 0 : (trip.materialPayment?.advanceAmount || 0);
        const truckAdvance = isMaterial ? 0 : (trip.truckPayment?.advanceAmount || 0);
        return sum + materialAdvance + truckAdvance;
      } else {
        const materialBalance = isTruck ? 0 :
          (trip.materialPayment?.freightAmount || 0) -
          (trip.materialPayment?.advanceAmount || 0);
        const truckBalance = isMaterial ? 0 :
          (trip.truckPayment?.freightAmount || 0) -
          (trip.truckPayment?.advanceAmount || 0);
        return sum + materialBalance + truckBalance;
      }
    }, 0) || 0;

  return (
    <div className="w-full mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {typeLabel} Trips — {formatTripDate(date)}
          </h1>
          <p className="text-muted-foreground mt-1">
            All trips with {typeLabel.toLowerCase()} payments on this date
          </p>
        </div>
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
                {type === "advance" ? (
                  <Wallet className="h-4 w-4" />
                ) : (
                  <IndianRupee className="h-4 w-4" />
                )}
                Total {typeLabel} Amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalAmount.toLocaleString("en-IN")}
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
            Trips with {typeLabel.toLowerCase()} payment information for this
            date
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
                    <TableHead className="text-right">Freight</TableHead>
                    {type === "advance" ? (
                      <>
                        {!isTruck && (
                          <TableHead className="text-right">
                            Material Advance
                          </TableHead>
                        )}
                        {!isMaterial && (
                          <TableHead className="text-right">
                            Truck Advance
                          </TableHead>
                        )}
                      </>
                    ) : (
                      <>
                        {!isTruck && (
                          <TableHead className="text-right">
                            Material Balance
                          </TableHead>
                        )}
                        {!isMaterial && (
                          <TableHead className="text-right">
                            Truck Balance
                          </TableHead>
                        )}
                      </>
                    )}
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.trips.map((trip) => {
                    const materialPayment = trip.materialPayment;
                    const truckPayment = trip.truckPayment;

                    let materialAmount = 0;
                    let truckAmount = 0;

                    if (type === "advance") {
                      materialAmount = isTruck ? 0 : (materialPayment?.advanceAmount || 0);
                      truckAmount = isMaterial ? 0 : (truckPayment?.advanceAmount || 0);
                    } else {
                      materialAmount = isTruck ? 0 :
                        (materialPayment?.freightAmount || 0) -
                        (materialPayment?.advanceAmount || 0);
                      truckAmount = isMaterial ? 0 :
                        (truckPayment?.freightAmount || 0) -
                        (truckPayment?.advanceAmount || 0);
                    }

                    const totalFreight =
                      (isTruck ? 0 : (materialPayment?.freightAmount || 0)) +
                      (isMaterial ? 0 : (truckPayment?.freightAmount || 0));

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
                          {formatTripDate(trip.date)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ₹{totalFreight.toLocaleString("en-IN")}
                        </TableCell>
                        {!isTruck && (
                          <TableCell className="text-right">
                            {materialAmount > 0 ? (
                              <span className="text-sm font-medium">
                                ₹{materialAmount.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        )}
                        {!isMaterial && (
                          <TableCell className="text-right">
                            {truckAmount > 0 ? (
                              <span className="text-sm font-medium">
                                ₹{truckAmount.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        )}
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
