import { useState, useEffect, useCallback, useRef } from 'react';
import { useKanbanStore } from '../stores';
import { kanbanService } from '../services/kanban';
import type { FilterState } from '../components/kanban/FilterBar';
import type { Lead, KanbanBoard } from '../types/kanban';

interface SearchResult {
  localResults: KanbanBoard | null;
  apiResults: KanbanBoard | null;
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
    isSearchingLocal: false,
    isSearchingAPI: false,
    searchPerformed: false,
    searchTerm: ''
  });

  const searchCache = useRef(new Map<string, KanbanBoard>());
  const debounceTimer = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

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

    if (searchCache.current.has(cacheKey)) {
      console.log('🔍 Using cached API result');
      setSearchResult(prev => ({
        ...prev,
        apiResults: searchCache.current.get(cacheKey)!,
        isSearchingAPI: false
      }));
      return;
    }

    try {
      if (abortController.current) {
        abortController.current.abort();
      }
      
      abortController.current = new AbortController();
      
      setSearchResult(prev => ({ ...prev, isSearchingAPI: true }));

      console.log('🔍 Making API call to searchBoard');

      const response = await kanbanService.searchBoard({
        search: searchFilters.search || undefined,
        platform: searchFilters.platform !== 'all' ? searchFilters.platform : undefined,
        period: searchFilters.period !== 'all' ? searchFilters.period : undefined,
        dateRange: searchFilters.period === 'custom' && searchFilters.dateRange ? searchFilters.dateRange : undefined,
        valueRange: searchFilters.valueRange !== 'all' ? searchFilters.valueRange : undefined,
        tags: searchFilters.tags.length > 0 ? searchFilters.tags : undefined,
        sortBy: searchFilters.sortBy || undefined
      }, {
        signal: abortController.current.signal
      });

      console.log('🔍 API response received:', response);
      
      if (response.board) {
        searchCache.current.set(cacheKey, response.board);
        
        setSearchResult(prev => {
          // Só atualizar se a API trouxe resultados válidos ou se não temos resultados locais
          const hasLocalResults = prev.localResults;
          const apiHasData = response.board.columns.some(col => col.leads && col.leads.length > 0);
          
          if (apiHasData || !hasLocalResults) {
            return {
              ...prev,
              apiResults: response.board,
              isSearchingAPI: false
            };
          } else {
            // API não trouxe dados, manter resultados locais e parar loading
            return {
              ...prev,
              isSearchingAPI: false
            };
          }
        });
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
      setSearchResult(prev => ({ ...prev, isSearchingLocal: true }));
      
      const localResult = performLocalSearch(searchFilters);
      
      setSearchResult(prev => ({
        ...prev,
        localResults: localResult,
        isSearchingLocal: false,
        searchPerformed: true
      }));

      // Debounced API search - enabled for sortBy changes
      if (enableAPISearch && (hasSearchTerm || hasOtherFilters || onlySortByChanged)) {
        // Reduce debounce for sorting - it should be immediate
        const delay = onlySortByChanged ? 50 : debounceMs;
        console.log('🔍 Scheduling API search in', delay, 'ms');
        debounceTimer.current = setTimeout(() => {
          console.log('🔍 Performing API search with filters:', searchFilters);
          performAPISearch(searchFilters);
        }, delay);
      } else {
        console.log('🔍 Not scheduling API search - conditions not met');
      }
    } else {
      // Clear results if search is too short
      setSearchResult(prev => ({
        ...prev,
        localResults: null,
        apiResults: null,
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
  
  // Se temos filtros ativos OU ordenação diferente do padrão, usar resultados filtrados
  const hasActiveFilters = filters.search ||
    filters.platform !== 'all' ||
    filters.period !== 'all' ||
    (filters.period === 'custom' && filters.dateRange) ||
    filters.valueRange !== 'all' ||
    filters.tags.length > 0 ||
    (filters.sortBy && filters.sortBy !== 'updated_desc');
    
  if (hasActiveFilters) {
    // Para ordenação, preferir resultados da API quando disponíveis
    if (filters.sortBy && filters.sortBy !== 'updated_desc' && searchResult.apiResults) {
      console.log('🔍 Using API results for sorting:', filters.sortBy);
      result = searchResult.apiResults;
    } else if (searchResult.localResults) {
      console.log('🔍 Using local results for filtering');
      result = searchResult.localResults;
    }
  }
  
  const isSearching = searchResult.isSearchingLocal;
  const isSearchingAPI = searchResult.isSearchingAPI;
  const searchPerformed = searchResult.searchPerformed;

  return {
    result,
    isSearching,
    isSearchingAPI,
    searchPerformed
  };
};