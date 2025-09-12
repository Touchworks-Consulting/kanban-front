import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

interface DailyLeadsChartProps {
  data: Array<{
    date: string;
    leads: number;
    day: string;
  }>;
  title?: string;
  description?: string;
}

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(210, 100%, 58%)", // Azul vibrante como no exemplo
  },
} satisfies ChartConfig;

export const DailyLeadsChart: React.FC<DailyLeadsChartProps> = ({
  data,
  title = "Leads por Dia",
  description = "Distribuição de leads ao longo do período"
}) => {
  // Calcular tendência
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const hasData = totalLeads > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 20,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
              domain={[0, 'dataMax + 1']}
              padding={{ top: 20 }}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="leads"
              fill="hsl(210, 100%, 58%)"
              radius={4}
            >
              <LabelList
                dataKey="leads"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {hasData && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {totalLeads} leads no período <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando distribuição de leads por dia
          </div>
        </CardFooter>
      )}
    </Card>
  );
};