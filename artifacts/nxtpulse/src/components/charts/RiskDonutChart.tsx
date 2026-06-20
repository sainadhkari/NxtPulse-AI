import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface RiskDonutChartProps {
  data: {
    high: number;
    medium: number;
    low: number;
  };
}

export function RiskDonutChart({ data }: RiskDonutChartProps) {
  const chartData = [
    { name: "High Risk", value: data.high, color: "hsl(var(--destructive))" },
    { name: "Medium Risk", value: data.medium, color: "hsl(var(--chart-4))" },
    { name: "Low Risk", value: data.low, color: "hsl(var(--chart-3))" }
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
