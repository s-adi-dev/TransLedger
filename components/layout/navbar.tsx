"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbStore, useSidebarStore } from "@/stores";
import { PanelLeft } from "lucide-react";
import Link from "next/link";

// Configuration
const NAVBAR_CONFIG = {
  height: "h-16",
};

// Sub-components
function SidebarToggleButton({
  onClick,
  label,
  className = "",
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={className}
            onClick={onClick}
          >
            <PanelLeft />
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle Sidebar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function BreadcrumbNav() {
  const { breadcrumbs } = useBreadcrumbStore();

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Main Component
export function Navbar() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebarStore();

  return (
    <header
      className={`sticky top-0 z-30 flex ${NAVBAR_CONFIG.height} items-center gap-4 border-b bg-card px-4`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <SidebarToggleButton
          onClick={toggleMobileSidebar}
          label="Toggle mobile menu"
          className="lg:hidden"
        />
        <SidebarToggleButton
          onClick={toggleSidebar}
          label="Toggle sidebar"
          className="hidden lg:flex"
        />
        <Separator orientation="vertical" className="h-6" />
        <BreadcrumbNav />
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
