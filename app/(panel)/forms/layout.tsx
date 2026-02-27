"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreadcrumbStore } from "@/stores";
import { Building2, LucideIcon, MapPinned, ReceiptText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface FormRoute {
  label: string;
  path: string;
  icon: LucideIcon;
}

const FORM_ROUTES: FormRoute[] = [
  {
    label: "Trip",
    path: "/forms/trip",
    icon: MapPinned,
  },
  {
    label: "Company",
    path: "/forms/company",
    icon: Building2,
  },
];

export default function FormLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setBreadcrumbs([{ label: "Forms" }]);
  }, [setBreadcrumbs]);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <ReceiptText /> Registration Forms
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ButtonGroup className="mb-6 mx-auto">
          {FORM_ROUTES.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.path;

            return (
              <Button
                key={route.path}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => router.push(route.path)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Button>
            );
          })}
        </ButtonGroup>
        {children}
      </CardContent>
    </Card>
  );
}
