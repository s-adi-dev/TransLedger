"use client";
import { TripPDF } from "@/components/pdf/trip-pdf";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PdfPreviewDialog } from "@/components/ui/pdf-preview-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAllTrips } from "@/query";
import { PartyType } from "@/validators";
import { PrinterIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface PrintOptions {
  date: boolean;
  truckNo: boolean;
  biltiNo: boolean;
  freight: boolean;
  advanceAdvanceDate: boolean;
  loading: boolean;
  unloading: boolean;
  tds: boolean;
  munshiana: boolean;
  commission: boolean;
  other: boolean;
  balance: boolean;
  summaryTotalAdvance: boolean;
  summaryTotalBalance: boolean;
}

export interface TripPDFOptions {
  format: PartyType;
  fields: PrintOptions;
}

const PRINT_FIELDS = [
  { id: "date", label: "Date" },
  { id: "truckNo", label: "Truck No" },
  { id: "biltiNo", label: "Bilti No" },
  { id: "freight", label: "Freight" },
  { id: "advanceAdvanceDate", label: "Advance & Advance Date" },
  { id: "loading", label: "Loading" },
  { id: "unloading", label: "Unloading" },
  { id: "tds", label: "T.D.S" },
  { id: "munshiana", label: "Munshiana" },
  { id: "commission", label: "Commission" },
  { id: "other", label: "Other" },
  { id: "balance", label: "Balance" },
] as const;

const SUMMARY_FIELDS = [
  { id: "summaryTotalAdvance", label: "Total Advance" },
  { id: "summaryTotalBalance", label: "Total Balance" },
] as const;

const DEFAULT_STATE: PrintOptions = {
  date: true,
  truckNo: true,
  biltiNo: false,
  freight: true,
  advanceAdvanceDate: true,
  loading: true,
  unloading: true,
  tds: true,
  munshiana: false,
  commission: true,
  other: false,
  balance: true,
  summaryTotalAdvance: true,
  summaryTotalBalance: true,
};

export function TripPrinter() {
  const { data, isLoading, error } = useAllTrips();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"material" | "truck">("material");
  const [selectedFields, setSelectedFields] =
    useState<PrintOptions>(DEFAULT_STATE);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFields(DEFAULT_STATE);
      setFormat("material");
    }
  }, [isOpen]);

  const handleFieldToggle = (fieldId: keyof PrintOptions) => {
    setSelectedFields((prev) => {
      const isDeductionField =
        fieldId === "munshiana" || fieldId === "commission";

      if (isDeductionField) {
        return {
          ...prev,
          munshiana: fieldId === "munshiana" ? !prev.munshiana : false,
          commission: fieldId === "commission" ? !prev.commission : false,
        };
      }

      return {
        ...prev,
        [fieldId]: !prev[fieldId],
      };
    });
  };

  const hasTrips = !!data?.trips && data.trips.length > 0;

  const pdfOptions: TripPDFOptions = { format, fields: selectedFields };
  const fileName = `trip-report-${format}-${new Date().toLocaleDateString().replace(/\//g, "-")}`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <PrinterIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Print Trip Details</SheetTitle>
          <SheetDescription>
            Choose your print options and format
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 my-6">
            {/* Format toggle */}
            <div className="flex gap-2">
              <Button
                variant={format === "material" ? "default" : "outline"}
                size="sm"
                className="grow"
                onClick={() => setFormat("material")}
              >
                Material
              </Button>
              <Button
                variant={format === "truck" ? "default" : "outline"}
                size="sm"
                className="grow"
                onClick={() => setFormat("truck")}
              >
                Truck
              </Button>
            </div>

            {/* Column fields */}
            <div className="space-y-3">
              {PRINT_FIELDS.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields[field.id as keyof PrintOptions]}
                    onCheckedChange={() =>
                      handleFieldToggle(field.id as keyof PrintOptions)
                    }
                  />
                  <Label htmlFor={field.id} className="cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Separator + Summary fields */}
            <Separator />
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Summary
              </p>
              {SUMMARY_FIELDS.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields[field.id as keyof PrintOptions]}
                    onCheckedChange={() =>
                      handleFieldToggle(field.id as keyof PrintOptions)
                    }
                  />
                  <Label htmlFor={field.id} className="cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
          {hasTrips && (
            <PdfPreviewDialog
              title={`${format.charAt(0).toUpperCase() + format.slice(1)} Report`}
              fileName={fileName}
              document={<TripPDF options={pdfOptions} data={data!.trips!} />}
            />
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
