import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BiltiInput } from "@/validators";
import { FileText, X } from "lucide-react";

interface BiltiSectionProps {
  enabled: boolean;
  bilti?: BiltiInput;
  onEnabledChange: (enabled: boolean) => void;
  onBiltiChange: (bilti?: BiltiInput) => void;
}

export function BiltiSection({
  enabled,
  bilti,
  onEnabledChange,
  onBiltiChange,
}: BiltiSectionProps) {
  const handleToggle = (checked: boolean) => {
    onEnabledChange(checked);
    if (!checked) {
      onBiltiChange(undefined);
    } else {
      onBiltiChange({
        no: "",
        status: "pending",
        receivedDate: null,
        submittedDate: null,
      });
    }
  };

  const handleChange = (
    field: keyof BiltiInput,
    value: string | Date | null,
  ) => {
    if (!bilti) return;
    onBiltiChange({
      ...bilti,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bilti Details
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="bilti-toggle" className="text-sm font-normal">
              Include Bilti
            </Label>
            <Switch
              id="bilti-toggle"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>

      {enabled && bilti && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Bilti Number" htmlFor="bilti-no" required>
              <Input
                id="bilti-no"
                value={bilti.no}
                onChange={(e) => handleChange("no", e.target.value)}
                placeholder="Enter bilti number"
              />
            </FormField>

            <FormField label="Received Date" htmlFor="bilti-received-date">
              <div className="flex gap-2">
                <DatePicker
                  id="bilti-received-date"
                  value={bilti.receivedDate}
                  onChange={(date) =>
                    handleChange("receivedDate", date || null)
                  }
                  placeholder="Pick received date"
                />
                {bilti.receivedDate && (
                  <Button
                    variant="outline"
                    onClick={() => handleChange("receivedDate", null)}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </FormField>

            <FormField label="Submitted Date" htmlFor="bilti-submitted-date">
              <div className="flex gap-2">
                <DatePicker
                  id="bilti-submitted-date"
                  value={bilti.submittedDate}
                  onChange={(date) =>
                    handleChange("submittedDate", date || null)
                  }
                  placeholder="Pick submitted date"
                />
                {bilti.submittedDate && (
                  <Button
                    variant="outline"
                    onClick={() => handleChange("submittedDate", null)}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </FormField>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
