import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, LogOut, Search, Download, 
  TrendingUp, Clock, Shirt, Edit3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useDashboardStore } from '../lib/store';
import { PaymentModal } from './PaymentModal';
import { PaginationControls } from './PaginationControls';
import toast from 'react-hot-toast';

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedRegistration, setSelectedRegistration] = React.useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const { 
    registrations, 
    totalRegistrations,
    confirmedPayments,
    loading,
    searchTerm,
    statusFilter,
    currentPage,
    itemsPerPage,
    totalPages,
    setSearchTerm,
    setStatusFilter,
    setCurrentPage,
    setItemsPerPage,
    fetchRegistrations,
    updatePaymentStatus,
    exportToCSV,
    getPaginatedRegistrations
  } = useDashboardStore();

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Reset para primeira página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, setCurrentPage]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout.');
    }
  };

  const handleOpenPaymentModal = (registration: any) => {
    setSelectedRegistration(registration);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setSelectedRegistration(null);
    setIsPaymentModalOpen(false);
  };

  const handleUpdatePayment = async (id: string, status: string, paymentMethod?: string, notes?: string) => {
    try {
      await updatePaymentStatus(id, status, paymentMethod, notes);
      toast.success(
        status === 'confirmed' 
          ? 'Pagamento confirmado com sucesso!' 
          : 'Status alterado para pendente!'
      );
    } catch (error) {
      toast.error('Erro ao atualizar status do pagamento.');
      throw error;
    }
  };

  // Obter registros paginados
  const paginatedRegistrations = getPaginatedRegistrations();
  
  // Calcular total de registros filtrados para mostrar na paginação
  const filteredTotal = registrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        reg.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).length;

  const chartData = [
    { name: 'Confirmados', value: confirmedPayments, color: '#8B5CF6' },
    { name: 'Pendentes', value: totalRegistrations - confirmedPayments, color: '#F59E0B' }
  ];

  const shirtSizeData = registrations.reduce((acc, reg) => {
    const size = reg.shirt_size || 'M';
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const shirtChartData = Object.entries(shirtSizeData).map(([size, count]) => ({
    name: `Tamanho ${size}`,
    value: count,
    color: size === 'P' ? '#8B5CF6' : size === 'M' ? '#F59E0B' : '#10B981'
  }));

  const minorsCount = registrations.filter(reg => reg.age < 18).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-purple-500 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Influa Conference 2025" 
                className="h-12 w-auto mr-4"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-gray-600">Influa Conference 2025</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Registros</p>
                <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-12 h-12 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Pagamentos Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center gap-4">
              <Clock className="w-12 h-12 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{totalRegistrations - confirmedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Menores de 18 anos</p>
                <p className="text-2xl font-bold text-gray-900">{minorsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Status dos Pagamentos</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Tamanhos de Camisa</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shirtChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Results summary */}
            {filteredTotal > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                {filteredTotal === totalRegistrations 
                  ? `${totalRegistrations} registro${totalRegistrations !== 1 ? 's' : ''} encontrado${totalRegistrations !== 1 ? 's' : ''}`
                  : `${filteredTotal} de ${totalRegistrations} registro${totalRegistrations !== 1 ? 's' : ''} encontrado${filteredTotal !== 1 ? 's' : ''}`
                }
              </div>
            )}
          </div>
        </div>

        {/* Participants Table - Full Width */}
        <div className="bg-white rounded-xl shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-50 to-yellow-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Camisa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                          <span className="ml-2">Carregando...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        {filteredTotal === 0 ? 'Nenhum registro encontrado' : 'Nenhum registro nesta página'}
                      </td>
                    </tr>
                  ) : (
                    paginatedRegistrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {registration.name}
                          </div>
                          {registration.age < 18 && registration.guardian_name && (
                            <div className="text-xs text-gray-500">
                              Responsável: {registration.guardian_name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {registration.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.age} anos
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Shirt className="w-3 h-3 mr-1" />
                            {registration.shirt_size || 'M'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            registration.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {registration.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {registration.payment_method && (
                            <div className="text-sm">
                              <div className="text-gray-900 font-medium">
                                {registration.payment_method === 'pix' ? 'PIX' : 'Dinheiro'}
                              </div>
                              {registration.payment_date && (
                                <div className="text-gray-500 text-xs">
                                  {new Date(registration.payment_date).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenPaymentModal(registration)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Gerenciar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredTotal}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

        {/* Payment Modal */}
        {selectedRegistration && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            registration={selectedRegistration}
            onUpdatePayment={handleUpdatePayment}
          />
        )}
      </main>
    </div>
  );
}