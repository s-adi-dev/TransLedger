import { cn } from "@/lib/utils";
import React from "react";

interface DetailCardProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function DetailCard({
  title,
  icon: Icon,
  children,
  className,
}: DetailCardProps) {
  return (
    <div className={cn("rounded-lg bg-card p-4 shadow-sm border", className)}>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <h4 className="font-semibold text-sm uppercase tracking-wide">
          {title}
        </h4>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

export function DetailRow({ label, value, highlight = false }: DetailRowProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground min-w-[140px]">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium text-right",
          highlight && "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
