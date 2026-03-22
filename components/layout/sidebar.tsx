"use client";

import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Banknote,
  Bookmark,
  Building2,
  ChartPie,
  LucideIcon,
  ReceiptText,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { company } = AppConfig;

// Configuration
const SIDEBAR_CONFIG = {
  brand: {
    name: company.name.toUpperCase(),
    initial: company.initials,
    font: "font-revue",
  },
  dimensions: {
    expanded: "w-64",
    collapsed: "w-16",
    mobile: "w-72",
    headerHeight: "h-16",
  },
  copyright: "© 2025 ABORINGDEVELOPER",
  navItems: [
    { icon: Ticket, label: "Trips", href: "/trips" },
    { icon: Building2, label: "Companies", href: "/companies" },
    { icon: Banknote, label: "Payment Ledger", href: "/payment-ledger" },
    { icon: Bookmark, label: "Refund Ledger", href: "/refund-ledger" },
    { icon: ReceiptText, label: "Forms", href: "/forms" },
  ],
} as const;

// Types
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

// Sub-components
function BrandLogo({ isExpanded = true }: { isExpanded?: boolean }) {
  const { brand } = SIDEBAR_CONFIG;

  const logoIcon = (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <span className={`text-lg font-bold ${brand.font}`}>{brand.initial}</span>
    </div>
  );

  if (!isExpanded) {
    return <div className="mx-auto">{logoIcon}</div>;
  }

  return (
    <div className="flex items-center gap-2">
      {logoIcon}
      <span className={`text-lg font-semibold ${brand.font} whitespace-nowrap`}>
        {brand.name}
      </span>
    </div>
  );
}

function CopyrightFooter({ className }: { className?: string }) {
  return (
    <div className={cn("border-t p-4", className)}>
      <p className="text-xs whitespace-nowrap text-muted-foreground">
        {SIDEBAR_CONFIG.copyright}
      </p>
    </div>
  );
}

function NavItemLink({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;
  const buttonClasses = cn(
    buttonVariants({
      variant: isActive ? "secondary" : "ghost",
      size: isCollapsed ? "icon" : "default",
    }),
    isCollapsed ? "w-full" : "w-full justify-start gap-3",
  );

  const linkContent = (
    <>
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
      {isCollapsed && <span className="sr-only">{item.label}</span>}
    </>
  );

  const NavLink = (
    <Link href={item.href} className={buttonClasses}>
      {linkContent}
    </Link>
  );

  if (isCollapsed)
    return (
      <Tooltip>
        <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );

  return NavLink;
}

function SidebarNav({
  items,
  isCollapsed,
}: {
  items: readonly NavItem[];
  isCollapsed: boolean;
}) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </TooltipProvider>
  );
}

function SidebarContent({
  isCollapsed,
  showFooter = true,
}: {
  isCollapsed: boolean;
  showFooter?: boolean;
}) {
  return (
    <>
      <div
        className={`flex ${SIDEBAR_CONFIG.dimensions.headerHeight} items-center border-b px-4`}
      >
        <BrandLogo isExpanded={!isCollapsed} />
      </div>

      <ScrollArea className="flex-1 p-2">
        <SidebarNav items={SIDEBAR_CONFIG.navItems} isCollapsed={isCollapsed} />
      </ScrollArea>

      {showFooter && !isCollapsed && <CopyrightFooter />}
    </>
  );
}

// Main Component
export function Sidebar() {
  const { isOpen, isMobileOpen, closeMobileSidebar } = useSidebarStore();
  const { dimensions } = SIDEBAR_CONFIG;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-svh hidden lg:flex flex-col border-r bg-card transition-all duration-300",
          isOpen ? dimensions.expanded : dimensions.collapsed,
        )}
      >
        <SidebarContent isCollapsed={!isOpen} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={closeMobileSidebar}>
        <SheetContent side="left" className={`${dimensions.mobile} p-0`}>
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Use this menu to move between different sections of the
              application.
            </SheetDescription>
          </VisuallyHidden>

          <div
            className={`flex ${dimensions.headerHeight} items-center border-b px-4`}
          >
            <BrandLogo />
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)] p-2">
            <SidebarNav items={SIDEBAR_CONFIG.navItems} isCollapsed={false} />
          </ScrollArea>

          <CopyrightFooter className="absolute bottom-0 left-0 right-0" />
        </SheetContent>
      </Sheet>
    </>
  );
}
