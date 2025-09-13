import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  X,
  Calendar,
  Tag,
  DollarSign,
  Smartphone,
  Check,
  ChevronsUpDown,
  CalendarDays
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { cn } from '../../lib/utils';
import type { Tag as TagType } from '../../types/kanban';

export interface FilterState {
  search: string;
  period: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags: string[];
  valueRange: string;
  platform: string;
  status: string[];
  sortBy?: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalLeads?: number;
  filteredLeads?: number;
  isSearching?: boolean;
  isSearchingAPI?: boolean;
  searchPerformed?: boolean;
}

// Mock data - será substituído por dados reais
const mockTags: TagType[] = [
  { id: '1', name: 'Urgente', color: '#ef4444', account_id: 'acc1' },
  { id: '2', name: 'VIP', color: '#8b5cf6', account_id: 'acc1' },
  { id: '3', name: 'Follow-up', color: '#06b6d4', account_id: 'acc1' },
  { id: '4', name: 'Qualificado', color: '#10b981', account_id: 'acc1' },
];

const platforms = [
  'Meta', 'Google', 'Instagram', 'Facebook', 'WhatsApp', 'LinkedIn', 'Website'
];

const valueRanges = [
  { label: 'Qualquer valor', value: 'all' },
  { label: 'R$ 0 - 500', value: '0-500' },
  { label: 'R$ 500 - 2.000', value: '500-2000' },
  { label: 'R$ 2.000 - 5.000', value: '2000-5000' },
  { label: 'R$ 5.000+', value: '5000+' },
];

