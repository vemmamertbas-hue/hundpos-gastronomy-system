import { useState, useEffect } from "react";
import { PosHeader } from "@/components/ui/pos-header";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { TableGrid } from "@/components/pos/table-grid";
import { ProductGrid } from "@/components/pos/product-grid";
import { OrderCart } from "@/components/pos/order-cart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("pos");
  const [tables, setTables] = useState<Table[]>([]);
  const [activeTable, setActiveTable] = useState<string>();
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const [loading, setLoading] = useState(true);

  const currentCart = activeTable ? tableCarts[activeTable] || [] : [];

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        // Load tables
        const { data: tablesData } = await supabase
          .from('tables')
          .select('*')
          .eq('user_id', user.id);
        
        if (tablesData) {
          const formattedTables = tablesData.map(table => ({
            id: table.table_id,
            name: table.name,
            status: table.status as 'free' | 'occupied',
            capacity: table.capacity
          }));
          setTables(formattedTables);
        }

        // Load orders  
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          const formattedOrders = ordersData.map(order => ({
            id: order.order_number,
            tableId: order.table_id || '',
            items: (order.items as any) || [],
            subtotal: Number(order.subtotal),
            discount: Number(order.discount),
            total: Number(order.total),
            status: (order.status as any) || 'kitchen',
            platform: order.platform as 'pos' | 'delivery',
            paymentMethod: order.payment_method as 'cash' | 'card' | 'digital',
            createdAt: new Date(order.created_at),
            updatedAt: new Date(order.updated_at)
          }));
          setOrders(formattedOrders);
          
          // Set next order counter
          const maxOrderNumber = Math.max(...ordersData.map(o => o.order_number), 0);
          setOrderCounter(maxOrderNumber + 1);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleTableSelect = (tableId: string) => {
    setActiveTable(tableId);
    if (!tableCarts[tableId]) {
      setTableCarts(prev => ({ ...prev, [tableId]: [] }));
    }
  };

  const handleTableAdd = async (name: string) => {
    if (!user) return;
    
    const tableId = `T${tables.length + 1}`;
    const newTable: Table = {
      id: tableId,
      name,
      status: "free",
      capacity: 4,
    };

    try {
      const { error } = await supabase
        .from('tables')
        .insert({
          user_id: user.id,
          table_id: tableId,
          name,
          status: 'free',
          capacity: 4
        });

      if (error) throw error;

      setTables(prev => [...prev, newTable]);
      toast({
        title: "Tisch hinzugefügt",
        description: `${name} wurde erfolgreich hinzugefügt.`,
      });
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: "Fehler",
        description: "Tisch konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
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

  const handleCheckout = async (paymentMethod: 'cash' | 'card' | 'digital') => {
    if (!activeTable || currentCart.length === 0 || !user) return;

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

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderCounter,
          table_id: activeTable,
          items: currentCart as any,
          subtotal,
          discount: 0,
          total: subtotal,
          status: 'kitchen',
          platform: 'pos',
          payment_method: paymentMethod
        });

      if (error) throw error;

      setOrders(prev => [...prev, newOrder]);
      setOrderCounter(prev => prev + 1);
      
      // Clear cart and set table to free
      setTableCarts(prev => ({
        ...prev,
        [activeTable]: [],
      }));
      
      // Update table status in database
      await supabase
        .from('tables')
        .update({ status: 'free' })
        .eq('user_id', user.id)
        .eq('table_id', activeTable);
      
      setTables(prev => prev.map(table =>
        table.id === activeTable
          ? { ...table, status: "free" }
          : table
      ));

      toast({
        title: "Bestellung abgeschlossen",
        description: `Bestellung #${orderCounter} wurde erfolgreich kassiert.`,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Fehler",
        description: "Bestellung konnte nicht abgeschlossen werden.",
        variant: "destructive",
      });
    }
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
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="order-2 xl:order-1">
          <TableGrid
            tables={tables}
            activeTable={activeTable}
            onTableSelect={handleTableSelect}
            onTableAdd={handleTableAdd}
            onTableStatusChange={() => {}}
          />
        </div>

        <div className="order-1 xl:order-2">
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

        <div className="order-3">
          <ProductGrid
            products={sampleMenu}
            categories={sampleCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onProductSelect={handleProductSelect}
          />
        </div>
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
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Bestellverwaltung</h2>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Nr.</th>
                      <th className="text-left p-4 font-medium">Zeit</th>
                      <th className="text-left p-4 font-medium">Tisch</th>
                      <th className="text-left p-4 font-medium">Artikel</th>
                      <th className="text-right p-4 font-medium">Summe</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Bezahlung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          Noch keine Bestellungen
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/25">
                          <td className="p-4 font-medium">#{order.id}</td>
                          <td className="p-4 text-sm">
                            {order.createdAt.toLocaleTimeString('de-DE')}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{order.tableId}</Badge>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="text-sm">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="truncate">
                                  {item.name} x{item.quantity}
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-muted-foreground">
                                  +{order.items.length - 2} weitere
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium">
                            €{order.total.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={order.status === 'kitchen' ? 'default' : 'secondary'}
                            >
                              {order.status === 'kitchen' ? 'Küche' : 'Fertig'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {order.paymentMethod === 'cash' ? 'Bar' : 
                               order.paymentMethod === 'card' ? 'Karte' : 'Digital'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      case "delivery":
        return <div className="p-6"><h2 className="text-2xl font-bold">Lieferservice</h2></div>;
      case "reports":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Berichte</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tagesabschluss</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Anzahl Bestellungen:</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gesamtumsatz:</span>
                    <span className="font-medium">
                      €{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durchschnitt pro Bestellung:</span>
                    <span className="font-medium">
                      €{orders.length > 0 ? 
                        (orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toFixed(2) : 
                        '0.00'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      const total = orders.reduce((sum, order) => sum + order.total, 0);
                      toast({
                        title: "Z-Bericht erstellt",
                        description: `Tagesumsatz: €${total.toFixed(2)} | ${orders.length} Bestellungen`,
                      });
                    }}
                  >
                    Z-Bericht erstellen
                  </Button>
                  <Button variant="outline" className="w-full">
                    X-Bericht (Zwischenbericht)
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Zahlungsarten</h3>
                
                <div className="space-y-3">
                  {['cash', 'card', 'digital'].map((method) => {
                    const methodOrders = orders.filter(o => o.paymentMethod === method);
                    const methodTotal = methodOrders.reduce((sum, order) => sum + order.total, 0);
                    const methodName = method === 'cash' ? 'Bar' : method === 'card' ? 'Karte' : 'Digital';
                    
                    return (
                      <div key={method} className="flex justify-between items-center">
                        <span>{methodName}:</span>
                        <div className="text-right">
                          <div className="font-medium">€{methodTotal.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {methodOrders.length} Bestellungen
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        );
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