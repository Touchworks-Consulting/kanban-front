import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Palette, Settings2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingSpinner } from '../LoadingSpinner';
import { settingsService } from '../../services/settings';
import type { CustomStatus, LossReason } from '../../types';

export const StatusSettings: React.FC = () => {
  const [statuses, setStatuses] = useState<CustomStatus[]>([]);
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingLossReason, setEditingLossReason] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStatuses(), loadLossReasons()]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar configurações de status');
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await settingsService.getCustomStatuses();
      setStatuses(data.statuses || []);
    } catch (error) {
      throw new Error('Failed to load statuses');
    }
  };

  const loadLossReasons = async () => {
    try {
      const data = await settingsService.getLossReasons();
      setLossReasons(data.lossReasons || []);
    } catch (error) {
      throw new Error('Failed to load loss reasons');
    }
  };

  const saveStatuses = async (newStatuses: CustomStatus[]) => {
    const validationErrs = (settingsService.constructor as any).validateStatusList(newStatuses);
    if (validationErrs.length > 0) {
      setValidationErrors(validationErrs);
      return;
    }

    setSaving(true);
    setValidationErrors([]);

    try {
      await settingsService.updateCustomStatuses(newStatuses);
      setStatuses(newStatuses);
      setError(null);
    } catch (err) {
      console.error('Error saving statuses:', err);
      setError('Erro ao salvar status');
    } finally {
      setSaving(false);
    }
  };

  const saveLossReasons = async (newLossReasons: LossReason[]) => {
    setSaving(true);
    try {
      await settingsService.updateLossReasons(newLossReasons);
      setLossReasons(newLossReasons);
      setError(null);
    } catch (err) {
      console.error('Error saving loss reasons:', err);
      setError('Erro ao salvar motivos de perda');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = (statusId: string, field: keyof CustomStatus, value: any) => {
    const updatedStatuses = statuses.map(status =>
      status.id === statusId ? { ...status, [field]: value } : status
    );

    if (field === 'is_initial' && value === true) {
      updatedStatuses.forEach(status => {
        if (status.id !== statusId) {
          status.is_initial = false;
        }
      });
    }

    setStatuses(updatedStatuses);
  };

  const handleLossReasonUpdate = (reasonId: string, field: keyof LossReason, value: any) => {
    const updatedReasons = lossReasons.map(reason =>
      reason.id === reasonId ? { ...reason, [field]: value } : reason
    );
    setLossReasons(updatedReasons);
  };

  const addNewStatus = () => {
    const newStatus: CustomStatus = {
      id: `status_${Date.now()}`,
      name: 'Novo Status',
      color: '#6366f1',
      order: Math.max(...statuses.map(s => s.order), 0) + 1,
      is_initial: false,
      is_won: false,
      is_lost: false
    };
    setStatuses([...statuses, newStatus]);
    setEditingStatus(newStatus.id);
  };

  const addNewLossReason = () => {
    const newReason: LossReason = {
      id: `reason_${Date.now()}`,
      name: 'Novo Motivo'
    };
    setLossReasons([...lossReasons, newReason]);
    setEditingLossReason(newReason.id);
  };

  const deleteStatus = (statusId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este status?')) {
      const updatedStatuses = statuses.filter(s => s.id !== statusId);
      setStatuses(updatedStatuses);
    }
  };

  const deleteLossReason = (reasonId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este motivo?')) {
      const updatedReasons = lossReasons.filter(r => r.id !== reasonId);
      setLossReasons(updatedReasons);
    }
  };

  const moveStatus = (statusId: string, direction: 'up' | 'down') => {
    const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);
    const currentIndex = sortedStatuses.findIndex(s => s.id === statusId);

    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedStatuses.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const temp = sortedStatuses[currentIndex].order;
    sortedStatuses[currentIndex].order = sortedStatuses[newIndex].order;
    sortedStatuses[newIndex].order = temp;

    setStatuses(sortedStatuses);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Status Customizados
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure os status dos seus leads e motivos de perda personalizados
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <div>
              <strong>Erros de validação:</strong>
              <ul className="mt-2 list-disc list-inside text-sm">
                {validationErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Status dos Leads</h4>
          <Button onClick={addNewStatus} disabled={saving} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Status
          </Button>
        </div>

        <div className="space-y-3">
          {statuses
            .sort((a, b) => a.order - b.order)
            .map((status) => (
              <div key={status.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                {/* Order Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveStatus(status.id, 'up')}
                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground border rounded"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveStatus(status.id, 'down')}
                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground border rounded"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Color Picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={status.color}
                    onChange={(e) => handleStatusUpdate(status.id, 'color', e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                    title="Cor do status"
                  />
                </div>

                {/* Name */}
                <div className="flex-1">
                  {editingStatus === status.id ? (
                    <input
                      type="text"
                      value={status.name}
                      onChange={(e) => handleStatusUpdate(status.id, 'name', e.target.value)}
                      onBlur={() => setEditingStatus(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingStatus(null)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setEditingStatus(status.id)}
                      className="text-left w-full px-3 py-2 hover:bg-muted rounded-md"
                    >
                      {status.name}
                    </button>
                  )}
                </div>

                {/* Flags */}
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={status.is_initial}
                      onChange={(e) => handleStatusUpdate(status.id, 'is_initial', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Inicial
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={status.is_won}
                      onChange={(e) => handleStatusUpdate(status.id, 'is_won', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Ganho
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={status.is_lost}
                      onChange={(e) => handleStatusUpdate(status.id, 'is_lost', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Perdido
                  </label>
                </div>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteStatus(status.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
        </div>

        <div className="mt-4">
          <Button
            onClick={() => saveStatuses(statuses)}
            disabled={saving}
            className="w-full"
          >
            {saving ? <LoadingSpinner /> : null}
            {saving ? 'Salvando...' : 'Salvar Status'}
          </Button>
        </div>
      </div>

      {/* Loss Reasons Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Motivos de Perda</h4>
          <Button onClick={addNewLossReason} disabled={saving} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Motivo
          </Button>
        </div>

        <div className="space-y-3">
          {lossReasons.map((reason) => (
            <div key={reason.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
              <div className="flex-1">
                {editingLossReason === reason.id ? (
                  <input
                    type="text"
                    value={reason.name}
                    onChange={(e) => handleLossReasonUpdate(reason.id, 'name', e.target.value)}
                    onBlur={() => setEditingLossReason(null)}
                    onKeyPress={(e) => e.key === 'Enter' && setEditingLossReason(null)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setEditingLossReason(reason.id)}
                    className="text-left w-full px-3 py-2 hover:bg-muted rounded-md"
                  >
                    {reason.name}
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteLossReason(reason.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button
            onClick={() => saveLossReasons(lossReasons)}
            disabled={saving}
            className="w-full"
          >
            {saving ? <LoadingSpinner /> : null}
            {saving ? 'Salvando...' : 'Salvar Motivos'}
          </Button>
        </div>
      </div>
    </div>
  );
};