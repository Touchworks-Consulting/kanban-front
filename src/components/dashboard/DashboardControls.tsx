import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Filter,
  X,
  Download,
  RefreshCw,
  Settings,
  ChevronDown,
  Check
} from 'lucide-react';

// Interface para filtros
export interface DashboardFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset: string;
  };
  campaigns: string[];
  status: string[];
  platforms: string[];
}

interface DashboardControlsProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing?: boolean;
}

// Presets de período
const DATE_PRESETS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: 'Últimos 7 dias', value: 'last_7_days' },
  { label: 'Últimos 30 dias', value: 'last_30_days' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Mês passado', value: 'last_month' },
  { label: 'Últimos 3 meses', value: 'last_3_months' },
  { label: 'Este ano', value: 'this_year' },
  { label: 'Personalizado', value: 'custom' }
];

// Status disponíveis
const STATUS_OPTIONS = [
  { label: 'Novos', value: 'new' },
  { label: 'Contatados', value: 'contacted' },
  { label: 'Qualificados', value: 'qualified' },
  { label: 'Proposta', value: 'proposal' },
  { label: 'Ganhos', value: 'won' },
  { label: 'Perdidos', value: 'lost' }
];

// Plataformas disponíveis
const PLATFORM_OPTIONS = [
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Email', value: 'email' },
  { label: 'Telefone', value: 'phone' },
  { label: 'Site', value: 'website' },
  { label: 'Redes Sociais', value: 'social' }
];

// Componente de dropdown personalizado
interface DropdownProps {
  label: string;
  options: Array<{ label: string; value: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  multi?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  multi = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (multi) {
      const newSelected = selected.includes(value)
        ? selected.filter(item => item !== value)
        : [...selected, value];
      onChange(newSelected);
    } else {
      onChange([value]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50"
          >
            <div className="p-2 max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
                >
                  {multi && (
                    <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${
                      selected.includes(option.value) ? 'bg-primary border-primary' : ''
                    }`}>
                      {selected.includes(option.value) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente principal de controles
export const DashboardControls: React.FC<DashboardControlsProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  isRefreshing = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDatePresetChange = (preset: string) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        preset
      }
    };
    
    // Calcular datas baseado no preset
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = new Date();

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'last_7_days':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'last_30_days':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last_3_months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        // Custom - don't change dates
        break;
    }

    if (preset !== 'custom') {
      newFilters.dateRange.start = start;
      newFilters.dateRange.end = end;
    }

    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: {
        start: null,
        end: null,
        preset: 'last_30_days'
      },
      campaigns: [],
      status: [],
      platforms: []
    });
  };

  const hasActiveFilters = 
    filters.campaigns.length > 0 || 
    filters.status.length > 0 || 
    filters.platforms.length > 0 ||
    filters.dateRange.preset !== 'last_30_days';

  return (
    <motion.div 
      className="bg-card p-4 rounded-xl border shadow-sm mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Controles principais */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors ${
              hasActiveFilters ? 'bg-primary/10 border-primary' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-1">
                •
              </span>
            )}
          </button>

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            {DATE_PRESETS.find(p => p.value === filters.dateRange.preset)?.label || 'Período'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>

          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Seletor de período */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-4 mb-4"
          >
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleDatePresetChange(preset.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.dateRange.preset === preset.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros avançados */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Dropdown
                  label="Selecionar Status"
                  options={STATUS_OPTIONS}
                  selected={filters.status}
                  onChange={(status) => onFiltersChange({ ...filters, status })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Plataformas</label>
                <Dropdown
                  label="Selecionar Plataformas"
                  options={PLATFORM_OPTIONS}
                  selected={filters.platforms}
                  onChange={(platforms) => onFiltersChange({ ...filters, platforms })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Campanhas</label>
                <Dropdown
                  label="Selecionar Campanhas"
                  options={[
                    { label: 'Google Ads', value: 'google_ads' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Email Marketing', value: 'email' },
                    { label: 'Orgânico', value: 'organic' }
                  ]}
                  selected={filters.campaigns}
                  onChange={(campaigns) => onFiltersChange({ ...filters, campaigns })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};