import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Target, TrendingUp, X, Settings, Users, MessageSquare, Calendar, MoreVertical } from 'lucide-react';
import { useCampaignsStore } from '../stores';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Campaign } from '../types';

export const CampaignsPage: React.FC = () => {
  const {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    deleteCampaign,
    clearError
  } = useCampaignsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (window.confirm(`Tem certeza que deseja deletar a campanha "${campaign.name}"?`)) {
      try {
        await deleteCampaign(campaign.id);
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'meta':
      case 'facebook':
        return (
          <div className="w-6 h-6 bg-[#1877F2] rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        );
      case 'google':
        return (
          <div className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        );
      case 'instagram':
        return (
          <div className="w-6 h-6 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="w-6 h-6 bg-[#25D366] rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
            </svg>
          </div>
        );
      case 'youtube':
        return (
          <div className="w-6 h-6 bg-[#FF0000] rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'instagram': return '📷';
      case 'facebook': return '📘';
      case 'whatsapp': return '📱';
      case 'google ads': return '🔍';
      case 'youtube': return '📺';
      default: return '🌐';
    }
  };

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowSidePanel(true);
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedCampaign(null);
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showSidePanel ? 'mr-80' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6" />
              Campanhas
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas campanhas e frases gatilho para automação de leads
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Campanha
          </Button>
        </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas as plataformas</option>
            <option value="Meta">Meta</option>
            <option value="Google">Google</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {campaigns.length}
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Ativas</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {campaigns.filter(c => c.is_active).length}
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">Meta</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {campaigns.filter(c => c.platform === 'Meta').length}
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">Google</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {campaigns.filter(c => c.platform === 'Google').length}
          </div>
        </div>
      </div>

        {/* Campaigns Table */}
        <div className="flex-1 bg-card rounded-lg border overflow-hidden">
          {filteredCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Target className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || platformFilter !== 'all' 
                  ? 'Nenhuma campanha encontrada' 
                  : 'Nenhuma campanha cadastrada'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || platformFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira campanha para automatizar a captura de leads'
                }
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Campanha
              </Button>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {/* Table Header */}
              <div className="sticky top-0 bg-muted/50 border-b p-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Campanha</div>
                  <div className="col-span-2">Plataforma</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Performance</div>
                  <div className="col-span-1">Data</div>
                  <div className="col-span-1"></div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Campaign Info */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(campaign.platform)}
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {campaign.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{getChannelIcon(campaign.channel)}</span>
                              <span>{campaign.channel}</span>
                              {campaign.creative_code && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-xs">{campaign.creative_code}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Platform */}
                      <div className="col-span-2">
                        <span className="text-sm text-foreground">{campaign.platform}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                          campaign.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            campaign.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          {campaign.is_active ? 'Ativa' : 'Inativa'}
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="col-span-2">
                        <div className="text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="font-medium text-foreground">
                                {campaign.stats?.total_leads || 0}
                              </span>
                              <span className="text-muted-foreground ml-1">leads</span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">
                                {campaign.stats?.total_phrases || 0}
                              </span>
                              <span className="text-muted-foreground ml-1">frases</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(campaign.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(campaign);
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {showSidePanel && selectedCampaign && (
        <div className="fixed top-0 right-0 h-full w-80 bg-card border-l shadow-lg z-40 flex flex-col">
          {/* Panel Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getPlatformIcon(selectedCampaign.platform)}
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedCampaign.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCampaign.platform} • {selectedCampaign.channel}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={closeSidePanel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              selectedCampaign.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                selectedCampaign.is_active ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {selectedCampaign.is_active ? 'Ativa' : 'Inativa'}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Description */}
            {selectedCampaign.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCampaign.description}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Frases Gatilho</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {selectedCampaign.stats?.total_phrases || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Leads Gerados</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {selectedCampaign.stats?.total_leads || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Detalhes</h3>
              <div className="space-y-2">
                {selectedCampaign.creative_code && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Código:</span>
                    <span className="text-sm font-mono text-foreground">
                      {selectedCampaign.creative_code}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Criado em:</span>
                  <span className="text-sm text-foreground">
                    {new Date(selectedCampaign.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurar Campanha
              </Button>
              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Gerenciar Frases
              </Button>
              <Button className="w-full" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Ver Relatórios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Nova Campanha</h2>
            <p className="text-muted-foreground">
              Modal de criação será implementado em breve.
            </p>
            <Button 
              onClick={() => setShowCreateModal(false)} 
              className="mt-4"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};