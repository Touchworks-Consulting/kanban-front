import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Lead, KanbanColumn } from '../../types/kanban';

interface LeadActionButtonsProps {
  lead: Lead;
  columns: KanbanColumn[];
  onStatusChange?: (status: 'won' | 'lost', reason?: string) => Promise<void>;
  onMoveToNext?: (nextColumnId: string) => Promise<void>;
  className?: string;
}

export const LeadActionButtons: React.FC<LeadActionButtonsProps> = ({
  lead,
  columns,
  onStatusChange,
  onMoveToNext,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showWonReason, setShowWonReason] = useState(false);
  const [showLostReason, setShowLostReason] = useState(false);
  const [wonReason, setWonReason] = useState('');
  const [lostReason, setLostReason] = useState('');


  const isWon = lead.status === 'won';
  const isLost = lead.status === 'lost';
  const isActive = lead.status !== 'won' && lead.status !== 'lost';

  const handleWon = async () => {
    if (!onStatusChange) return;

    setIsLoading(true);
    try {
      await onStatusChange('won', wonReason || undefined);
      setShowWonReason(false);
      setWonReason('');
    } catch (error) {
      console.error('Erro ao marcar como ganho:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLost = async () => {
    if (!onStatusChange) return;

    setIsLoading(true);
    try {
      await onStatusChange('lost', lostReason || undefined);
      setShowLostReason(false);
      setLostReason('');
    } catch (error) {
      console.error('Erro ao marcar como perdido:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={cn('space-y-3', className)}>
      {/* Status Display */}
      {(isWon || isLost) && (
        <div className="text-center p-3 rounded-md bg-muted">
          <Badge
            variant={isWon ? 'default' : 'destructive'}
            className="mb-2"
          >
            {isWon ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Ganho
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Perdido
              </>
            )}
          </Badge>

          {(lead.won_reason || lead.lost_reason) && (
            <p className="text-xs text-muted-foreground mt-1">
              {lead.won_reason || lead.lost_reason}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons for Active Leads */}
      {isActive && (
        <div className="flex gap-2">
          {/* Won Button */}
          <div className="flex-1">
            {!showWonReason ? (
              <Button
                onClick={() => setShowWonReason(true)}
                disabled={isLoading}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200 h-6 text-xs px-2"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Ganho
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="won-reason" className="text-xs">
                  Motivo da vitória (opcional)
                </Label>
                <Textarea
                  id="won-reason"
                  value={wonReason}
                  onChange={(e) => setWonReason(e.target.value)}
                  placeholder="Ex: Cliente fechou contrato..."
                  rows={2}
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleWon}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => setShowWonReason(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Lost Button */}
          <div className="flex-1">
            {!showLostReason ? (
              <Button
                onClick={() => setShowLostReason(true)}
                disabled={isLoading}
                variant="destructive"
                size="sm"
                className="w-full transition-all duration-200 h-6 text-xs px-2"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Perdido
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="lost-reason" className="text-xs">
                  Motivo da perda (opcional)
                </Label>
                <Textarea
                  id="lost-reason"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  placeholder="Ex: Cliente escolheu concorrente..."
                  rows={2}
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleLost}
                    disabled={isLoading}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => setShowLostReason(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};