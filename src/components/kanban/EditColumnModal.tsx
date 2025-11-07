import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import type { KanbanColumn as ColumnType, UpdateColumnDto } from '../../types/kanban';

interface EditColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateColumnDto) => Promise<void>;
  column: ColumnType | null;
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#10B981', // Green
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export const EditColumnModal: React.FC<EditColumnModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  column,
}) => {
  const [formData, setFormData] = useState<UpdateColumnDto>({
    name: '',
    color: predefinedColors[0],
    is_mql: false,
  });
  const [loading, setLoading] = useState(false);

  // Update form data when column changes
  useEffect(() => {
    if (column) {
      setFormData({
        name: column.name,
        color: column.color || predefinedColors[0],
        is_mql: column.is_mql || false,
      });
    }
  }, [column]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !column) return;

    setLoading(true);
    try {
      await onSubmit(column.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating column:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (column) {
      setFormData({
        name: column.name,
        color: column.color || predefinedColors[0],
        is_mql: column.is_mql || false,
      });
    }
    onClose();
  };

  if (!isOpen || !column) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              Editar Coluna
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome da Coluna *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Novo Lead, Qualificado, Proposta..."
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cor
            </label>
            <div className="flex gap-2 flex-wrap">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? 'border-foreground scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 border border-border rounded-md bg-muted/20">
            <input
              type="checkbox"
              id="is_mql"
              checked={formData.is_mql || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_mql: e.target.checked }))}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              disabled={loading}
            />
            <label htmlFor="is_mql" className="text-sm font-medium text-foreground cursor-pointer flex-1">
              <div className="flex items-center gap-2">
                <span>📊 Marcar como MQL</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Marketing Qualified Lead - Leads nesta coluna serão contabilizados no cálculo de MQL
              </p>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!formData.name?.trim() || loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};