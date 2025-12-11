import { useState } from "react";
import {
  Download,
  Pencil,
  PiggyBank,
  DollarSign,
  Upload,
  Trash2,
  Calendar,
  CalendarDays,
  TrendingUp,
  Wallet,
  Utensils,
  Scale,
  ShoppingBag,
  Home,
  Hash,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authAPI } from "@/lib/api";
import { Expense } from "@/pages/Index";

interface BudgetSummaryProps {
  expenses: Expense[];
  roomRents?: Expense[] | null;
  onDownloadAll: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

export const BudgetSummary = ({
  expenses,
  roomRents,
  onDownloadAll,
  onImport,
  onReset,
}: BudgetSummaryProps) => {
  const { user, updateUser } = useAuth();

  const { toast } = useToast();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(user?.monthly_budget?.toString() || "");

  const today = new Date().toISOString().split("T")[0];

  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.cost, 0);

  const getWeekNumber = (date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7));
  };
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  const weeklyTotal = expenses
    .filter((e) => {
      const expDate = new Date(e.date);
      return (
        getWeekNumber(expDate) === currentWeek &&
        expDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, e) => sum + e.cost, 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const allCurrentMonthExpenses = [...expenses, ...(roomRents || [])];
  const monthlyTotal = allCurrentMonthExpenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.cost, 0);

  const totalExpense =
    expenses.reduce((sum, e) => sum + e.cost, 0) +
    (roomRents?.reduce((sum, rent) => sum + rent.cost, 0) || 0);

  const totalDays = new Set(
    expenses.filter((e) => e.item !== "Others").map((e) => e.date)
  ).size;

  const mealsTotal = expenses
    .filter((e) => ["Breakfast", "Lunch", "Dinner", "Snacks"].includes(e.item))
    .reduce((sum, e) => sum + e.cost, 0);

  const averageMealsTotal = totalDays > 0 ? mealsTotal / totalDays : 0;

  const othersTotal = expenses
    .filter((e) => e.item === "Others")
    .reduce((sum, e) => sum + e.cost, 0);

  // monthlyBudget and remainingBalance logic maintained but unused for display stats

  const handleUpdateBudget = async () => {
    const budgetValue = parseFloat(newBudget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid positive number for the budget.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await authAPI.updateProfile({ monthly_budget: budgetValue });
      updateUser(updatedUser);
      setIsBudgetDialogOpen(false);
      toast({
        title: "Success",
        description: "Monthly budget updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update budget.",
        variant: "destructive",
      });
    }
  };

  const openBudgetDialog = () => {
    setNewBudget(user?.monthly_budget?.toString() || "");
    setIsBudgetDialogOpen(true);
  };

  const stats = [
    {
      label: "Today's Total",
      value: todayTotal,
      icon: Calendar,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Weekly Total",
      value: weeklyTotal,
      icon: CalendarDays,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Monthly Total",
      value: monthlyTotal,
      icon: TrendingUp,
      color: "from-violet-500 to-purple-500",
    },
    {
      label: "Total Expense",
      value: totalExpense,
      icon: Wallet,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Meals Total",
      value: mealsTotal,
      icon: Utensils,
      color: "from-red-500 to-orange-500",
    },
    {
      label: "Average Meals Total",
      value: averageMealsTotal,
      icon: Scale,
      color: "from-green-500 to-lime-500",
    },
    {
      label: "Others Total",
      value: othersTotal,
      icon: ShoppingBag,
      color: "from-pink-500 to-rose-500",
    },
    {
      label: "Room Rent",
      value: roomRents?.reduce((sum, rent) => sum + rent.cost, 0) || 0,
      icon: Home,
      color: "from-cyan-500 to-sky-500",
    },
    {
      label: "Total Days",
      value: totalDays,
      icon: Hash,
      color: "from-indigo-500 to-blue-500",
      isCount: true,
    },
  ];

  return (
    <div>
      <Card className="mb-8 overflow-hidden border-none shadow-xl bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium">Monthly Budget Overview</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={openBudgetDialog}
            className="hover:bg-primary/20 rounded-full"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PiggyBank className="h-4 w-4 text-blue-500" />
                Monthly Budget
              </div>
              <div className="text-2xl font-bold">
                AED {user?.monthly_budget?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 text-orange-500" />
                Spent This Month
              </div>
              <div className="text-2xl font-bold">
                AED {monthlyTotal.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4 text-green-500" />
                Remaining
              </div>
              <div className={`text-2xl font-bold ${(user?.monthly_budget || 0) - monthlyTotal < 0 ? "text-red-500" : "text-green-500"}`}>
                AED {((user?.monthly_budget || 0) - monthlyTotal).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="relative pt-2">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium">Progress</span>
              <span className="font-medium">
                {user?.monthly_budget
                  ? `${Math.min((monthlyTotal / user.monthly_budget) * 100, 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
            <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full transition-all duration-500 rounded-full shadow-lg ${(user?.monthly_budget || 0) > 0 && monthlyTotal > (user?.monthly_budget || 0)
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  }`}
                style={{
                  width: `${user?.monthly_budget ? Math.min((monthlyTotal / user.monthly_budget) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            style={{ animationDelay: `${index * 0.1}s` }}
            className={`card-glass rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 animate-scale-in group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {stat.label}
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {stat.isCount ? stat.value : `AED ${stat.value.toFixed(2)}`}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center flex justify-center gap-4 flex-wrap">
        <Button onClick={onDownloadAll}>
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".html"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              if (e.target.files?.[0]) onImport(e.target.files[0]);
              e.target.value = ''; // reset
            }}
          />
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import HTML
          </Button>
        </div>
        <Button variant="destructive" onClick={onReset}>
          <Trash2 className="mr-2 h-4 w-4" />
          Reset Data
        </Button>
      </div>

      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Monthly Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget (AED)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter your budget"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleUpdateBudget}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
