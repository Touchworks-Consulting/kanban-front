import React from 'react';
import { Trophy, Users, Target, Activity, DollarSign, Medal } from 'lucide-react';

// Interface para os dados do ranking de vendedores
interface SalesRankingData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  newLeadsAssigned: number;
  leadsWon: number;
  conversionRate: number;
  activitiesCount: number;
  totalRevenue: number;
}

interface SalesRankingTableProps {
  data: SalesRankingData[];
  loading?: boolean;
  className?: string;
}

// Componente para badge da taxa de conversão
const ConversionRateBadge: React.FC<{ rate: number }> = ({ rate }) => {
  const getColorClass = (rate: number) => {
    if (rate >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rate >= 30) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(rate)}`}>
      {rate.toFixed(1)}%
    </span>
  );
};

// Componente para ranking badge
const RankingBadge: React.FC<{ position: number }> = ({ position }) => {
  const getBadgeContent = (pos: number) => {
    if (pos === 1) return { icon: Trophy, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (pos === 2) return { icon: Medal, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    if (pos === 3) return { icon: Medal, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { icon: Target, color: 'text-blue-600 bg-blue-50 border-blue-200' };
  };

  const { icon: Icon, color } = getBadgeContent(position);

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      #{position}
    </div>
  );
};

// Componente para formatação de receita
const RevenueDisplay: React.FC<{ value: number }> = ({ value }) => {
  const formatted = value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <div className="flex items-center gap-1">
      
      <span className="font-medium text-green-700">{formatted}</span>
    </div>
  );
};

export const SalesRankingTable: React.FC<SalesRankingTableProps> = ({
  data,
  loading = false,
  className = ""
}) => {
  if (loading) {
    return (
      <div className={`w-full p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`w-full p-6 text-center text-muted-foreground ${className}`}>
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum dado de ranking disponível</p>
        <p className="text-xs mt-1">Aguardando dados de vendedores</p>
      </div>
    );
  }

  // Ordenar dados por leads ganhos (desc) e depois por taxa de conversão (desc)
  const sortedData = [...data].sort((a, b) => {
    if (b.leadsWon !== a.leadsWon) {
      return b.leadsWon - a.leadsWon;
    }
    return b.conversionRate - a.conversionRate;
  });

  return (
    <div className={`w-full overflow-x-auto ${className}`}>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Posição
            </th>
            <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Usuário
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                Leads Atribuídos
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />
                Leads Ganhos
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                Taxa Conversão
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Activity className="w-3 h-3" />
                Atividades
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                Receita Total
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((seller, index) => {
            const position = index + 1;
            return (
              <tr
                key={seller.user.id}
                className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                  position <= 3 ? 'bg-muted/10' : ''
                }`}
              >
                {/* Posição */}
                <td className="py-3 px-4">
                  <RankingBadge position={position} />
                </td>

                {/* Usuário */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {seller.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {seller.user.email}
                    </span>
                  </div>
                </td>

                {/* Leads Atribuídos */}
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-blue-600">
                      {seller.newLeadsAssigned}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      novos leads
                    </span>
                  </div>
                </td>

                {/* Leads Ganhos */}
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-green-600">
                      {seller.leadsWon}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vendas
                    </span>
                  </div>
                </td>

                {/* Taxa de Conversão */}
                <td className="py-3 px-4 text-center">
                  <ConversionRateBadge rate={seller.conversionRate} />
                </td>

                {/* Atividades */}
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-purple-600">
                      {seller.activitiesCount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      atividades
                    </span>
                  </div>
                </td>

                {/* Receita Total */}
                <td className="py-3 px-4 text-center">
                  
                  <RevenueDisplay value={seller.totalRevenue} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>


    </div>
  );
};