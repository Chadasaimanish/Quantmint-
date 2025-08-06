
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetItem } from '../types';
import { CHART_COLORS } from '../constants';

interface BudgetChartProps {
  data: BudgetItem[];
  title: string;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ data, title }) => {
  const total = data.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="h-96 w-full">
        <h3 className="text-xl font-semibold text-center text-white mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Tooltip
                contentStyle={{ 
                    backgroundColor: '#374151', /* base-200 */
                    borderColor: '#4B5563', /* base-300 */
                    borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#E5E7EB' }}
                formatter={(value: number) => `₹${value.toFixed(2)}`}
            />
            <Legend formatter={(value) => <span className="text-gray-300">{value}</span>} />
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
            >
                {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
            </Pie>
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};
