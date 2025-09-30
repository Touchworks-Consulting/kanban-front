import { useState, useEffect, useCallback, useRef } from 'react';
import { useKanbanStore } from '../stores';
import { kanbanService } from '../services/kanban';
import type { FilterState } from '../components/kanban/FilterBar';
import type { Lead, KanbanBoard } from '../types/kanban';

interface SearchResult {
  localResults: KanbanBoard | null;
  apiResults: KanbanBoard | null;
  apiResultsFilters: string | null; // JSON string of filters used for API results
  isSearchingLocal: boolean;
  isSearchingAPI: boolean;
  searchPerformed: boolean;
  searchTerm: string;
}

interface UseSmartSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
  enableAPISearch?: boolean;
}

export const useSmartSearch = (
  filters: FilterState,
  options: UseSmartSearchOptions = {}
) => {
  const {
    debounceMs = 500,
    minSearchLength = 2,
    enableAPISearch = true
  } = options;

  const { board } = useKanbanStore();
  
  const [searchResult, setSearchResult] = useState<SearchResult>({
    localResults: null,
    apiResults: null,
    apiResultsFilters: null,
    isSearchingLocal: false,
    isSearchingAPI: false,
    searchPerformed: false,
    searchTerm: ''
  });

  const searchCache = useRef(new Map<string, { data: KanbanBoard; timestamp: number }>());
  const CACHE_TTL = 60000; // 1 minuto de cache
  const debounceTimer = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

  // Limpar cache quando board original mudar (dados foram atualizados)
  useEffect(() => {
    console.log('🧹 Board mudou - limpando cache de busca');
    searchCache.current.clear();
  }, [board]);

  // Local search function
  const performLocalSearch = useCallback((searchFilters: FilterState): KanbanBoard | null => {
    if (!board) return null;

    const filterLeads = (leads: Lead[]): Lead[] => {
      return leads.filter(lead => {
        // Search filter
        if (searchFilters.search && searchFilters.search.length >= minSearchLength) {
          const searchTerm = searchFilters.search.toLowerCase();
          const isNumericSearch = /^\d+$/.test(searchFilters.search);
          
          let matchesSearch = false;
          
          // Buscar em todos os campos sempre, mas para números dar prioridade ao telefone
          const nameMatch = lead.name ? lead.name.toLowerCase().includes(searchTerm) : false;
          const emailMatch = lead.email ? lead.email.toLowerCase().includes(searchTerm) : false;
          const campaignMatch = (lead as any).campaign ? (lead as any).campaign.toLowerCase().includes(searchTerm) : false;
          const messageMatch = (lead as any).message ? (lead as any).message.toLowerCase().includes(searchTerm) : false;
          
          let phoneMatch = false;
          if (lead.phone) {
            // Buscar no telefone formatado
            const phoneFormatted = lead.phone.toLowerCase();
            // Buscar no telefone sem formatação (apenas números)
            const phoneClean = lead.phone.replace(/\D/g, '');
            
            phoneMatch = phoneFormatted.includes(searchTerm) || phoneClean.includes(searchFilters.search);
            
          }
          
          matchesSearch = nameMatch || emailMatch || phoneMatch || campaignMatch || messageMatch;
          
          if (!matchesSearch) return false;
        }

        // Platform filter
        if (searchFilters.platform !== 'all' && lead.platform !== searchFilters.platform) {
          return false;
        }

        // Value range filter
        if (searchFilters.valueRange !== 'all' && lead.value) {
          const value = lead.value;
          switch (searchFilters.valueRange) {
            case '0-500':
              if (value < 0 || value > 500) return false;
              break;
            case '500-2000':
              if (value < 500 || value > 2000) return false;
              break;
            case '2000-5000':
              if (value < 2000 || value > 5000) return false;
              break;
            case '5000+':
              if (value < 5000) return false;
              break;
          }
        }

        // Tags filter
        if (searchFilters.tags.length > 0 && lead.tags) {
          const leadTagIds = lead.tags.map(tag => tag.id);
          const hasMatchingTag = searchFilters.tags.some(tagId => leadTagIds.includes(tagId));
          if (!hasMatchingTag) return false;
        }

        // Date range filter (custom period)
        if (searchFilters.period === 'custom' && searchFilters.dateRange) {
          const leadDateValue = (lead as any).createdAt || (lead as any).updatedAt || lead.createdAt || lead.updatedAt;
          
          if (!leadDateValue) {
            return false; // Se não tem data, não passa no filtro
          }
          
          const leadDate = new Date(leadDateValue);
          const startDate = new Date(searchFilters.dateRange.start);
          const endDate = new Date(searchFilters.dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include full end date
          
          // Verificar se as datas são válidas
          if (isNaN(leadDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }
          
          if (leadDate < startDate || leadDate > endDate) {
            return false;
          }
        }

        return true;
      });
    };

    return {
      ...board,
      columns: board.columns.map(column => ({
        ...column,
        leads: column.leads ? filterLeads(column.leads) : []
      }))
    };
  }, [board, minSearchLength]);

  // API search function
  const performAPISearch = useCallback(async (searchFilters: FilterState) => {
    console.log('🔍 performAPISearch called with:', searchFilters);

    if (!enableAPISearch) {
      console.log('🔍 API search disabled');
      return;
    }

    const cacheKey = JSON.stringify(searchFilters);

    const cached = searchCache.current.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_TTL) {
        console.log('🔍 Using cached API result (age:', Math.round(age / 1000), 's)', {
          cacheKey: JSON.parse(cacheKey),
          firstLeadInCache: cached.data.columns[0]?.leads?.[0]?.name || 'N/A',
          totalLeadsInCache: cached.data.columns.reduce((sum, col) => sum + (col.leads?.length || 0), 0)
        });
        setSearchResult(prev => ({
          ...prev,
          apiResults: cached.data,
          apiResultsFilters: cacheKey,
          isSearchingAPI: false
        }));
        return;
      } else {
        console.log('🧹 Cache expired, removing');
        searchCache.current.delete(cacheKey);
      }
    }

    try {
      if (abortController.current) {
        abortController.current.abort();
      }
      
      abortController.current = new AbortController();
      
      setSearchResult(prev => ({ ...prev, isSearchingAPI: true }));

      const apiPayload = {
        search: searchFilters.search || undefined,
        platform: searchFilters.platform !== 'all' ? searchFilters.platform : undefined,
        period: searchFilters.period !== 'all' ? searchFilters.period : undefined,
        dateRange: searchFilters.period === 'custom' && searchFilters.dateRange ? searchFilters.dateRange : undefined,
        valueRange: searchFilters.valueRange !== 'all' ? searchFilters.valueRange : undefined,
        tags: searchFilters.tags.length > 0 ? searchFilters.tags : undefined,
        sortBy: searchFilters.sortBy || undefined
      };

      console.log('🔍 Making API call to searchBoard with payload:', apiPayload);

      const response = await kanbanService.searchBoard(apiPayload, {
        signal: abortController.current.signal
      });

      console.log('🔍 API response received:', {
        totalColumns: response.board.columns.length,
        firstLeadInFirstColumn: response.board.columns[0]?.leads?.[0]?.name || 'N/A',
        totalLeadsAcrossAllColumns: response.board.columns.reduce((sum, col) => sum + (col.leads?.length || 0), 0)
      });

      if (response.board) {
        // SEMPRE atualizar com a resposta da API - ela é a fonte da verdade
        searchCache.current.set(cacheKey, {
          data: response.board,
          timestamp: Date.now()
        });

        setSearchResult(prev => ({
          ...prev,
          apiResults: response.board,
          apiResultsFilters: cacheKey,
          isSearchingAPI: false
        }));
      }
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('API search error:', error);
        setSearchResult(prev => ({ ...prev, isSearchingAPI: false }));
      }
    }
  }, [enableAPISearch]);

  // Main search handler
  const handleSearch = useCallback((searchFilters: FilterState) => {
    const searchTerm = searchFilters.search || '';


    setSearchResult(prev => ({
      ...prev,
      searchTerm,
      searchPerformed: false
    }));

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Check if only sortBy changed (no other filters)
    const hasSearchTerm = searchTerm.length >= minSearchLength;
    const hasOtherFilters = Object.entries(searchFilters).some(([key, value]) => {
      if (key === 'search') return false; // Skip search term, already checked above
      if (key === 'sortBy') return false; // Skip sortBy for this check
      if (key === 'dateRange') return searchFilters.period === 'custom' && value;
      if (Array.isArray(value)) return value.length > 0;
      return value !== 'all' && value !== '';
    });

    // If only sortBy changed, treat it as a filter requiring API search
    const onlySortByChanged = !hasSearchTerm && !hasOtherFilters && searchFilters.sortBy && searchFilters.sortBy !== 'updated_desc';

    console.log('🔍 Search conditions:', {
      hasSearchTerm,
      hasOtherFilters,
      onlySortByChanged,
      sortBy: searchFilters.sortBy
    });

    if (hasSearchTerm || hasOtherFilters || onlySortByChanged) {
      // Para ordenação pura (sem outros filtros), NÃO fazer busca local
      // Busca local não implementa ordenação, então vamos direto para API
      if (onlySortByChanged) {
        console.log('🔍 SortBy mudou - pulando busca local, indo direto para API');
        setSearchResult(prev => ({
          ...prev,
          isSearchingLocal: false,
          localResults: null,
          searchPerformed: true
        }));

        // API search IMEDIATA para ordenação (sem debounce)
        if (enableAPISearch) {
          console.log('🔍 Performing IMMEDIATE API search for sorting:', searchFilters.sortBy);
          performAPISearch(searchFilters);
        }
      } else {
        // Para busca/filtros, fazer busca local primeiro
        setSearchResult(prev => ({ ...prev, isSearchingLocal: true }));

        const localResult = performLocalSearch(searchFilters);

        setSearchResult(prev => ({
          ...prev,
          localResults: localResult,
          isSearchingLocal: false,
          searchPerformed: true
        }));

        // Debounced API search para filtros
        if (enableAPISearch && (hasSearchTerm || hasOtherFilters)) {
          console.log('🔍 Scheduling API search in', debounceMs, 'ms');
          debounceTimer.current = setTimeout(() => {
            console.log('🔍 Performing API search with filters:', searchFilters);
            performAPISearch(searchFilters);
          }, debounceMs);
        } else {
          console.log('🔍 Not scheduling API search - conditions not met');
        }
      }
    } else {
      // Clear results if search is too short
      setSearchResult(prev => ({
        ...prev,
        localResults: null,
        apiResults: null,
        apiResultsFilters: null,
        isSearchingLocal: false,
        isSearchingAPI: false,
        searchPerformed: false
      }));
    }
  }, [debounceMs, minSearchLength, enableAPISearch, performLocalSearch, performAPISearch]);

  // Effect to trigger search when filters change
  useEffect(() => {
    handleSearch(filters);
  }, [filters, handleSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Return the best available result
  let result = board;

  // Verificar se temos filtros ativos (excluindo sortBy puro)
  const hasSearchOrFilters = filters.search ||
    filters.platform !== 'all' ||
    filters.period !== 'all' ||
    (filters.period === 'custom' && filters.dateRange) ||
    filters.valueRange !== 'all' ||
    filters.tags.length > 0;

  const hasSortBy = filters.sortBy && filters.sortBy !== 'updated_desc';

  // Criar chave dos filtros atuais para comparar com apiResultsFilters
  const currentFiltersKey = JSON.stringify(filters);
  const apiResultsMatchCurrentFilters = searchResult.apiResultsFilters === currentFiltersKey;

  if (hasSearchOrFilters || hasSortBy) {
    // Para ordenação PURA (sem outros filtros)
    if (hasSortBy && !hasSearchOrFilters) {
      // Preferir API results se disponível E corresponder aos filtros atuais
      if (searchResult.apiResults && apiResultsMatchCurrentFilters) {
        console.log('🔍 Using API results for sorting:', filters.sortBy);
        result = searchResult.apiResults;
      } else {
        console.log('🔍 Using board (from fetchBoard with sortBy) while API loads:', filters.sortBy);
        result = board; // Board já vem ordenado do fetchBoard
      }
    }
    // Para busca/filtros (com ou sem ordenação)
    else if (hasSearchOrFilters) {
      // Preferir resultados da API quando disponíveis E correspondem aos filtros atuais
      if (searchResult.apiResults && apiResultsMatchCurrentFilters) {
        console.log('🔍 Using API results for search/filters (match: true)');
        result = searchResult.apiResults;
      } else if (searchResult.localResults) {
        console.log('🔍 Using local results for filtering (API match:', apiResultsMatchCurrentFilters, ')');
        result = searchResult.localResults;
      }
    }
  }
  
  const isSearching = searchResult.isSearchingLocal;
  const isSearchingAPI = searchResult.isSearchingAPI;
  const searchPerformed = searchResult.searchPerformed;

  // Log de debug para diagnosticar problemas de ordenação
  console.log('🔍 useSmartSearch RETURN:', {
    hasSortBy,
    hasSearchOrFilters,
    resultSource: result === board ? 'board (original)' :
                  result === searchResult.apiResults ? 'apiResults' :
                  result === searchResult.localResults ? 'localResults' : 'unknown',
    sortBy: filters.sortBy,
    firstLeadInFirstColumn: result?.columns[0]?.leads?.[0]?.name || 'N/A'
  });

  return {
    result,
    isSearching,
    isSearchingAPI,
    searchPerformed
  };
};