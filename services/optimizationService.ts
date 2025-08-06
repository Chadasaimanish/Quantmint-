import type { FinancialData, OptimizationResult, StructuredScenario, BudgetItem } from '../types';

// These categories are considered more flexible for reductions.
const FLEXIBLE_CATEGORIES = ["Entertainment", "Food", "Personal Care", "Transportation"];

// A mock backend service that simulates the quantum-inspired optimization.
export function runOptimization(
  currentData: FinancialData,
  scenario: StructuredScenario
): Promise<OptimizationResult> {
  // Simulate network delay and processing time
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = generateOptimizedBudget(currentData, scenario);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 1000); // 1 second delay
  });
}

function generateOptimizedBudget(
    currentData: FinancialData,
    scenario: StructuredScenario
): OptimizationResult {
    let newBudgetData = JSON.parse(JSON.stringify(currentData.expenses)) as BudgetItem[];
    const insights: string[] = [];
    const { income } = currentData;
    const currentTotalExpenses = currentData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const currentSavings = income - currentTotalExpenses;

    // Handle different scenarios
    switch (scenario.goal) {
        case 'handle_rent_increase': {
            const housingIndex = newBudgetData.findIndex(item => item.category === 'Housing');
            if (housingIndex !== -1) {
                const originalRent = newBudgetData[housingIndex].amount;
                const increaseAmount = originalRent * (scenario.amount / 100);
                newBudgetData[housingIndex].amount += increaseAmount;
                insights.push(`Housing cost increased by ₹${increaseAmount.toFixed(2)} due to a ${scenario.amount}% rent hike.`);
                
                const reductionResult = reduceFlexibleSpending(newBudgetData, increaseAmount);
                newBudgetData = reductionResult.budget;
                insights.push(...reductionResult.insights);

            } else {
                insights.push("Could not find 'Housing' category to apply rent increase.");
            }
            break;
        }

        case 'increase_savings': {
            const targetSavings = scenario.amount;
            const requiredReduction = targetSavings - currentSavings;
            if (requiredReduction <= 0) {
                insights.push(`You are already meeting your savings goal of ₹${targetSavings.toFixed(2)}.`);
                break;
            }
            insights.push(`To reach your goal of saving ₹${targetSavings.toFixed(2)}, you need to reduce spending by ₹${requiredReduction.toFixed(2)}.`);
            const reductionResult = reduceFlexibleSpending(newBudgetData, requiredReduction);
            newBudgetData = reductionResult.budget;
            insights.push(...reductionResult.insights);
            break;
        }

        case 'handle_new_expense': {
            const newExpense: BudgetItem = { category: "New Monthly Expense", amount: scenario.amount };
            newBudgetData.push(newExpense);
            insights.push(`Added a new expense of ₹${scenario.amount.toFixed(2)}.`);
            
            const reductionResult = reduceFlexibleSpending(newBudgetData, scenario.amount);
            newBudgetData = reductionResult.budget;
            insights.push(...reductionResult.insights);
            break;
        }
    }
    
    const newTotalExpenses = newBudgetData.reduce((sum, item) => sum + item.amount, 0);
    if (income - newTotalExpenses < 0) {
        insights.push("Warning: Your optimized expenses exceed your income. Further adjustments are needed.");
    }

    return {
        optimizedBudget: newBudgetData,
        insights,
    };
}


function reduceFlexibleSpending(budget: BudgetItem[], amountToReduce: number): { budget: BudgetItem[], insights: string[] } {
    const newBudget = JSON.parse(JSON.stringify(budget)) as BudgetItem[];
    const insights: string[] = [];
    let totalReduction = 0;

    const flexibleItems = newBudget.filter(item => FLEXIBLE_CATEGORIES.includes(item.category));
    const totalFlexibleAmount = flexibleItems.reduce((sum, item) => sum + item.amount, 0);

    if (totalFlexibleAmount < amountToReduce) {
        insights.push(`Unable to fully offset ₹${amountToReduce.toFixed(2)} from flexible categories alone. You may need to review fixed expenses.`);
    }
    
    let amountStillToReduce = amountToReduce;

    for (const item of flexibleItems) {
        if (amountStillToReduce <= 0) break;
        
        const proportion = totalFlexibleAmount > 0 ? item.amount / totalFlexibleAmount : 0;
        // Reduce proportionally, but don't take more than 80% of the item's value or more than needed.
        const reduction = Math.min(item.amount * 0.8, proportion * amountToReduce, amountStillToReduce);
        
        if (reduction > 0) {
            item.amount -= reduction;
            totalReduction += reduction;
            amountStillToReduce -= reduction;
            insights.push(`Reduced ${item.category} by ₹${reduction.toFixed(2)}.`);
        }
    }
    
    if(totalReduction > 0) {
        insights.push(`Total spending was automatically reduced by ₹${totalReduction.toFixed(2)} to accommodate the scenario.`);
    }

    return { budget: newBudget, insights };
}
