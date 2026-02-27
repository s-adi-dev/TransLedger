"use client";

import Autocomplete from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatZodErrors } from "@/lib/zod";
import { useCompanyList, useCreateTrip, useLocations } from "@/query";
import { CreateTripType, createTripSchema } from "@/validators";
import { MapPinned, Package, Truck } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { BiltiSection } from "./bilti-section";
import { PartyPaymentSection } from "./payment-section";

const getInitialFormState = (): CreateTripType => ({
  date: new Date(),
  truckNo: "",
  from: "",
  to: "",
  weight: 0,
  remarks: "",
  bilti: undefined,
  materialPayment: {
    partyId: "",
    freightAmount: 0,
    advanceAmount: 0,
    advanceDate: null,
    loadingCharge: 0,
    unloadingCharge: 0,
    damageCharge: 0,
    tdsAmount: 0,
    commissionAmount: 0,
    extraChargesAmount: 0,
    extraChargesType: null,
    paymentStatus: "pending",
    finalPaymentDate: null,
  },
  truckPayment: {
    partyId: "",
    freightAmount: 0,
    advanceAmount: 0,
    advanceDate: null,
    loadingCharge: 0,
    unloadingCharge: 0,
    damageCharge: 0,
    tdsAmount: 0,
    commissionAmount: 0,
    extraChargesAmount: 0,
    extraChargesType: null,
    paymentStatus: "pending",
    finalPaymentDate: null,
  },
});

export default function TripForm() {
  const createTrip = useCreateTrip();
  const { data: companiesData, isLoading: isLoadingCompanies } =
    useCompanyList();
  const { data: locationData } = useLocations();

  const [form, setForm] = useState<CreateTripType>(getInitialFormState());
  const [biltiEnabled, setBiltiEnabled] = useState(false);

  const locations: string[] =
    locationData?.locations?.map((item) => item.location) || [];

  const companies = companiesData?.companies || [];

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFieldUpdate = <K extends keyof CreateTripType>(
    field: K,
    value: CreateTripType[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setForm(getInitialFormState());
    setBiltiEnabled(false);
  };

  const validateAndSubmit = async () => {
    // Use Zod validation
    const validationResult = createTripSchema.safeParse(form);

    if (!validationResult.success) {
      return toast.warning(formatZodErrors(validationResult.error.issues));
    }

    try {
      const result = await createTrip.mutateAsync(validationResult.data);

      if (result.success) {
        toast.success(result.message || "Trip created successfully!");
        handleReset();
      } else {
        toast.error(result.message || "Failed to create trip");
      }
    } catch (error) {
      toast.error("An error occurred while creating the trip");
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Trip Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPinned className="h-5 w-5" />
            Trip Form
          </CardTitle>
          <CardDescription>Enter trip and payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Trip Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField label="Date" htmlFor="date" required>
                  <DatePicker
                    id="date"
                    value={form.date}
                    onChange={(date) =>
                      handleFieldUpdate("date", date || new Date())
                    }
                    placeholder="Pick a date"
                  />
                </FormField>

                <FormField label="Truck Number" htmlFor="truckNo" required>
                  <Input
                    id="truckNo"
                    placeholder="e.g., MH01AB1234"
                    value={form.truckNo}
                    onChange={handleInputChange}
                    required
                  />
                </FormField>

                <FormField label="Weight (kg)" htmlFor="weight" required>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 5000"
                    value={form.weight || ""}
                    onChange={handleInputChange}
                    min="0"
                    step="0"
                    required
                  />
                </FormField>

                <FormField label="From" htmlFor="from" required>
                  <Autocomplete
                    options={[...new Set(locations)]}
                    placeholder="e.g., Mumbai"
                    value={form.from}
                    onChange={(value) =>
                      handleFieldUpdate("from", value.trim())
                    }
                  />
                </FormField>

                <FormField label="To" htmlFor="to" required>
                  <Autocomplete
                    options={[...new Set(locations)]}
                    placeholder="e.g., Delhi"
                    value={form.to}
                    onChange={(value) => handleFieldUpdate("to", value)}
                  />
                </FormField>

                <FormField
                  label="Remarks"
                  className="md:col-span-2 lg:col-span-3"
                  htmlFor="remarks"
                >
                  <Textarea
                    id="remarks"
                    placeholder="Additional notes or comments (optional)"
                    value={form.remarks || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bilti Section - Optional */}
      <BiltiSection
        enabled={biltiEnabled}
        bilti={form.bilti}
        onEnabledChange={(enabled) => {
          setBiltiEnabled(enabled);
          if (!enabled) {
            handleFieldUpdate("bilti", undefined);
          }
        }}
        onBiltiChange={(bilti) => handleFieldUpdate("bilti", bilti)}
      />

      {/* Material Party Payment Section - Required */}
      <PartyPaymentSection
        title="Material Party Payment"
        icon={<Package className="h-5 w-5" />}
        payment={form.materialPayment}
        parties={companies}
        partyType="material"
        onPaymentChange={(payment) =>
          handleFieldUpdate("materialPayment", payment)
        }
        required
      />

      {/* Truck Party Payment Section - Required */}
      <PartyPaymentSection
        title="Truck Party Payment"
        icon={<Truck className="h-5 w-5" />}
        payment={form.truckPayment}
        parties={companies}
        partyType="truck"
        onPaymentChange={(payment) =>
          handleFieldUpdate("truckPayment", payment)
        }
        required
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={createTrip.isPending}
        >
          Reset
        </Button>
        <Button
          type="submit"
          onClick={validateAndSubmit}
          disabled={createTrip.isPending || isLoadingCompanies}
        >
          {createTrip.isPending ? "Saving..." : "Save Trip"}
        </Button>
      </div>
    </div>
  );
}
