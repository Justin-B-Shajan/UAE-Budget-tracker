import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Expense } from "@/pages/Index";
import { PlusCircle, Edit2, X } from "lucide-react";

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id">) => void;
  onAddRoomRent: (expense: Omit<Expense, "id">) => void;
  editingExpense: Expense | null;
  onCancelEdit: () => void;
}

export const ExpenseForm = ({
  onSubmit,
  onAddRoomRent,
  editingExpense,
  onCancelEdit,
}: ExpenseFormProps) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [item, setItem] = useState("Breakfast");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date);
      setItem(editingExpense.item);
      setCost(editingExpense.cost.toString());
      setDescription(editingExpense.description || "");
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cost || parseFloat(cost) <= 0) return;

    const expense = {
      date,
      item,
      cost: parseFloat(cost),
      description,
    };

    if (editingExpense) {
      onSubmit(expense);
    } else if (item === "Room Rent") {
      onAddRoomRent(expense);
    } else {
      onSubmit(expense);
    }

    // Reset form
    setDate(new Date().toISOString().split("T")[0]);
    setItem("Breakfast");
    setCost("");
    setDescription("");
  };

  const handleCancel = () => {
    onCancelEdit();
    setDate(new Date().toISOString().split("T")[0]);
    setItem("Breakfast");
    setCost("");
    setDescription("");
  };

  return (
    <div className="card-glass rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        {editingExpense ? (
          <Edit2 className="w-6 h-6 text-secondary" />
        ) : (
          <PlusCircle className="w-6 h-6 text-primary" />
        )}
        <h2 className="text-2xl font-bold text-foreground">
          {editingExpense ? "Edit Expense" : "Add New Expense"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-foreground font-medium">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item" className="text-foreground font-medium">Meal Type</Label>
          <Select value={item} onValueChange={setItem}>
            <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
              <SelectItem value="Lunch">🍽️ Lunch</SelectItem>
              <SelectItem value="Dinner">🌙 Dinner</SelectItem>
              <SelectItem value="Snacks">🍿 Snacks</SelectItem>
              <SelectItem value="Room Rent">🏠 Room Rent</SelectItem>
              <SelectItem value="Others">🛒 Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost" className="text-foreground font-medium">Cost (AED)</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            placeholder="25.50"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground font-medium">
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Add notes about this expense..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary transition-colors resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            {editingExpense ? "Update Expense" : "Add Expense"}
          </Button>
          {editingExpense && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
