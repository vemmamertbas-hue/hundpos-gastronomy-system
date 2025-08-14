import { useState, useEffect } from "react";
import { PosHeader } from "@/components/ui/pos-header";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { TableGrid } from "@/components/pos/table-grid";
import { ProductGrid } from "@/components/pos/product-grid";
import { OrderCart } from "@/components/pos/order-cart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MenuItem, CartItem, Table, Order, Category } from "@/types/pos";

// Sample data
const sampleMenu: MenuItem[] = [
  { id: 1, name: "Adana Kebap", price: 12.50, category: "Hauptgerichte", available: true },
  { id: 2, name: "Köfte", price: 11.00, category: "Hauptgerichte", available: true },
  { id: 3, name: "Lahmacun", price: 5.50, category: "Snacks", available: true },
  { id: 4, name: "Salat", price: 4.00, category: "Beilagen", available: true },
  { id: 5, name: "Ayran", price: 2.00, category: "Getränke", available: true },
  { id: 6, name: "Cola 0.33", price: 2.50, category: "Getränke", available: true },
  { id: 7, name: "Baklava", price: 4.50, category: "Dessert", available: true },
  { id: 8, name: "Pizza Sucuk", price: 9.50, category: "Pizza", available: true },
  { id: 9, name: "Pizza Tonno", price: 10.50, category: "Pizza", available: true },
  { id: 10, name: "Pommes", price: 3.50, category: "Snacks", available: true },
];

const sampleCategories: Category[] = [
  { id: "Hauptgerichte", name: "Hauptgerichte" },
  { id: "Pizza", name: "Pizza" },
  { id: "Snacks", name: "Snacks" },
  { id: "Beilagen", name: "Beilagen" },
  { id: "Getränke", name: "Getränke" },
  { id: "Dessert", name: "Dessert" },
];

export default function PosSystem() {
  const [currentPage, setCurrentPage] = useState("pos");
  const [tables, setTables] = useState<Table[]>([
    { id: "T1", name: "Tisch 1", status: "free", capacity: 4 },
    { id: "T2", name: "Tisch 2", status: "occupied", capacity: 2 },
    { id: "T3", name: "Tisch 3", status: "free", capacity: 6 },
  ]);
  const [activeTable, setActiveTable] = useState<string>();
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);

  const currentCart = activeTable ? tableCarts[activeTable] || [] : [];

  const handleTableSelect = (tableId: string) => {
    setActiveTable(tableId);
    if (!tableCarts[tableId]) {
      setTableCarts(prev => ({ ...prev, [tableId]: [] }));
    }
  };

  const handleTableAdd = (name: string) => {
    const newTable: Table = {
      id: `T${tables.length + 1}`,
      name,
      status: "free",
      capacity: 4,
    };
    setTables(prev => [...prev, newTable]);
    toast({
      title: "Tisch hinzugefügt",
      description: `${name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleProductSelect = (product: MenuItem) => {
    if (!activeTable) {
      toast({
        title: "Kein Tisch ausgewählt",
        description: "Bitte wählen Sie zuerst einen Tisch aus.",
        variant: "destructive",
      });
      return;
    }

    setTableCarts(prev => {
      const cart = prev[activeTable] || [];
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        return {
          ...prev,
          [activeTable]: cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          ...prev,
          [activeTable]: [...cart, { ...product, quantity: 1 }],
        };
      }
    });

    // Update table status to occupied if it was free
    setTables(prev => prev.map(table =>
      table.id === activeTable && table.status === "free"
        ? { ...table, status: "occupied" }
        : table
    ));
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (!activeTable) return;

    setTableCarts(prev => ({
      ...prev,
      [activeTable]: prev[activeTable].map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    if (!activeTable) return;

    setTableCarts(prev => ({
      ...prev,
      [activeTable]: prev[activeTable].filter(item => item.id !== itemId),
    }));
  };

  const handleClearCart = () => {
    if (!activeTable) return;

    setTableCarts(prev => ({
      ...prev,
      [activeTable]: [],
    }));

    // Set table status back to free if cart is empty
    setTables(prev => prev.map(table =>
      table.id === activeTable
        ? { ...table, status: "free" }
        : table
    ));

    toast({
      title: "Warenkorb geleert",
      description: "Alle Artikel wurden entfernt.",
    });
  };

  const handleCheckout = (paymentMethod: 'cash' | 'card' | 'digital') => {
    if (!activeTable || currentCart.length === 0) return;

    const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder: Order = {
      id: orderCounter,
      tableId: activeTable,
      items: [...currentCart],
      subtotal,
      discount: 0,
      total: subtotal,
      status: "kitchen",
      platform: "pos",
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOrders(prev => [...prev, newOrder]);
    setOrderCounter(prev => prev + 1);
    
    // Clear cart and set table to free
    setTableCarts(prev => ({
      ...prev,
      [activeTable]: [],
    }));
    
    setTables(prev => prev.map(table =>
      table.id === activeTable
        ? { ...table, status: "free" }
        : table
    ));

    toast({
      title: "Bestellung abgeschlossen",
      description: `Bestellung #${orderCounter} wurde erfolgreich kassiert.`,
    });
  };

  const handlePrintReceipt = () => {
    toast({
      title: "Bon wird gedruckt",
      description: "Der Bon wird an den Drucker gesendet.",
    });
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Heute</h3>
          <div className="text-3xl font-bold text-primary">
            €{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {orders.length} Bestellungen
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Tische</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Frei:</span>
              <Badge variant="outline">
                {tables.filter(t => t.status === 'free').length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Besetzt:</span>
              <Badge variant="secondary">
                {tables.filter(t => t.status === 'occupied').length}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">System</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge className="bg-accent">Online</Badge>
            </div>
            <div className="flex justify-between">
              <span>Drucker:</span>
              <Badge variant="outline">Bereit</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPosPage = () => (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <TableGrid
          tables={tables}
          activeTable={activeTable}
          onTableSelect={handleTableSelect}
          onTableAdd={handleTableAdd}
          onTableStatusChange={() => {}}
        />
      </div>

      <div>
        <OrderCart
          items={currentCart}
          tableName={activeTable ? tables.find(t => t.id === activeTable)?.name : undefined}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          onPrintReceipt={handlePrintReceipt}
        />
      </div>

      <div>
        <ProductGrid
          products={sampleMenu}
          categories={sampleCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onProductSelect={handleProductSelect}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return renderDashboard();
      case "pos":
        return renderPosPage();
      case "orders":
        return <div className="p-6"><h2 className="text-2xl font-bold">Bestellverwaltung</h2></div>;
      case "delivery":
        return <div className="p-6"><h2 className="text-2xl font-bold">Lieferservice</h2></div>;
      case "reports":
        return <div className="p-6"><h2 className="text-2xl font-bold">Berichte</h2></div>;
      case "settings":
        return <div className="p-6"><h2 className="text-2xl font-bold">Einstellungen</h2></div>;
      case "help":
        return <div className="p-6"><h2 className="text-2xl font-bold">Hilfe</h2></div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PosHeader />
      
      <div className="flex">
        <SidebarNav 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
        
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}