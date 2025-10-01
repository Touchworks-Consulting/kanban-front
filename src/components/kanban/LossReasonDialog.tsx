import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { LoadingSpinner } from '../LoadingSpinner';
import { settingsService } from '../../services/settings';
import type { LossReason } from '../../types';

interface LossReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, customReason?: string) => void;
  leadName: string;
}

export const LossReasonDialog: React.FC<LossReasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  leadName
}) => {
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLossReasons();
      // Reset state when dialog opens
      setSelectedReason('');
      setCustomReason('');
    }
  }, [isOpen]);

  const loadLossReasons = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getLossReasons();
      setLossReasons(data.lossReasons || []);
    } catch (error) {
      console.error('Error loading loss reasons:', error);
      // Set default reasons if API fails
      setLossReasons([
        { id: 'price', name: 'Preço muito alto' },
        { id: 'competitor', name: 'Escolheu concorrente' },
        { id: 'timing', name: 'Timing inadequado' },
        { id: 'budget', name: 'Sem orçamento' },
        { id: 'no_response', name: 'Não respondeu' },
        { id: 'other', name: 'Outro motivo' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedReason) return;

    try {
      setConfirming(true);

      const reasonName = selectedReason === 'other'
        ? customReason.trim()
        : lossReasons.find(r => r.id === selectedReason)?.name || selectedReason;

      await onConfirm(reasonName, selectedReason === 'other' ? customReason : undefined);
      onClose();
    } catch (error) {
      console.error('Error confirming loss reason:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const isConfirmDisabled = !selectedReason ||
    (selectedReason === 'other' && !customReason.trim()) ||
    confirming;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Motivo da Perda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Por que o lead <strong>{leadName}</strong> foi perdido?
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {lossReasons.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={reason.id}
                    id={reason.id}
                  />
                  <Label
                    htmlFor={reason.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {reason.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason" className="text-sm font-medium">
                Especificar motivo:
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Descreva o motivo da perda..."
                className="min-h-[80px]"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={confirming}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="min-w-[100px]"
            >
              {confirming ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Salvando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};