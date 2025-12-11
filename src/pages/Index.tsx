import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BudgetSummary } from "@/components/BudgetSummary";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet } from "lucide-react";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useRoomRents, useCreateRoomRent, useUpdateRoomRent, useDeleteRoomRent } from "@/hooks/useRoomRents";
import { useBudgetHistory, useMonthHistory, useArchiveMonth } from "@/hooks/useBudgetHistory";
import { useToast } from "@/hooks/use-toast";
import { expensesAPI } from "@/lib/api";

export interface Expense {
  id: string;
  date: string;
  item: string;
  cost: number;
  description?: string;
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [historyToView, setHistoryToView] = useState<{
    month: string;
    expenses: Expense[];
  } | null>(null);

  // Fetch data using React Query
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: roomRents = [], isLoading: roomRentsLoading } = useRoomRents();
  const { data: budgetHistory = {} } = useBudgetHistory();
  const { data: monthHistoryData } = useMonthHistory(historyToView?.month || null);

  // Mutations
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createRoomRent = useCreateRoomRent();
  const updateRoomRent = useUpdateRoomRent();
  const deleteRoomRent = useDeleteRoomRent();
  const archiveMonth = useArchiveMonth();

  const addExpense = (expense: Omit<Expense, "id">) => {
    createExpense.mutate(expense, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Expense added successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add expense: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  const addRoomRent = (expense: Omit<Expense, "id">) => {
    createRoomRent.mutate(expense, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Room rent added successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add room rent: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  const handleUpdateExpense = (id: string, updatedExpense: Omit<Expense, "id">) => {
    // Check if it's a room rent or regular expense
    const isRoomRent = roomRents.find((rent) => rent.id === id);

    if (isRoomRent) {
      updateRoomRent.mutate(
        { id, data: updatedExpense },
        {
          onSuccess: () => {
            setEditingExpense(null);
            toast({
              title: "Success",
              description: "Room rent updated successfully",
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: `Failed to update: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      updateExpense.mutate(
        { id, data: updatedExpense },
        {
          onSuccess: () => {
            setEditingExpense(null);
            toast({
              title: "Success",
              description: "Expense updated successfully",
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: `Failed to update: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const handleDeleteExpense = (id: string) => {
    const isRoomRent = roomRents.find((rent) => rent.id === id);

    if (isRoomRent) {
      deleteRoomRent.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Room rent deleted successfully",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete: ${error.message}`,
            variant: "destructive",
          });
        },
      });
    } else {
      deleteExpense.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Expense deleted successfully",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete: ${error.message}`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleArchiveMonth = (month?: string) => {
    const monthToArchive = month || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    archiveMonth.mutate(monthToArchive, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Month ${monthToArchive} archived successfully`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to archive month: ${(error as Error).message}`,
          variant: "destructive",
        });
      },
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };


  const handleReset = async () => {
    toast({
      title: "Resetting Data",
      description: "Please wait while we clear all your data...",
    });

    try {
      await expensesAPI.deleteAll();
      toast({
        title: "Reset Successful",
        description: "All your data has been cleared. The page will now reload.",
      });
      // Invalidate all queries to refresh UI
      setTimeout(() => {
        window.location.reload(); // Simplest way to ensure clean slate
      }, 1500);
    } catch (err) {
      toast({
        title: "Reset Failed",
        description: `Failed to reset data: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      const dateGroups = doc.querySelectorAll(".date-group");
      const expensesToCreate: { date: string; item: string; cost: number; description?: string }[] = [];

      // 1. Parse all items first
      for (const group of Array.from(dateGroups)) {
        const dateHeader = group.querySelector(".date-header")?.textContent?.trim();
        if (!dateHeader) continue;

        const dateObj = new Date(dateHeader);
        if (isNaN(dateObj.getTime())) continue;

        // Use local calendar getters to avoid timezone shifting
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const items = group.querySelectorAll(".expense-item");

        for (const item of Array.from(items)) {
          const nameEl = item.querySelector(".item-name");
          if (!nameEl) continue;

          const itemName = nameEl.textContent?.trim() || "Unknown";
          const description = item.querySelector(".item-description")?.textContent?.trim();
          const costStr = item.querySelector(".item-cost")?.textContent?.trim() || "0";
          const cost = parseFloat(costStr.replace(/[^0-9.]/g, ""));

          if (!itemName || isNaN(cost)) continue;

          expensesToCreate.push({
            date: dateStr,
            item: itemName,
            cost: cost,
            description: description
          });
        }
      }

      if (expensesToCreate.length === 0) {
        toast({
          title: "Import Failed",
          description: "No expenses found to import.",
          variant: "destructive"
        });
        return;
      }

      console.log(`📦 Found ${expensesToCreate.length} expenses to import:`, expensesToCreate);

      toast({
        title: "Importing...",
        description: `Found ${expensesToCreate.length} expenses. Processing...`,
      });

      // 2. Process in batches to prevent overload but maintain speed
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const BATCH_SIZE = 5;

      for (let i = 0; i < expensesToCreate.length; i += BATCH_SIZE) {
        const batch = expensesToCreate.slice(i, i + BATCH_SIZE);
        console.log(`📊 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batch);

        await Promise.all(batch.map(async (exp, idx) => {
          try {
            console.log(`⏳ Importing expense ${i + idx + 1}/${expensesToCreate.length}:`, exp);
            const result = await createExpense.mutateAsync(exp);
            console.log(`✅ Successfully imported:`, exp, result);
            successCount++;
          } catch (err) {
            errorCount++;
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`❌ Failed to import expense ${i + idx + 1}:`, exp, "Error:", errorMsg);
            errors.push(`${exp.item} (${exp.date}): ${errorMsg}`);
          }
        }));
      }

      console.log(`✨ Import complete! Success: ${successCount}, Failed: ${errorCount}`);

      if (successCount > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} out of ${expensesToCreate.length} expenses.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: `Failed to import any expenses. ${errors.length > 0 ? 'First error: ' + errors[0] : 'Check console for details.'}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("💥 Import error:", error);
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to parse the file.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const allExpenses = [...expenses, ...roomRents];
    const grouped = allExpenses.reduce((acc, exp) => {
      if (!acc[exp.date]) acc[exp.date] = [];
      acc[exp.date].push(exp);
      return acc;
    }, {} as Record<string, Expense[]>);

    let total = 0;
    let mealTotal = 0;
    let otherTotal = 0;
    let roomRentTotal = 0;

    // Calculate comprehensive statistics - MATCHING APP LOGIC
    allExpenses.forEach(exp => {
      total += exp.cost;
    });

    // Meals: exact match for Breakfast, Lunch, Dinner, Snacks (matching BudgetSummary.tsx line 69)
    mealTotal = allExpenses
      .filter((e) => ["Breakfast", "Lunch", "Dinner", "Snacks"].includes(e.item))
      .reduce((sum, e) => sum + e.cost, 0);

    // Others: exact match for "Others" (matching BudgetSummary.tsx line 75)
    otherTotal = allExpenses
      .filter((e) => e.item === "Others")
      .reduce((sum, e) => sum + e.cost, 0);

    // Room Rent: from roomRents array
    roomRentTotal = roomRents?.reduce((sum, rent) => sum + rent.cost, 0) || 0;

    // Total Days: unique dates excluding "Others" items (matching BudgetSummary.tsx line 58-60)
    const totalDays = new Set(
      allExpenses.filter((e) => e.item !== "Others").map((e) => e.date)
    ).size;

    const uniqueDays = Object.keys(grouped).length;
    const averageDaily = totalDays > 0 ? total / totalDays : 0;
    const averageMeals = totalDays > 0 ? mealTotal / totalDays : 0;
    const highestExpense = allExpenses.length > 0
      ? Math.max(...allExpenses.map(e => e.cost))
      : 0;
    const lowestExpense = allExpenses.length > 0
      ? Math.min(...allExpenses.map(e => e.cost))
      : 0;

    // Generate beautiful HTML invoice
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Invoice - ${new Date().toLocaleDateString()}</title>

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #f2f4f7;
            padding: 40px 20px;
        }

        .invoice-container {
            max-width: 1100px;
            margin: 0 auto;
            background: white;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
        }

        /* ---------- HEADER ---------- */
        .invoice-header {
            background: #ffffff;
            border-bottom: 2px solid #e0e0e0;
            padding: 25px 40px;
            text-align: left;
        }

        .invoice-header h1 {
            font-size: 26px;
            font-weight: 700;
            color: #333;
            margin-bottom: 4px;
        }

        .invoice-header p {
            font-size: 14px;
            color: #777;
        }

        /* ---------- INFO GRID ---------- */
        .invoice-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
            padding: 25px 40px;
            border-bottom: 1px solid #e6e6e6;
        }

        .info-box h3 {
            font-size: 12px;
            color: #555;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .info-box p {
            font-size: 16px;
            font-weight: 600;
            color: #222;
        }

        /* ---------- SUMMARY BOXES ---------- */
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px 40px;
            border-bottom: 1px solid #e6e6e6;
        }

        .summary-card {
            border: 1px solid #dcdcdc;
            padding: 16px;
            background: #fafafa;
            border-radius: 4px;
        }

        .summary-card h4 {
            font-size: 12px;
            text-transform: uppercase;
            color: #555;
            margin-bottom: 6px;
        }

        .summary-card .amount {
            font-size: 22px;
            font-weight: 700;
            color: #222;
        }

        /* ---------- TABLE SECTION ---------- */
        .expenses-table {
            padding: 30px 40px;
        }

        .expenses-table h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #333;
        }

        .date-group { margin-bottom: 30px; }

        .date-header {
            background: #efefef;
            color: #222;
            padding: 10px 15px;
            font-weight: 600;
            border: 1px solid #dcdcdc;
            border-radius: 3px;
            margin-bottom: 10px;
        }

        .expense-item {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            padding: 12px 15px;
            border: 1px solid #e6e6e6;
            margin-bottom: 6px;
            border-radius: 3px;
            background: #fff;
        }

        .expense-item:nth-child(even) {
            background: #f9f9f9;
        }

        .item-name {
            font-weight: 600;
            color: #222;
            margin-bottom: 4px;
        }

        .item-description {
            font-size: 12px;
            color: #666;
        }

        .item-cost {
            text-align: right;
            font-weight: 700;
            font-size: 16px;
        }

        .daily-total {
            display: flex;
            justify-content: space-between;
            padding: 12px 15px;
            background: #f8f8f8;
            border: 1px solid #e0e0e0;
            font-weight: 600;
            border-radius: 3px;
            margin-top: 5px;
        }

        /* ---------- GRAND TOTAL ---------- */
        .grand-total {
            background: #fff8d6;
            border-top: 2px solid #e6d47b;
            padding: 25px 40px;
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .grand-total h3 {
            font-size: 18px;
            color: #444;
        }

        .grand-total .total-amount {
            font-size: 32px;
            color: #000;
            font-weight: 700;
        }

        /* ---------- FOOTER ---------- */
        .footer {
            text-align: center;
            padding: 16px;
            font-size: 12px;
            color: #777;
            background: #f2f2f2;
            border-top: 1px solid #e6e6e6;
        }

        /* ---------- RESPONSIVE DESIGN ---------- */
        /* Tablet (768px and below) */
        @media (max-width: 768px) {
            body {
                padding: 20px 10px;
            }

            .invoice-header {
                padding: 20px 20px;
            }

            .invoice-header h1 {
                font-size: 22px;
            }

            .invoice-info {
                grid-template-columns: 1fr;
                gap: 15px;
                padding: 20px 20px;
            }

            .summary-cards {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                padding: 20px 20px;
            }

            .expenses-table {
                padding: 20px 20px;
            }

            .grand-total {
                padding: 20px 20px;
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
        }

        /* Mobile (480px and below) */
        @media (max-width: 480px) {
            body {
                padding: 10px 5px;
            }

            .invoice-container {
                border-radius: 4px;
            }

            .invoice-header {
                padding: 15px 15px;
            }

            .invoice-header h1 {
                font-size: 20px;
            }

            .invoice-header p {
                font-size: 12px;
            }

            .invoice-info {
                padding: 15px 15px;
                gap: 12px;
            }

            .info-box h3 {
                font-size: 11px;
            }

            .info-box p {
                font-size: 14px;
            }

            .summary-cards {
                grid-template-columns: 1fr;
                padding: 15px 15px;
                gap: 12px;
            }

            .summary-card {
                padding: 12px;
            }

            .summary-card h4 {
                font-size: 11px;
            }

            .summary-card .amount {
                font-size: 18px;
            }

            .expenses-table {
                padding: 15px 15px;
            }

            .expenses-table h2 {
                font-size: 18px;
            }

            .date-header {
                padding: 8px 12px;
                font-size: 14px;
            }

            .expense-item {
                grid-template-columns: 1fr;
                padding: 10px 12px;
                gap: 8px;
            }

            .item-name {
                font-size: 14px;
            }

            .item-description {
                font-size: 11px;
            }

            .item-cost {
                text-align: left;
                font-size: 15px;
            }

            .daily-total {
                padding: 10px 12px;
                font-size: 14px;
            }

            .grand-total {
                padding: 15px 15px;
            }

            .grand-total h3 {
                font-size: 16px;
            }

            .grand-total .total-amount {
                font-size: 24px;
            }

            .footer {
                font-size: 11px;
                padding: 12px;
            }
        }

        @media print {
            body { background: white; padding: 0; }
            .invoice-container { border: none; }
        }
    </style>
</head>

<body>

    <div class="invoice-container">

        <div class="invoice-header">
            <h1>Expense Invoice</h1>
            <p>Comprehensive Expense Report</p>
        </div>

        <div class="invoice-info">
            <div class="info-box">
                <h3>Invoice Date</h3>
                <p>${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
            </div>

            <div class="info-box">
                <h3>Average Meals/Day</h3>
                <p>${averageMeals.toFixed(2)} AED</p>
            </div>

            <div class="info-box">
                <h3>Total Days</h3>
                <p>${totalDays} Days</p>
            </div>
        </div>

        <div class="summary-cards">
            <div class="summary-card">
                <h4>Meals Total</h4>
                <div class="amount">${mealTotal.toFixed(2)} AED</div>
            </div>
            <div class="summary-card">
                <h4>Other Expenses</h4>
                <div class="amount">${otherTotal.toFixed(2)} AED</div>
            </div>
            <div class="summary-card">
                <h4>Room Rent</h4>
                <div class="amount">${roomRentTotal.toFixed(2)} AED</div>
            </div>
            <div class="summary-card">
                <h4>Grand Total</h4>
                <div class="amount">${total.toFixed(2)} AED</div>
            </div>
        </div>

        <div class="expenses-table">
            <h2>Detailed Breakdown</h2>

            ${Object.keys(grouped)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map(date => {
          const dateExpenses = grouped[date];
          const dailyTotal = dateExpenses.reduce((sum, exp) => sum + exp.cost, 0);

          return `
                        <div class="date-group">
                            <div class="date-header">
                                ${new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
                            </div>

                            ${dateExpenses
              .map(
                exp => `
                                <div class="expense-item">
                                    <div>
                                        <div class="item-name">${exp.item}</div>
                                        ${exp.description
                    ? `<div class="item-description">${exp.description}</div>`
                    : ""
                  }
                                    </div>

                                    <div></div>

                                    <div class="item-cost">${exp.cost.toFixed(2)} AED</div>
                                </div>`
              )
              .join("")}

                            <div class="daily-total">
                                <span>Daily Total</span>
                                <span>${dailyTotal.toFixed(2)} AED</span>
                            </div>
                        </div>
                    `;
        })
        .join("")}
        </div>

        <div class="grand-total">
            <h3>Total Reimbursement</h3>
            <div class="total-amount">${total.toFixed(2)} AED</div>
        </div>

        <div class="footer">
            Generated in Daily Budget Tracker by Justin B Shajan • ${new Date().toLocaleString()}
        </div>
    </div>

</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-invoice-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update history view when month history data is loaded
  if (monthHistoryData && historyToView) {
    if (JSON.stringify(monthHistoryData.expenses) !== JSON.stringify(historyToView.expenses)) {
      setHistoryToView({
        month: historyToView.month,
        expenses: monthHistoryData.expenses || [],
      });
    }
  }

  if (expensesLoading || roomRentsLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-2">
            Hello, {user?.username || "Guest"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your daily food & other expenses with style
          </p>
        </header>

        {/* Summary Cards */}
        <div
          style={{ animationDelay: "0.1s" }}
          className="mb-8 animate-fade-in-up"
        >
          <BudgetSummary
            expenses={expenses}
            roomRents={roomRents}
            onDownloadAll={handleDownload}
            onImport={handleImport}
            onReset={handleReset}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div
            style={{ animationDelay: "0.2s" }}
            className="animate-fade-in-up"
          >
            <ExpenseForm
              onSubmit={
                editingExpense
                  ? (expense) => handleUpdateExpense(editingExpense.id, expense)
                  : addExpense
              }
              onAddRoomRent={addRoomRent}
              editingExpense={editingExpense}
              onCancelEdit={() => setEditingExpense(null)}
            />
          </div>
          <div
            style={{ animationDelay: "0.3s" }}
            className="animate-fade-in-up"
          >
            <ExpenseList
              expenses={[...expenses, ...roomRents].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              )}
              onEdit={handleEdit}
              onDelete={handleDeleteExpense}
              onDownload={handleDownload}
            />
          </div>
        </div>

        {/* Monthly History Section */}
        <div
          style={{ animationDelay: "0.4s" }}
          className="mt-12 animate-fade-in-up"
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Archive</CardTitle>
              <CardDescription>
                Summary of your expenses from previous months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(budgetHistory).length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {roomRents.length > 0 ? (
                    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col">
                      <h3 className="font-bold text-lg mb-2 text-primary">
                        Room Rent
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground flex-grow">
                        <p>
                          <span className="font-medium">Total:</span>{" "}
                          {roomRents
                            .reduce((acc, rent) => acc + rent.cost, 0)
                            .toFixed(2)}{" "}
                          AED
                        </p>
                        {roomRents.map((rent) => (
                          <p key={rent.id}>
                            <span className="font-medium">Due Date:</span>{" "}
                            {rent.date}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col">
                      <h3 className="font-bold text-lg mb-2 text-primary">
                        Room Rent
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground flex-grow">
                        <p>
                          <span className="font-medium">Total:</span> Not set
                        </p>
                        <p>
                          <span className="font-medium">Due Date:</span> Not set
                        </p>
                      </div>
                    </div>
                  )}
                  {Object.entries(budgetHistory)
                    .reverse()
                    .map(([month, data]: [string, { summary: { monthlyTotal: number; mealsTotal: number; averageMealsTotal: number } }]) => (
                      <div
                        key={month}
                        className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col"
                      >
                        <h3 className="font-bold text-lg mb-2 text-primary">
                          {new Date(`${month}-02`).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground flex-grow">
                          <p>
                            <span className="font-medium">Total:</span>{" "}
                            {data.summary.monthlyTotal.toFixed(2)} AED
                          </p>
                          <p>
                            <span className="font-medium">Meals:</span>{" "}
                            {data.summary.mealsTotal.toFixed(2)} AED
                          </p>
                          <p>
                            <span className="font-medium">Avg Meal/Day:</span>{" "}
                            {data.summary.averageMealsTotal.toFixed(2)} AED
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() =>
                            setHistoryToView({
                              month: month,
                              expenses: [],
                            })
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    No history has been archived yet.
                  </p>
                  <Button onClick={() => handleArchiveMonth()} variant="default">
                    Archive Previous Month
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for Viewing History Details */}
      <Dialog
        open={historyToView !== null}
        onOpenChange={(isOpen) => !isOpen && setHistoryToView(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Expense Details for{" "}
              {historyToView
                ? new Date(`${historyToView.month}-02`).toLocaleString(
                  "default",
                  { month: "long", year: "numeric" }
                )
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Cost (AED)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyToView?.expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.date}</TableCell>
                    <TableCell className="font-medium">{exp.item}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {exp.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {exp.cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;