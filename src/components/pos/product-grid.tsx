import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItem, Category } from "@/types/pos";
import { cn } from "@/lib/utils";
import { Euro } from "lucide-react";

interface ProductGridProps {
  products: MenuItem[];
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  onProductSelect: (product: MenuItem) => void;
}

export function ProductGrid({
  products,
  categories,
  selectedCategory,
  onCategorySelect,
  onProductSelect
}: ProductGridProps) {
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Produkte</h3>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect("")}
        >
          Alle
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategorySelect(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product) => (
          <Button
            key={product.id}
            variant="outline"
            className={cn(
              "h-24 flex flex-col items-center justify-center p-3 relative",
              !product.available && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => product.available && onProductSelect(product)}
            disabled={!product.available}
          >
            <div className="text-center">
              <div className="font-medium text-sm mb-1 line-clamp-2">
                {product.name}
              </div>
              <div className="flex items-center justify-center gap-1 text-primary">
                <Euro className="h-3 w-3" />
                <span className="font-bold text-sm">
                  {product.price.toFixed(2)}
                </span>
              </div>
            </div>
            
            {!product.available && (
              <Badge 
                variant="destructive" 
                className="absolute top-1 right-1 text-xs px-1 py-0"
              >
                Aus
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Keine Produkte in dieser Kategorie gefunden.</p>
        </div>
      )}
    </Card>
  );
}