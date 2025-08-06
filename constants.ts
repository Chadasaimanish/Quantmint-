import { FinancialData } from './types';

export const INITIAL_FINANCIAL_DATA: FinancialData = {
  income: 100000,
  expenses: [
    { category: "Housing", amount: 25000 },
    { category: "Transportation", amount: 5000 },
    { category: "Food", amount: 10000 },
    { category: "Utilities", amount: 5000 },
    { category: "Entertainment", amount: 5000 },
    { category: "Healthcare", amount: 4000 },
    { category: "Personal Care", amount: 3000 },
    { category: "Debt Payments", amount: 10000 },
  ],
};

export const CHART_COLORS = [
  '#06B6D4', '#D946EF', '#A3E635', '#F97316', '#3B82F6', '#EF4444', '#F59E0B', '#6366F1'
];