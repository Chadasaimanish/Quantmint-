export interface BudgetItem {
  category: string;
  amount: number;
}

export interface FinancialData {
  income: number;
  expenses: BudgetItem[];
}

export interface OptimizationResult {
  optimizedBudget: BudgetItem[];
  insights: string[];
}

export type ScenarioGoal = 'increase_savings' | 'handle_new_expense' | 'handle_rent_increase';

export interface StructuredScenario {
  goal: ScenarioGoal;
  amount: number; // e.g., target savings amount, new expense amount, percentage rent increase
  description: string;
}

export interface User {
  email: string;
  password: string; // In a real app, this would be a hash
}

export interface SpendingSuggestion {
  suggestion: string;
  rationale: string;
}
