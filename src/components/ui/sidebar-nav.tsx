import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingCart,
  Truck,
  Calculator,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "pos", label: "Kasse", icon: Calculator },
  { id: "orders", label: "Bestellungen", icon: ShoppingCart },
  { id: "delivery", label: "Lieferservice", icon: Truck },
  { id: "reports", label: "Berichte", icon: BarChart3 },
  { id: "settings", label: "Einstellungen", icon: Settings },
  { id: "help", label: "Hilfe", icon: HelpCircle },
];

export function SidebarNav({ currentPage, onPageChange }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className={cn(
      "bg-secondary border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-between"
        >
          {!collapsed && <span>Menü</span>}
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-2 px-3">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed ? "px-2" : "px-4",
                isActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <IconComponent className={cn("h-4 w-4", !collapsed && "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}