const periodOptions = [
  { label: 'Hoje', value: 'today' },
  { label: 'Esta semana', value: 'week' },
  { label: 'Este mês', value: 'month' },
  { label: 'Últimos 3 meses', value: '3months' },
  { label: 'Este ano', value: 'year' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  totalLeads = 0,
  filteredLeads = 0,
  isSearching = false,
  isSearchingAPI = false,
  searchPerformed = false
}) => {
  const [tagsOpen, setTagsOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const removeTag = (tagId: string) => {
    updateFilter('tags', filters.tags.filter(id => id !== tagId));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    // Para período: contar apenas se não for 'all' e não for 'custom' OU se for custom com dateRange
    if (filters.period !== 'all' && filters.period !== 'custom') count++; // Períodos predefinidos
    if (filters.period === 'custom' && filters.dateRange) count++; // Período personalizado
    if (filters.tags.length > 0) count++;
    if (filters.valueRange !== 'all') count++;
    if (filters.platform !== 'all') count++;
    return count;
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      period: 'all',
      dateRange: undefined,
      tags: [],
      valueRange: 'all',
      platform: 'all',
      status: [],
    });
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  const sortOptions = [
    { label: 'Data de atualização (mais recente)', value: 'updated_desc', icon: ArrowUpDown },
    { label: 'Data de atualização (mais antigo)', value: 'updated_asc', icon: ArrowUpDown },
    { label: 'Próxima atividade (mais próxima)', value: 'activity_asc', icon: Calendar },
    { label: 'Próxima atividade (mais distante)', value: 'activity_desc', icon: Calendar },
    { label: 'Título (A-Z)', value: 'title_asc', icon: Tag },
    { label: 'Título (Z-A)', value: 'title_desc', icon: Tag },
    { label: 'Valor (maior-menor)', value: 'value_desc', icon: DollarSign },
    { label: 'Valor (menor-maior)', value: 'value_asc', icon: DollarSign },
    { label: 'Criado em (mais recente)', value: 'created_desc', icon: Calendar },
    { label: 'Criado em (mais antigo)', value: 'created_asc', icon: Calendar },
  ];

  return (
    <div className="space-y-2">
      {/* Linha principal: Busca à esquerda, Stats + Filtro à direita */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Busca com destaque */}
        <div className="relative flex-1 max-w-md">
          {isSearchingAPI ? (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isSearching ? 'text-orange-500' : 'text-primary'
            }`} />
          )}
          <Input
            type="text"
            placeholder={
              isSearchingAPI 
                ? "Buscando na API..." 
                : isSearching 
                  ? "Buscando localmente..." 
                  : "Buscar por nome, email ou telefone..."
            }
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('search', e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Escape') {
                updateFilter('search', '');
                e.currentTarget.blur();
              }
            }}
            className="pl-10 pr-4 h-10 text-sm border-2 border-muted-foreground/20 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
          />
          {searchPerformed && filters.search && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className={`w-2 h-2 rounded-full ${
                isSearchingAPI 
                  ? 'bg-blue-500' 
                  : isSearching 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
              }`} />
            </div>
          )}
        </div>

        {/* Stats + Filtro + Filtros Ativos */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-sm font-medium text-foreground">
            {hasActiveFilters ? (
              <span className="flex items-center gap-2">
                <span className={`${filteredLeads < totalLeads ? 'text-primary' : 'text-foreground'}`}>
                  {filteredLeads} de {totalLeads} leads
                </span>
                {searchPerformed && isSearchingAPI && (
                  <div className="flex items-center gap-1 text-blue-600 text-xs">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    API
                  </div>
                )}
              </span>
            ) : (
              `${totalLeads} leads`
            )}
          </div>

          {/* Filtros ativos inline */}
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap max-w-lg">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                  🔍 "{filters.search}"
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:opacity-70" 
                    onClick={() => updateFilter('search', '')}
                  />
                </span>
              )}

              {filters.period !== 'all' && filters.period !== 'custom' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary/10 text-secondary-foreground">
                  📅 {periodOptions.find(p => p.value === filters.period)?.label || filters.period}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:opacity-70" 
                    onClick={() => updateFilter('period', 'all')}
                  />
                </span>
              )}

              {filters.period === 'custom' && filters.dateRange && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary/10 text-secondary-foreground">
                  📅 {(() => {
                        // Usar formatação direta da string ao invés de converter para Date
                        const formatDisplayDate = (dateStr: string) => {
                          const [year, month, day] = dateStr.split('-');
                          return `${day}/${month}/${year}`;
                        };
                        
                        return `${formatDisplayDate(filters.dateRange.start)} - ${formatDisplayDate(filters.dateRange.end)}`;
                      })()}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:opacity-70" 
                    onClick={() => {
                      updateFilter('period', 'all');
                      updateFilter('dateRange', undefined);
                    }}
                  />
                </span>
              )}

              {filters.valueRange !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                  💰 {valueRanges.find(v => v.value === filters.valueRange)?.label || filters.valueRange}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:opacity-70" 
                    onClick={() => updateFilter('valueRange', 'all')}
                  />
                </span>
              )}

              {filters.platform !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                  📱 {filters.platform}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:opacity-70" 
                    onClick={() => updateFilter('platform', 'all')}
                  />
                </span>
              )}

              {filters.tags.map(tagId => {
                const tag = mockTags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer hover:opacity-70" 
                      onClick={() => removeTag(tagId)}
                    />
                  </span>
                );
              })}
            </div>
          )}

          <Dialog open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filtro
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filtros Avançados</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Período */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Período
                  </label>
                  <Select value={filters.period} onValueChange={(value: string) => updateFilter('period', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os períodos</SelectItem>
                      {periodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Período personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Date Range Picker - aparece quando custom é selecionado */}
                  {filters.period === 'custom' && (
                    <div className="mt-2">
                      <DateRangePicker
                        value={filters.dateRange ? {
                          start: new Date(filters.dateRange.start + 'T00:00:00'),
                          end: new Date(filters.dateRange.end + 'T00:00:00')
                        } : undefined}
                        onChange={(range) => {
                          if (range) {
                            const formatDateLocal = (date: Date) => {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              return `${year}-${month}-${day}`;
                            };
                            
                            const dateRange = {
                              start: formatDateLocal(range.start),
                              end: formatDateLocal(range.end)
                            };
                            
                            updateFilter('dateRange', dateRange);
                          } else {
                            updateFilter('dateRange', undefined);
                          }
                        }}
                        placeholder="Escolher datas..."
                        className="w-full"
                        inModal={true}
                      />
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={tagsOpen}
                        className="justify-between w-full"
                      >
                        {filters.tags.length === 0
                          ? "Selecionar tags"
                          : `${filters.tags.length} selecionada${filters.tags.length > 1 ? 's' : ''}`
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar tags..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                          <CommandGroup>
                            {mockTags.map((tag) => (
                              <CommandItem
                                key={tag.id}
                                value={tag.name}
                                onSelect={() => {
                                  const isSelected = filters.tags.includes(tag.id);
                                  if (isSelected) {
                                    removeTag(tag.id);
                                  } else {
                                    updateFilter('tags', [...filters.tags, tag.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <span>{tag.name}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    filters.tags.includes(tag.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Valor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Valor
                  </label>
                  <Select value={filters.valueRange} onValueChange={(value: string) => updateFilter('valueRange', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar faixa de valor" />
                    </SelectTrigger>
                    <SelectContent>
                      {valueRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Plataforma */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Origem
                  </label>
                  <Select value={filters.platform} onValueChange={(value: string) => updateFilter('platform', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ações */}
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                  <Button size="sm" onClick={() => setFiltersDialogOpen(false)}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Ordenação */}
      <div className="px-6 pb-1">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={filters.sortBy || 'updated_desc'} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-auto min-w-48 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-3 h-3" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};