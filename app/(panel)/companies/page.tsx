"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useVirtualizedInfiniteScroll } from "@/hooks/use-vertualization";
import { useCompanies } from "@/query";
import { useBreadcrumbStore, useCompanyStore } from "@/stores";
import { PartyType } from "@/validators";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyList() {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const router = useRouter();
  const { filters, setType, setSearch, clearFilters } = useCompanyStore();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 500);

  const companiesQuery = useCompanies();
  const { observerRef } = useVirtualizedInfiniteScroll({
    query: companiesQuery,
  });

  // Update search filter when debounced value changes
  useEffect(() => {
    setSearch(debouncedSearch || undefined);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    setBreadcrumbs([{ label: "Companies" }]);
  }, [setBreadcrumbs]);

  const companies =
    companiesQuery.data?.pages.flatMap((page) => page.companies || []) || [];

  const hasActiveFilters = filters.type || filters.search;

  return (
    <div className="w-full mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Manage your material and truck companies
          </p>
        </div>
        <Button onClick={() => router.push("/forms/company")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.type || "all"}
              onValueChange={(value) =>
                setType(value === "all" ? undefined : (value as PartyType))
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  clearFilters();
                  setSearchInput("");
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {companiesQuery.isLoading
            ? "Loading companies..."
            : `${companies.length} ${companies.length === 1 ? "company" : "companies"} found`}
        </p>
      </div>

      {/* Company List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companiesQuery.isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : companies.length === 0 ? (
          // Empty state
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No companies found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Get started by creating your first company"}
                </p>
                {!hasActiveFilters && (
                  <Button onClick={() => router.push("/forms/company")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Company cards
          companies.map((company) => (
            <Card
              key={company.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(`/companies/${company.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge
                        variant={
                          company.type === "material" ? "default" : "secondary"
                        }
                      >
                        {company.type === "material" ? "Material" : "Truck"}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Contact Information */}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{company.phone}</span>
                  </div>
                )}

                {company.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{company.address}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {company._count?.employees || 0}
                    </span>
                    <span className="text-muted-foreground">employees</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {company._count?.payments || 0}
                    </span>
                    <span className="text-muted-foreground">payments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Infinite scroll trigger */}
      {companiesQuery.hasNextPage && (
        <div ref={observerRef} className="flex justify-center py-4">
          {companiesQuery.isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading more companies...</span>
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {!companiesQuery.hasNextPage && companies.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          You&apos;ve reached the end of the list
        </p>
      )}
    </div>
  );
}
