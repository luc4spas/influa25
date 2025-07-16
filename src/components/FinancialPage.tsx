import React, { useEffect, useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, 
  Upload, Trash2, FileText, Image, Download, Edit3
} from 'lucide-react';
import { useDashboardStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { EditExpenseModal } from './EditExpenseModal';
import toast from 'react-hot-toast';

export function FinancialPage() {
  const { 
    totalRevenue, 
    totalExpenses, 
    expenses, 
    fetchExpenses,
    addExpense,
    deleteExpense,
    updateExpense
  } = useDashboardStore();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    receipt: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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
      
      setExpenseForm({ ...expenseForm, receipt: file });
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

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let receiptUrl = null;
      let receiptFilename = null;

      if (expenseForm.receipt) {
        receiptUrl = await uploadReceipt(expenseForm.receipt);
        receiptFilename = expenseForm.receipt.name;
        
        if (!receiptUrl) {
          toast.error('Erro ao fazer upload do comprovante');
          return;
        }
      }

      await addExpense({
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description,
        receipt_url: receiptUrl ?? undefined,
        receipt_filename: receiptFilename ?? undefined
      });

      toast.success('Despesa adicionada com sucesso!');
      setShowAddExpense(false);
      setExpenseForm({
        amount: '',
        category: '',
        description: '',
        receipt: null
      });
    } catch (error) {
      toast.error('Erro ao adicionar despesa');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteExpense(id);
        toast.success('Despesa excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir despesa');
      }
    }
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setShowEditExpense(true);
  };

  const handleUpdateExpense = async (id: string, expenseData: any) => {
    try {
      await updateExpense(id, expenseData);
      setShowEditExpense(false);
      setSelectedExpense(null);
    } catch (error) {
      throw error;
    }
  };

  const balance = totalRevenue - totalExpenses;

  const exportFinancialReport = () => {
    const headers = ['Tipo', 'Descrição', 'Categoria', 'Valor', 'Data'];
    const data = [];

    // Adicionar receitas (registros confirmados)
    // Isso seria implementado buscando os registros confirmados
    data.push(['Receita', 'Inscrições confirmadas', 'Inscrições', `R$ ${totalRevenue.toFixed(2)}`, new Date().toLocaleDateString('pt-BR')]);

    // Adicionar despesas
    expenses.forEach(expense => {
      data.push([
        'Despesa',
        expense.description,
        expense.category,
        `R$ ${expense.amount.toFixed(2)}`,
        new Date(expense.created_at).toLocaleDateString('pt-BR')
      ]);
    });

    const csvContent = [headers, ...data]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão Financeira</h1>
          <p className="text-gray-600">Controle de entradas e saídas do evento</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportFinancialReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg hover:from-purple-700 hover:to-yellow-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-12 h-12 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total de Entradas</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <TrendingDown className="w-12 h-12 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Total de Saídas</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${balance >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
          <div className="flex items-center gap-4">
            <DollarSign className={`w-12 h-12 ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
            <div>
              <p className="text-sm text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-4">
            <FileText className="w-12 h-12 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Total de Despesas</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitExpense} className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Despesa</h2>
              
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
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
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-yellow-600 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Salvando...' : 'Salvar Despesa'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Histórico de Despesas</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprovante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma despesa cadastrada
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.receipt_url ? (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
                        >
                          {expense.receipt_filename?.endsWith('.pdf') ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <Image className="w-4 h-4" />
                          )}
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400">Sem comprovante</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                          title="Editar despesa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Excluir despesa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {selectedExpense && (
        <EditExpenseModal
          isOpen={showEditExpense}
          onClose={() => {
            setShowEditExpense(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
          onUpdateExpense={handleUpdateExpense}
        />
      )}
    </div>
  );
}