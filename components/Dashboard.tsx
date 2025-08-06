import React, { useState, useCallback, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { BudgetChart } from './BudgetChart';
import { runOptimization } from '../services/optimizationService';
import { getSpendingSuggestions } from '../services/geminiService';
import { dbService } from '../services/dbService';
import type { FinancialData, OptimizationResult, BudgetItem, StructuredScenario, ScenarioGoal, SpendingSuggestion } from '../types';

const InsightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707.707M6.343 17.657l-.707.707m12.728 0l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m11-13v4m-2-2h4m-3 10h.01M12 21h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const scenarioOptions: { value: ScenarioGoal; label: string; amountLabel: string; amountType: string }[] = [
    { value: 'handle_rent_increase', label: 'Handle a rent increase', amountLabel: 'Increase %', amountType: 'percentage'},
    { value: 'increase_savings', label: 'Increase monthly savings goal', amountLabel: 'Target Savings (₹)', amountType: 'currency'},
    { value: 'handle_new_expense', label: 'Add a new monthly expense', amountLabel: 'Expense Amount (₹)', amountType: 'currency'},
];

export const Dashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>(dbService.loadFinancialData());
  
  const [scenarioGoal, setScenarioGoal] = useState<ScenarioGoal>('handle_rent_increase');
  const [scenarioAmount, setScenarioAmount] = useState<number>(10);

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userInterests, setUserInterests] = useState('');
  const [suggestions, setSuggestions] = useState<SpendingSuggestion[] | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    dbService.saveFinancialData(financialData);
  }, [financialData]);

  const handleOptimization = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOptimizationResult(null);

    const scenarioConfig = scenarioOptions.find(s => s.value === scenarioGoal)!;
    const scenario: StructuredScenario = {
        goal: scenarioGoal,
        amount: scenarioAmount,
        description: `${scenarioConfig.label}: ${scenarioAmount}${scenarioConfig.amountType === 'percentage' ? '%' : '₹'}`
    };

    try {
      const result = await runOptimization(financialData, scenario);
      setOptimizationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [financialData, scenarioGoal, scenarioAmount]);
  
  const handleGetSuggestions = useCallback(async () => {
      const currentSurplus = financialData.income - financialData.expenses.reduce((sum, item) => sum + item.amount, 0);
      if (currentSurplus <= 0) return;

      setIsSuggesting(true);
      setSuggestionError(null);
      setSuggestions(null);

      try {
          const result = await getSpendingSuggestions(currentSurplus, userInterests);
          setSuggestions(result);
      } catch (err) {
          setSuggestionError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsSuggesting(false);
      }
  }, [financialData, userInterests]);


  const handleExpenseChange = (index: number, newAmount: number) => {
    const newExpenses = [...financialData.expenses];
    newExpenses[index].amount = newAmount;
    setFinancialData(prev => ({...prev, expenses: newExpenses}));
  };

  const currentTotalExpenses = financialData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const currentSurplus = financialData.income - currentTotalExpenses;

  const optimizedTotalExpenses = optimizationResult?.optimizedBudget.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const optimizedSurplus = optimizationResult ? financialData.income - optimizedTotalExpenses : 0;
  const projectedSavingsIncrease = optimizationResult ? optimizedSurplus - currentSurplus : 0;

  const selectedScenarioConfig = scenarioOptions.find(s => s.value === scenarioGoal)!;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      <Card className="border-t-4 border-primary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="scenario-goal" className="block text-sm font-medium text-gray-300 mb-1">
                "What If" Scenario
                </label>
                <select 
                    id="scenario-goal"
                    className="w-full p-3 h-[46px] text-white bg-base-300 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={scenarioGoal}
                    onChange={e => setScenarioGoal(e.target.value as ScenarioGoal)}
                >
                    {scenarioOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="scenario-amount" className="block text-sm font-medium text-gray-300 mb-1">
                  {selectedScenarioConfig.amountLabel}
                </label>
                <input
                  id="scenario-amount"
                  type="number"
                  className="w-full p-2.5 h-[46px] text-white bg-base-300 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={scenarioAmount}
                  onChange={(e) => setScenarioAmount(Number(e.target.value))}
                />
            </div>
          </div>
          <Button onClick={handleOptimization} isLoading={isLoading}>
            {isLoading ? 'Optimizing...' : 'Run Simulation'}
          </Button>
        </div>
        {error && <p className="text-error text-center mt-4">{error}</p>}
      </Card>
      
      {optimizationResult && !isLoading && (
        <div className="animate-slide-in-up">
            <Card className="mb-8 border-t-4 border-accent">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Optimization Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-base-300 p-4 rounded-lg">
                        <p className="text-gray-400">Current Monthly Surplus</p>
                        <p className="text-2xl font-bold text-warning">₹{currentSurplus.toFixed(2)}</p>
                    </div>
                    <div className="bg-base-300 p-4 rounded-lg">
                        <p className="text-gray-400">Optimized Monthly Surplus</p>
                        <p className={`text-2xl font-bold ${optimizedSurplus >= 0 ? 'text-success' : 'text-error'}`}>₹{optimizedSurplus.toFixed(2)}</p>
                    </div>
                     <div className="bg-base-300 p-4 rounded-lg">
                        <p className="text-gray-400">Additional Monthly Savings</p>
                        <p className={`text-2xl font-bold ${projectedSavingsIncrease >= 0 ? 'text-accent' : 'text-error'}`}>₹{projectedSavingsIncrease.toFixed(2)}</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3">
                    <h3 className="text-xl font-semibold text-white mb-4">Actionable Insights</h3>
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {optimizationResult.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-base-300 rounded-md">
                                <InsightIcon />
                                <span className="text-gray-300">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card className="lg:col-span-2">
                    <BudgetChart title="Optimized Budget" data={optimizationResult.optimizedBudget} />
                </Card>
            </div>
        </div>
      )}

      <Card className="border-t-4 border-secondary">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold text-white mb-4">Current Monthly Budget</h2>
                <div className="mb-4">
                    <label htmlFor="income" className="block text-sm font-medium text-gray-300 mb-1">Monthly Income</label>
                    <input type="number" id="income" value={financialData.income} onChange={e => setFinancialData(prev => ({...prev, income: Number(e.target.value)}))} className="w-full md:w-1/2 p-2 bg-base-300 rounded-md border border-gray-600"/>
                </div>
                 <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {financialData.expenses.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 items-center">
                            <span className="col-span-1 text-gray-300 truncate" title={item.category}>{item.category}</span>
                            <input type="range" min="0" max={financialData.income} value={item.amount} onChange={e => handleExpenseChange(index, Number(e.target.value))} className="col-span-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-primary"/>
                            <div className="col-span-1 flex items-center gap-2">
                               <span>₹</span> 
                               <input type="number" value={item.amount} onChange={e => handleExpenseChange(index, Number(e.target.value))} className="w-full p-1 bg-base-300 rounded-md border border-gray-600"/>
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="mt-4 pt-4 border-t border-base-300 text-right font-bold">
                    <p>Total Expenses: <span className="text-warning">₹{currentTotalExpenses.toFixed(2)}</span></p>
                    <p>Remaining Surplus: <span className={currentSurplus >= 0 ? 'text-success' : 'text-error'}>₹{currentSurplus.toFixed(2)}</span></p>
                 </div>
            </div>
            <div className="lg:col-span-2">
                <BudgetChart title="Current Budget" data={financialData.expenses} />
            </div>
        </div>
      </Card>
      
       <Card className="border-t-4 border-primary">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><SparklesIcon /> Spend Smarter</h2>
            <p className="text-gray-400 mb-4">Have a surplus? Get AI-powered ideas on how to spend or invest it wisely.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="user-interests" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Interests (optional)
                    </label>
                    <input
                      id="user-interests"
                      type="text"
                      placeholder="e.g., travel, technology, fitness"
                      className="w-full p-2.5 h-[46px] text-white bg-base-300 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={userInterests}
                      onChange={(e) => setUserInterests(e.target.value)}
                    />
                </div>
                <Button onClick={handleGetSuggestions} isLoading={isSuggesting} disabled={currentSurplus <= 0}>
                    {isSuggesting ? 'Getting Ideas...' : 'Get Spending Ideas'}
                </Button>
            </div>
            {suggestionError && <p className="text-error text-center mt-4">{suggestionError}</p>}
            {currentSurplus <= 0 && <p className="text-warning text-center mt-4">You need a budget surplus to get spending ideas.</p>}
            
            {suggestions && !isSuggesting && (
                 <div className="mt-6 animate-fade-in space-y-4">
                    <h3 className="text-xl font-semibold text-white">Here are a few ideas:</h3>
                    <ul className="space-y-3">
                        {suggestions.map((item, index) => (
                            <li key={index} className="p-4 bg-base-300 rounded-lg">
                                <p className="font-bold text-primary">{item.suggestion}</p>
                                <p className="text-gray-400 mt-1">{item.rationale}</p>
                            </li>
                        ))}
                    </ul>
                 </div>
            )}
       </Card>
    </div>
  );
};