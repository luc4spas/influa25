import React, { useState } from 'react';
import { X, CreditCard, Banknote } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  onUpdatePayment: (id: string, status: string, paymentMethod?: string, notes?: string) => Promise<void>;
}

export function PaymentModal({ isOpen, onClose, registration, onUpdatePayment }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      await onUpdatePayment(registration.id, 'confirmed', paymentMethod, notes);
      onClose();
      setNotes('');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPending = async () => {
    setLoading(true);
    try {
      await onUpdatePayment(registration.id, 'pending');
      onClose();
      setNotes('');
    } catch (error) {
      console.error('Erro ao marcar como pendente:', error);
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
              Gerenciar Pagamento
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status atual:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                registration.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {registration.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          {registration.status !== 'confirmed' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    paymentMethod === 'pix'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <span className="text-sm font-medium">PIX</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    paymentMethod === 'dinheiro'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <span className="text-sm font-medium">Dinheiro</span>
                </button>
              </div>
            </div>
          )}

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
              placeholder="Adicione observações sobre o pagamento..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {registration.status !== 'confirmed' ? (
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
              </button>
            ) : (
              <button
                onClick={handleMarkPending}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Alterando...' : 'Marcar como Pendente'}
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