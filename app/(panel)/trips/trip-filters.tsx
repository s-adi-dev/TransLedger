"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyList, useLocations } from "@/query";
import { useTripStore } from "@/stores";
import { BiltiStatusEnum, PartyType, PaymentStatusEnum } from "@/validators";
import { Filter, Search, X } from "lucide-react";

export function TripFilters() {
  const {
    filters,
    setSearch,
    setTruckNo,
    setFrom,
    setTo,
    setDateRange,
    setBiltiStatus,
    setPaymentStatus,
    setMaterialPartyId,
    setTruckPartyId,
    clearFilters,
  } = useTripStore();
  const { data: { companies = [] } = {}, isLoading: isLoadingCompanies } =
    useCompanyList();
  const { data: { locations = [] } = {}, isLoading: isLoadingLocations } =
    useLocations();

  // Parties Variable
  const filterAndMap = (type: PartyType) =>
    companies
      .filter((p) => p.type === type)
      .map(({ id, name }) => ({ value: id, label: name }));

  const materialParties = filterAndMap("material");
  const truckParties = filterAndMap("truck");

  //Locations Variable
  const fromLocations: ComboboxOption[] = locations
    .filter((item) => item.type == "from")
    .map((item) => {
      return { label: item.location, value: item.location };
    });
  const toLocations: ComboboxOption[] = locations
    .filter((item) => item.type == "to")
    .map((item) => {
      return { label: item.location, value: item.location };
    });

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar - Full Width */}
        <FormField label="Search" htmlFor="search-input">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-input"
              placeholder="Search trips by truck, location, or party..."
              value={filters.search || ""}
              onChange={(e) => setSearch(e.target.value || undefined)}
              className="pl-9"
            />
            {filters.search && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearch(undefined)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </FormField>

        {/* Main Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Truck Number" htmlFor="truck-no-input">
            <Input
              id="truck-no-input"
              placeholder="Truck number"
              value={filters.truckNo || ""}
              onChange={(e) => setTruckNo(e.target.value || undefined)}
            />
          </FormField>

          <FormField label="From" htmlFor="from-location-input">
            <Combobox
              id="from-location-input"
              width="w-full"
              placeholder="Select from location..."
              emptyMessage="No location found."
              value={filters.from}
              onValueChange={setFrom}
              options={fromLocations}
              disabled={isLoadingLocations}
            />
          </FormField>

          <FormField label="To" htmlFor="to-location-input">
            <Combobox
              id="to-location-input"
              width="w-full"
              placeholder="Select to location..."
              emptyMessage="No location found."
              value={filters.to}
              onValueChange={setTo}
              options={toLocations}
              disabled={isLoadingLocations}
            />
          </FormField>
        </div>

        {/* Date Range & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="From Date" htmlFor="date-from-picker">
            <DatePicker
              id="date-from-picker"
              value={filters.dateFrom}
              onChange={(date) => setDateRange(date, filters.dateTo)}
              placeholder="From date"
            />
          </FormField>

          <FormField label="To Date" htmlFor="date-to-picker">
            <DatePicker
              id="date-to-picker"
              value={filters.dateTo}
              onChange={(date) => setDateRange(filters.dateFrom, date)}
              placeholder="To date"
            />
          </FormField>

          <FormField label="Payment Status" htmlFor="payment-status-select">
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) =>
                setPaymentStatus(
                  PaymentStatusEnum.safeParse(value).success
                    ? PaymentStatusEnum.safeParse(value).data
                    : undefined,
                )
              }
            >
              <SelectTrigger id="payment-status-select">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="advance">Advance</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Bilti Status" htmlFor="bilti-status-select">
            <Select
              value={filters.biltiStatus}
              onValueChange={(value) =>
                setBiltiStatus(
                  BiltiStatusEnum.safeParse(value).success
                    ? BiltiStatusEnum.safeParse(value).data
                    : undefined,
                )
              }
            >
              <SelectTrigger id="bilti-status-select">
                <SelectValue placeholder="Bilti status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Party Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField htmlFor="material-party" label="Material Party">
            <Combobox
              id="material-party"
              width="w-full"
              placeholder="Select material party..."
              emptyMessage="No parties found."
              value={filters.materialPartyId}
              onValueChange={setMaterialPartyId}
              options={materialParties}
              disabled={isLoadingCompanies}
            />
          </FormField>

          <FormField htmlFor="truck-party" label="Truck Party">
            <Combobox
              id="truck-party"
              width="w-full"
              placeholder="Select truck party..."
              emptyMessage="No parties found."
              value={filters.truckPartyId}
              onValueChange={setTruckPartyId}
              options={truckParties}
              disabled={isLoadingCompanies}
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}
