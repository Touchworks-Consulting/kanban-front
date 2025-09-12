import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
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

interface HourlyDistributionChartProps {
  data: Array<{
    hour: string;
    leads: number;
    hourNumber: number;
  }>;
  title?: string;
  description?: string;
}

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(142, 76%, 36%)", // Verde vibrante como no exemplo
  },
} satisfies ChartConfig;

export const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({
  data,
  title = "Distribuição por Hora",
  description = "Horários de maior concentração de leads"
}) => {
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const peakHour = data.reduce((max, current) => 
    current.leads > max.leads ? current : max, 
    { hour: '0', leads: 0, hourNumber: 0 }
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={2}
              tickFormatter={(value) => `${value}h`}
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
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="leads"
              type="monotone"
              fill="url(#fillLeads)"
              fillOpacity={0.6}
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {totalLeads > 0 && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Pico às {peakHour.hour}h com {peakHour.leads} leads <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando {totalLeads} leads distribuídos ao longo do dia
          </div>
        </CardFooter>
      )}
    </Card>
  );
};