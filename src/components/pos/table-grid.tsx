import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import { Table } from "@/types/pos";
import { cn } from "@/lib/utils";

interface TableGridProps {
  tables: Table[];
  activeTable?: string;
  onTableSelect: (tableId: string) => void;
  onTableAdd: (name: string) => void;
  onTableStatusChange: (tableId: string, status: Table['status']) => void;
}

export function TableGrid({
  tables,
  activeTable,
  onTableSelect,
  onTableAdd,
  onTableStatusChange
}: TableGridProps) {
  const [newTableName, setNewTableName] = useState("");

  const handleAddTable = () => {
    if (newTableName.trim()) {
      onTableAdd(newTableName.trim());
      setNewTableName("");
    }
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'free':
        return 'bg-table-free';
      case 'occupied':
        return 'bg-table-occupied';
      case 'reserved':
        return 'bg-table-reserved';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: Table['status']) => {
    switch (status) {
      case 'free':
        return 'Frei';
      case 'occupied':
        return 'Besetzt';
      case 'reserved':
        return 'Reserviert';
      default:
        return 'Unbekannt';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tischplan</h3>
        <Badge variant="outline" className="text-xs">
          {tables.length} Tische
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {tables.map((table) => (
          <Button
            key={table.id}
            variant={activeTable === table.id ? "default" : "outline"}
            className={cn(
              "h-20 flex flex-col items-center justify-center relative overflow-hidden",
              activeTable === table.id && "ring-2 ring-primary"
            )}
            onClick={() => onTableSelect(table.id)}
          >
            <div className={cn(
              "absolute top-1 right-1 w-3 h-3 rounded-full",
              getStatusColor(table.status)
            )} />
            
            <Users className="h-5 w-5 mb-1" />
            <span className="font-medium text-sm">{table.name}</span>
            <span className="text-xs opacity-75">
              {getStatusLabel(table.status)}
            </span>
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Neuer Tischname..."
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTable()}
          className="flex-1"
        />
        <Button onClick={handleAddTable} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-table-free" />
          <span>Frei</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-table-occupied" />
          <span>Besetzt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-table-reserved" />
          <span>Reserviert</span>
        </div>
      </div>
    </Card>
  );
}