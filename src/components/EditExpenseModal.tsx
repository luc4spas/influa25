import React, { useState } from 'react';
import { X, Upload, FileText, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Expense {
  id: string;
  created_at: string;
  amount: number;
  category: string;
  description: string;
  receipt_url?: string;
  receipt_filename?: string;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  onUpdateExpense: (id: string, expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
}

export function EditExpenseModal({ isOpen, onClose, expense, onUpdateExpense }: EditExpenseModalProps) {
  const [expenseForm, setExpenseForm] = useState({
    amount: expense.amount.toString(),
    category: expense.category,
    description: expense.description,
    receipt: null as File | null,
    keepCurrentReceipt: true
  });
  const [uploading, setUploading] = useState(false);

  const categories = [
    'Alimentação',
    'Decoração',
    'Som e Iluminação',
    'Material Gráfico',
    'Transporte',
    'Hospedagem',
    'Palestrante',
    'Equipamentos',
    'Limpeza',
    'Segurança',
    'Outros'
  ];

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PDF, JPG e PNG são permitidos');
        return;
      }
      
      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo deve ter no máximo 5MB');
        return;
      }
      
      setExpenseForm({ ...expenseForm, receipt: file, keepCurrentReceipt: false });
    }
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let receiptUrl = expense.receipt_url;
      let receiptFilename = expense.receipt_filename;

      // Se um novo arquivo foi selecionado, fazer upload
      if (expenseForm.receipt && !expenseForm.keepCurrentReceipt) {
        const newReceiptUrl = await uploadReceipt(expenseForm.receipt);
        receiptFilename = expenseForm.receipt.name;
        
        if (!newReceiptUrl) {
          toast.error('Erro ao fazer upload do comprovante');
          return;
        }
        
        receiptUrl = newReceiptUrl;
      }

      // Se o usuário removeu o comprovante atual
      if (!expenseForm.keepCurrentReceipt && !expenseForm.receipt) {
        receiptUrl = undefined;
        receiptFilename = undefined;
      }

      await onUpdateExpense(expense.id, {
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description,
        receipt_url: receiptUrl,
        receipt_filename: receiptFilename
      });

      toast.success('Despesa atualizada com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar despesa');
    } finally {
      setUploading(false);
    }
  };

  const removeCurrentReceipt = () => {
    setExpenseForm({ 
      ...expenseForm, 
      keepCurrentReceipt: false, 
      receipt: null 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Editar Despesa</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                required
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                required
                rows={3}
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Descreva a despesa..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprovante (PDF ou Imagem)
              </label>
              
              {/* Comprovante atual */}
              {expense.receipt_url && expenseForm.keepCurrentReceipt && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expense.receipt_filename?.endsWith('.pdf') ? (
                        <FileText className="w-4 h-4 text-red-600" />
                      ) : (
                        <Image className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm text-gray-700">
                        {expense.receipt_filename || 'Comprovante atual'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={expense.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Ver
                      </a>
                      <button
                        type="button"
                        onClick={removeCurrentReceipt}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload de novo comprovante */}
              {(!expense.receipt_url || !expenseForm.keepCurrentReceipt) && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-upload-edit"
                  />
                  <label
                    htmlFor="receipt-upload-edit"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {expenseForm.receipt ? expenseForm.receipt.name : 'Clique para selecionar arquivo'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, JPG ou PNG (máx. 5MB)
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-yellow-600 transition-all disabled:opacity-50"
            >
              {uploading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}