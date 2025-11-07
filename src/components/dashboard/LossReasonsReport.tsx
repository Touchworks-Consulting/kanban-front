import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import type { LossReasonsData } from '../../services/performance';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface LossReasonsReportProps {
  data: LossReasonsData | null;
  isLoading?: boolean;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
];

export const LossReasonsReport: React.FC<LossReasonsReportProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Motivos de Perda
          </CardTitle>
          <CardDescription>Análise dos motivos de leads perdidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.total_lost === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Motivos de Perda
          </CardTitle>
          <CardDescription>Análise dos motivos de leads perdidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Nenhum lead perdido no período selecionado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { reasons, total_lost, top_3 } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Motivos de Perda
          </CardTitle>
          <CardDescription>
            {total_lost} lead{total_lost !== 1 ? 's' : ''} perdido{total_lost !== 1 ? 's' : ''} no período
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top 3 - Card Compacto */}
          <div className="grid grid-cols-3 gap-4">
            {top_3.map((reason, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border bg-card p-4"
              >
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1} Motivo
                    </span>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {reason.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm font-medium truncate" title={reason.reason}>
                    {reason.reason}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reason.count} lead{reason.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de Barras */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Distribuição Completa</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={reasons}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis
                  dataKey="reason"
                  type="category"
                  width={110}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Motivo</span>
                              <span className="font-medium text-xs">{data.reason}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Quantidade</span>
                              <span className="font-medium text-xs">{data.count}</span>
                            </div>
                            <div className="flex flex-col col-span-2">
                              <span className="text-xs text-muted-foreground">Percentual</span>
                              <span className="font-medium text-xs">{data.percentage.toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {reasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela Detalhada */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Detalhamento</h4>
            <div className="relative overflow-x-auto rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Motivo
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Quantidade
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Percentual
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Barra
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {reasons.map((reason, index) => (
                    <tr
                      key={index}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">
                        {reason.reason}
                      </td>
                      <td className="p-4 align-middle">
                        {reason.count}
                      </td>
                      <td className="p-4 align-middle font-semibold text-red-600">
                        {reason.percentage.toFixed(2)}%
                      </td>
                      <td className="p-4 align-middle">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${reason.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
