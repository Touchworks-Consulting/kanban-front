import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import type { CreateColumnDto } from '../../types';

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateColumnDto) => Promise<void>;
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

export const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateColumnDto>({
    name: '',
    color: predefinedColors[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', color: predefinedColors[0] });
      onClose();
    } catch (error) {
      console.error('Error creating column:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', color: predefinedColors[0] });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              Nova Coluna
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
              value={formData.name}
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
              disabled={!formData.name.trim() || loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Criando...' : 'Criar Coluna'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};