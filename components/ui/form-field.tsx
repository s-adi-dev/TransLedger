import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  children,
  className,
  labelClassName,
  ...props
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      <Label
        htmlFor={htmlFor}
        className={cn("[&>span]:text-red-500 [&>span]:ml-1", labelClassName)}
      >
        {label} {required && <span>*</span>}
      </Label>
      {children}
    </div>
  );
}
