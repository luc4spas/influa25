import React, { useState } from 'react';
import { X, Package, PackageCheck, Shirt } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ShirtDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: {
    id: string;
    name: string;
    email: string;
    shirt_size: string;
    shirt_delivered?: boolean;
    shirt_delivery_date?: string;
    shirt_delivery_notes?: string;
  };
  onUpdateDelivery: (id: string, delivered: boolean, notes?: string) => Promise<void>;
}

export function ShirtDeliveryModal({ isOpen, onClose, registration, onUpdateDelivery }: ShirtDeliveryModalProps) {
  const [notes, setNotes] = useState<string>(registration.shirt_delivery_notes || '');
  const [newShirtSize, setNewShirtSize] = useState<string>(registration.shirt_size || 'M');
  const [sizeChanged, setSizeChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const shirtSizes = [
    { value: 'PP', label: 'PP - Extra Pequeno' },
    { value: 'P', label: 'P - Pequeno' },
    { value: 'M', label: 'M - Médio' },
    { value: 'G', label: 'G - Grande' },
    { value: 'GG', label: 'GG - Extra Grande' }
  ];

  if (!isOpen) return null;

  const handleSizeChange = (size: string) => {
    setNewShirtSize(size);
    setSizeChanged(size !== registration.shirt_size);
  };

  const updateShirtSize = async (registrationId: string, size: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ shirt_size: size })
        .eq('id', registrationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar tamanho da camisa:', error);
      throw error;
    }
  };

  const handleMarkDelivered = async () => {
    setLoading(true);
    try {
      // Se o tamanho foi alterado, atualizar primeiro
      if (sizeChanged) {
        await updateShirtSize(registration.id, newShirtSize);
        toast.success(`Tamanho da camisa alterado para ${newShirtSize}`);
      }
      
      await onUpdateDelivery(registration.id, true, notes);
      onClose();
      setNotes('');
      setSizeChanged(false);
    } catch (error) {
      console.error('Erro ao marcar camisa como entregue:', error);
      toast.error('Erro ao processar entrega da camisa');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotDelivered = async () => {
    setLoading(true);
    try {
      // Se o tamanho foi alterado, atualizar primeiro
      if (sizeChanged) {
        await updateShirtSize(registration.id, newShirtSize);
        toast.success(`Tamanho da camisa alterado para ${newShirtSize}`);
      }
      
      await onUpdateDelivery(registration.id, false, notes);
      onClose();
      setNotes('');
      setSizeChanged(false);
    } catch (error) {
      console.error('Erro ao marcar camisa como não entregue:', error);
      toast.error('Erro ao processar alteração da camisa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Entrega de Camisa
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Registration Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">{registration.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{registration.email}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Tamanho:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {registration.shirt_size}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  registration.shirt_delivered
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {registration.shirt_delivered ? 'Entregue' : 'Não Entregue'}
                </span>
              </div>
            </div>
            {registration.shirt_delivery_date && (
              <p className="text-xs text-gray-500 mt-2">
                Entregue em: {new Date(registration.shirt_delivery_date).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Shirt Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4" />
                Tamanho da Camisa
              </div>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {shirtSizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => handleSizeChange(size.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                    newShirtSize === size.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
            {sizeChanged && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Tamanho será alterado de <strong>{registration.shirt_size}</strong> para <strong>{newShirtSize}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              placeholder="Adicione observações sobre a entrega..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!registration.shirt_delivered ? (
              <button
                onClick={handleMarkDelivered}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
              >
                <PackageCheck className="w-4 h-4" />
                {loading ? 'Marcando...' : 'Marcar como Entregue'}
              </button>
            ) : (
              <button
                onClick={handleMarkNotDelivered}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50"
              >
                <Package className="w-4 h-4" />
                {loading ? 'Alterando...' : 'Marcar como Não Entregue'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}