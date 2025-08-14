import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/pos";
import { 
  Minus, 
  Plus, 
  Trash2, 
  Receipt, 
  CreditCard, 
  Banknote,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderCartProps {
  items: CartItem[];
  tableName?: string;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
  onCheckout: (paymentMethod: 'cash' | 'card' | 'digital') => void;
  onPrintReceipt: () => void;
}

export function OrderCart({
  items,
  tableName,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onPrintReceipt
}: OrderCartProps) {
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountValue = Math.max(
    (subtotal * discountPercent) / 100,
    discountAmount
  );
  const total = Math.max(0, subtotal - discountValue);
  const tax = total * 0.19; // 19% MwSt
  const netAmount = total - tax;

  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Bestellung</h3>
        {tableName && (
          <Badge variant="outline">
            {tableName}
          </Badge>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto space-y-2 mb-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Keine Artikel im Warenkorb</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  €{item.price.toFixed(2)} × {item.quantity}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="w-8 text-center font-mono">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 ml-2"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-right ml-4 min-w-[4rem]">
                <div className="font-bold">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          {/* Discount Controls */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <label className="text-xs text-muted-foreground">Rabatt %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Rabatt €</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Zwischensumme:</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            
            {discountValue > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>Rabatt:</span>
                <span>-€{discountValue.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Netto:</span>
              <span>€{netAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>MwSt (19%):</span>
              <span>€{tax.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Gesamt:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCheckout('cash')}
                className="flex items-center gap-1"
              >
                <Banknote className="h-3 w-3" />
                Bar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCheckout('card')}
                className="flex items-center gap-1"
              >
                <CreditCard className="h-3 w-3" />
                Karte
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onPrintReceipt}
                className="flex items-center gap-1"
              >
                <Receipt className="h-3 w-3" />
                Bon
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onCheckout('cash')}
                className="bg-gradient-primary"
              >
                Kassieren
              </Button>
              <Button
                variant="destructive"
                onClick={onClearCart}
              >
                Leeren
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}