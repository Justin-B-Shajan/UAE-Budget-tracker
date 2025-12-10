import { Expense } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Receipt, FileDown } from "lucide-react";
import { format } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onDownload: (expense: Expense) => void;
}

const mealTypeEmojis: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "🍽️",
  Dinner: "🌙",
  Snacks: "🍿",
  "Room Rent": "🏠",
  Others: "🛒",
};

export const ExpenseList = ({ expenses, onEdit, onDelete, onDownload }: ExpenseListProps) => {
  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group expenses by date
  const groupedExpenses = sortedExpenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  if (expenses.length === 0) {
    return (
      <div className="card-glass rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Recent Expenses</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-muted-foreground text-lg">No expenses yet</p>
          <p className="text-muted-foreground text-sm mt-2">
            Start tracking your food budget by adding your first expense
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Recent Expenses</h2>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(groupedExpenses).map(([date, dayExpenses], groupIndex) => {
          const dayTotal = dayExpenses.reduce((sum, e) => sum + e.cost, 0);
          
          return (
            <div
              key={date}
              style={{ animationDelay: `${groupIndex * 0.1}s` }}
              className="animate-fade-in-up"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                <h3 className="text-sm font-semibold text-primary">
                  {format(new Date(date), "MMMM dd, yyyy")}
                </h3>
                <span className="text-sm font-bold text-secondary">
                  AED {dayTotal.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3">
                {dayExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-background/30 rounded-xl p-4 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{mealTypeEmojis[expense.item]}</span>
                          <span className="font-semibold text-foreground">{expense.item}</span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary whitespace-nowrap">
                          AED {expense.cost.toFixed(2)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(expense)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(expense.id)}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDownload(expense)}
                            className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
