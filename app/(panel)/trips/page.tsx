"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useTrips } from "@/query";
import { useBreadcrumbStore } from "@/stores";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TripFilters } from "./trip-filters";
import { TripFooter } from "./trip-footer";
import { TripsHeader } from "./trip-header";
import { TripsTable } from "./trip-table";

export default function TripsPage() {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const router = useRouter();
  const { data, isLoading, error } = useTrips();

  useEffect(() => {
    setBreadcrumbs([{ label: "Trips" }]);
  }, [setBreadcrumbs]);

  const handleOpenDetails = (id: string) => {
    router.push(`trips/${id}`);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          Error loading trips: {error.message}
        </div>
      );
    }

    if (!data?.trips || data.trips.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No trips found
        </div>
      );
    }

    return <TripsTable trips={data.trips} onViewDetails={handleOpenDetails} />;
  };

  return (
    <div className="w-full mx-auto py-6 space-y-6">
      {/* Header */}
      <TripsHeader handleAddTrip={() => router.push("/forms/trip")} />

      {/* Filters */}
      <TripFilters />

      {/* Table */}
      <Card>
        <CardContent className="p-0">{renderTableContent()}</CardContent>
      </Card>

      {/* Pagination */}
      <TripFooter pagination={data?.pagination} />
    </div>
  );
}
