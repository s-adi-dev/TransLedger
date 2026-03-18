import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExtraChargeType, PartyPaymentInput, RefundInput } from "@/validators";
import { formatDate } from "date-fns";
import { X } from "lucide-react";
import { ChangeEvent, useState } from "react";

interface Party {
  id: string;
  name: string;
  type: "material" | "truck";
}

interface PartyPaymentSectionProps {
  title: string;
  icon: React.ReactNode;
  metaData: { date: Date; truckNo: string };
  payment: PartyPaymentInput;
  parties: Party[];
  partyType: "material" | "truck";
  onPaymentChange: (payment: PartyPaymentInput) => void;
  required?: boolean;
}

export function PartyPaymentSection({
  title,
  icon,
  metaData,
  payment,
  parties,
  partyType,
  onPaymentChange,
  required = false,
}: PartyPaymentSectionProps) {
  const [refundEnabled, setRefundEnabled] = useState(!!payment.refund);
  const totalCharges =
    payment.loadingCharge +
    payment.unloadingCharge +
    payment.damageCharge +
    payment.extraChargesAmount;
  const totalDeductions = payment.tdsAmount + payment.commissionAmount;
  const netAmount = payment.freightAmount - payment.advanceAmount;
  const balanceAmount = netAmount - totalCharges - totalDeductions;

  const filteredParties: ComboboxOption[] = parties
    .filter((p) => p.type === partyType)
    .map((party) => ({
      value: party.id,
      label: party.name,
    }));

  const handleFieldChange = <K extends keyof PartyPaymentInput>(
    field: K,
    value: PartyPaymentInput[K],
  ) => {
    onPaymentChange({
      ...payment,
      [field]: value,
    });
  };

  const handleNumberChange = (
    field: keyof PartyPaymentInput,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value) || 0;
    handleFieldChange(field, value);
  };

  const handleRefundToggle = (enabled: boolean) => {
    setRefundEnabled(enabled);
    if (enabled) {
      handleFieldChange("refund", {
        refundAmount: 0,
        refundDate: new Date(),
      });
    } else {
      handleFieldChange("refund", undefined);
    }
  };

  const handleRefundChange = <K extends keyof RefundInput>(
    field: K,
    value: RefundInput[K],
  ) => {
    if (payment.refund) {
      handleFieldChange("refund", {
        ...payment.refund,
        [field]: value,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center gap-2">
          <span className="flex items-center gap-2">
            {icon}
            {title}
            {required && <span className="text-destructive">*</span>}
          </span>
          <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
            <span>Date: {formatDate(metaData.date, "MMMM do, yyyy")}</span>
            <span>|</span>
            <span>Truck No: {metaData.truckNo || "Not Filled"}</span>
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Party & Payment Amounts Selection */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Select Party"
            htmlFor={`${partyType}-party`}
            required={required}
          >
            <Combobox
              value={payment.partyId || ""}
              options={filteredParties}
              onValueChange={(value) => handleFieldChange("partyId", value)}
              width="w-full"
            />
          </FormField>
          <FormField
            label="Freight Amount"
            required={required}
            htmlFor={`${partyType}-freight`}
          >
            <Input
              id={`${partyType}-freight`}
              type="number"
              placeholder="0"
              value={payment.freightAmount || ""}
              onChange={(e) => handleNumberChange("freightAmount", e)}
              min="0"
              step="0"
            />
          </FormField>

          <FormField label="Advance Amount" htmlFor={`${partyType}-advance`}>
            <Input
              id={`${partyType}-advance`}
              type="number"
              placeholder="0"
              value={payment.advanceAmount || ""}
              onChange={(e) => handleNumberChange("advanceAmount", e)}
              min="0"
              step="0"
            />
          </FormField>

          <FormField label="Advance Date" htmlFor={`${partyType}-advance-date`}>
            <DatePicker
              id={`${partyType}-advance-date`}
              value={payment.advanceDate}
              onChange={(date) =>
                handleFieldChange("advanceDate", date || null)
              }
              placeholder="Select date"
            />
          </FormField>
        </div>

        {/* Charges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <FormField label="Loading Charge" htmlFor={`${partyType}-loading`}>
            <Input
              id={`${partyType}-loading`}
              type="number"
              placeholder="0"
              value={payment.loadingCharge || ""}
              onChange={(e) => handleNumberChange("loadingCharge", e)}
              min="0"
              step="0"
            />
          </FormField>

          <FormField
            label="Unloading Charge"
            htmlFor={`${partyType}-unloading`}
          >
            <Input
              id={`${partyType}-unloading`}
              type="number"
              placeholder="0"
              value={payment.unloadingCharge || ""}
              onChange={(e) => handleNumberChange("unloadingCharge", e)}
              min="0"
              step="0"
            />
          </FormField>

          <FormField label="Damage Charge" htmlFor={`${partyType}-damage`}>
            <Input
              id={`${partyType}-damage`}
              type="number"
              placeholder="0"
              value={payment.damageCharge || ""}
              onChange={(e) => handleNumberChange("damageCharge", e)}
              min="0"
              step="0"
            />
          </FormField>

          <FormField label="TDS Amount" htmlFor={`${partyType}-tds`}>
            <Input
              id={`${partyType}-tds`}
              type="number"
              placeholder="0"
              value={payment.tdsAmount || ""}
              onChange={(e) => handleNumberChange("tdsAmount", e)}
              min="0"
              step="0"
            />
          </FormField>

          <FormField
            label="Commission Amount"
            htmlFor={`${partyType}-commission`}
          >
            <Input
              id={`${partyType}-commission`}
              type="number"
              placeholder="0"
              value={payment.commissionAmount || ""}
              onChange={(e) => handleNumberChange("commissionAmount", e)}
              min="0"
              step="0"
            />
          </FormField>
        </div>

        {/* Extra Charges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Extra Charges Type"
            htmlFor={`${partyType}-extra-type`}
          >
            <Select
              value={payment.extraChargesType || "none"}
              onValueChange={(value: ExtraChargeType | "none") =>
                handleFieldChange(
                  "extraChargesType",
                  value === "none" ? null : value,
                )
              }
            >
              <SelectTrigger id={`${partyType}-extra-type`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="late_delivery">Late Delivery</SelectItem>
                <SelectItem value="detention">Detention</SelectItem>
                <SelectItem value="extra_loading">Extra Loading</SelectItem>
                <SelectItem value="penalty">Penalty</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Extra Charges Amount"
            htmlFor={`${partyType}-extra-charges`}
          >
            <Input
              id={`${partyType}-extra-charges`}
              type="number"
              placeholder="0"
              value={payment.extraChargesAmount || ""}
              onChange={(e) => handleNumberChange("extraChargesAmount", e)}
              min="0"
              step="0"
            />
          </FormField>
        </div>

        <FormField
          label="Balance Amount & Final Payment Date"
          htmlFor={`${partyType}-final-date`}
        >
          <div className="flex gap-2">
            <Input className="w-44" value={balanceAmount} disabled />

            <DatePicker
              className="w-full"
              id={`${partyType}-final-date`}
              value={payment.finalPaymentDate}
              onChange={(date) =>
                handleFieldChange("finalPaymentDate", date || null)
              }
              placeholder="Select date"
            />
          </div>
        </FormField>

        {/* Refund Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">Refund</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`${partyType}-refund-toggle`}
                checked={refundEnabled}
                onCheckedChange={handleRefundToggle}
              />
              <Label
                htmlFor={`${partyType}-refund-toggle`}
                className="font-normal text-sm"
              >
                Enable
              </Label>
            </div>
          </div>

          {refundEnabled && payment.refund && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Refund Amount"
                htmlFor={`${partyType}-refund-amount`}
                required
              >
                <Input
                  id={`${partyType}-refund-amount`}
                  type="number"
                  placeholder="0"
                  value={payment.refund.refundAmount || ""}
                  onChange={(e) =>
                    handleRefundChange(
                      "refundAmount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  min="0"
                  step="0"
                />
              </FormField>

              <FormField
                label="Refund Date"
                htmlFor={`${partyType}-refund-date`}
                required
              >
                <DatePicker
                  id={`${partyType}-refund-date`}
                  value={payment.refund.refundDate}
                  onChange={(date) =>
                    handleRefundChange("refundDate", date || new Date())
                  }
                  placeholder="Select date"
                />
              </FormField>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
