import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, LogOut, Search, Download, Menu,
  TrendingUp, Clock, Shirt, Edit3, Package, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useDashboardStore } from '../lib/store';
import { PaymentModal } from './PaymentModal';
import { ShirtDeliveryModal } from './ShirtDeliveryModal';
import { PaginationControls } from './PaginationControls';
import { Sidebar } from './Sidebar';
import { FinancialPage } from './FinancialPage';
import toast from 'react-hot-toast';

export function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState('registrations');
  const [selectedRegistration, setSelectedRegistration] = React.useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isShirtModalOpen, setIsShirtModalOpen] = React.useState(false);
  const { 
    registrations, 
    totalRegistrations,
    confirmedPayments,
    deliveredShirts,
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
    updateShirtDelivery,
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

  const handleRefresh = async () => {
    toast.loading('Atualizando dados...', { id: 'refresh' });
    try {
      await fetchRegistrations();
      toast.success('Dados atualizados com sucesso!', { id: 'refresh' });
    } catch (error) {
      toast.error('Erro ao atualizar dados.', { id: 'refresh' });
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

  const handleOpenShirtModal = (registration: any) => {
    setSelectedRegistration(registration);
    setIsShirtModalOpen(true);
  };

  const handleCloseShirtModal = () => {
    setSelectedRegistration(null);
    setIsShirtModalOpen(false);
  };

  const handleUpdatePayment = async (id: string, status: string, paymentMethod?: string, notes?: string, amount?: number, bank?: string) => {
    try {
      await updatePaymentStatus(id, status, paymentMethod, notes, amount, bank);
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

  const handleUpdateShirtDelivery = async (id: string, delivered: boolean, notes?: string) => {
    try {
      await updateShirtDelivery(id, delivered, notes);
      toast.success(
        delivered 
          ? 'Camisa marcada como entregue!' 
          : 'Camisa marcada como não entregue!'
      );
    } catch (error) {
      toast.error('Erro ao atualizar entrega da camisa.');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 flex flex-col">
      {/* Header - 100% width at top */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-purple-500 to-yellow-500 w-full z-30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
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

      {/* Content area with sidebar and main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isExpanded={sidebarExpanded}
          onToggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-0' : 'lg:ml-0'} px-4 sm:px-6 lg:px-8 py-8 min-w-0`}>
          {activeSection === 'registrations' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center gap-4">
                    <Users className="w-12 h-12 text-purple-500" />
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Total de Registros</p>
                      <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="w-12 h-12 text-green-500" />
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Pagamentos Confirmados</p>
                      <p className="text-2xl font-bold text-gray-900">{confirmedPayments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center gap-4">
                    <Clock className="w-12 h-12 text-yellow-500" />
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Pagamentos Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900">{totalRegistrations - confirmedPayments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                  <div className="flex items-center gap-4">
                    <Package className="w-12 h-12 text-indigo-500" />
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Camisas Entregues</p>
                      <p className="text-2xl font-bold text-gray-900">{deliveredShirts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center gap-4">
                    <Users className="w-12 h-12 text-blue-500" />
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Menores de 18 anos</p>
                      <p className="text-2xl font-bold text-gray-900">{minorsCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
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
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 w-full lg:max-w-md">
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

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-0"
                      >
                        <option value="all">Todos os status</option>
                        <option value="pending">Pendente</option>
                        <option value="confirmed">Confirmado</option>
                      </select>

                      <div className="flex gap-3">
                        <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 whitespace-nowrap"
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Atualizar</span>
                      </button>
                        <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg whitespace-nowrap"
                      >
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:inline">Exportar</span>
                      </button>
                      </div>
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

              {/* Participants Table */}
              <div className="bg-white rounded-xl shadow-lg">
                {/* Mobile Cards View */}
                <div className="block lg:hidden">
                  <div className="p-4 space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        <span className="ml-2">Carregando...</span>
                      </div>
                    ) : paginatedRegistrations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {filteredTotal === 0 ? 'Nenhum registro encontrado' : 'Nenhum registro nesta página'}
                      </div>
                    ) : (
                      paginatedRegistrations.map((registration) => (
                        <div key={registration.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{registration.name}</h3>
                              <p className="text-sm text-gray-600">{registration.email}</p>
                              {registration.age < 18 && registration.guardian_name && (
                                <p className="text-xs text-gray-500">
                                  Responsável: {registration.guardian_name}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              registration.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {registration.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Idade:</span>
                              <span className="ml-1 font-medium">{registration.age} anos</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Camisa:</span>
                              <span className="ml-1 font-medium">{registration.shirt_size || 'M'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Entrega:</span>
                              <span className={`ml-1 font-medium ${
                                registration.shirt_delivered ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {registration.shirt_delivered ? 'Entregue' : 'Pendente'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Data:</span>
                              <span className="ml-1 font-medium">
                                {new Date(registration.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          {registration.payment_method && (
                            <div className="text-sm">
                              <span className="text-gray-500">Pagamento:</span>
                              <span className="ml-1 font-medium">
                                {registration.payment_method === 'pix' ? 'PIX' : 'Dinheiro'}
                                {registration.payment_amount && ` - R$ ${registration.payment_amount.toFixed(2)}`}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleOpenPaymentModal(registration)}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              Pagamento
                            </button>
                            <button
                              onClick={() => handleOpenShirtModal(registration)}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
                            >
                              <Package className="w-4 h-4 mr-1" />
                              Camisa
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-purple-50 to-yellow-50">
                      <tr>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Idade
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Camisa
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pagamento
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entrega
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={9} className="px-4 xl:px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                              <span className="ml-2">Carregando...</span>
                            </div>
                          </td>
                        </tr>
                      ) : paginatedRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 xl:px-6 py-4 text-center text-gray-500">
                            {filteredTotal === 0 ? 'Nenhum registro encontrado' : 'Nenhum registro nesta página'}
                          </td>
                        </tr>
                      ) : (
                        paginatedRegistrations.map((registration) => (
                          <tr key={registration.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 xl:px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {registration.name}
                              </div>
                              {registration.age < 18 && registration.guardian_name && (
                                <div className="text-xs text-gray-500">
                                  Responsável: {registration.guardian_name}
                                </div>
                              )}
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {registration.email}
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {registration.age} anos
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Shirt className="w-3 h-3 mr-1" />
                                {registration.shirt_size || 'M'}
                              </span>
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                registration.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {registration.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              {registration.payment_method && (
                                <div className="text-sm min-w-0">
                                  <div className="text-gray-900 font-medium">
                                    {registration.payment_method === 'pix' ? 'PIX' : 'Dinheiro'}
                                  </div>
                                  {registration.payment_amount && (
                                    <div className="text-gray-500 text-xs truncate">
                                      R$ {registration.payment_amount.toFixed(2)}
                                    </div>
                                  )}
                                  {registration.payment_date && (
                                    <div className="text-gray-500 text-xs truncate">
                                      {new Date(registration.payment_date).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                registration.shirt_delivered
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {registration.shirt_delivered ? 'Entregue' : 'Pendente'}
                              </span>
                              {registration.shirt_delivery_date && (
                                <div className="text-gray-500 text-xs mt-1 truncate">
                                  {new Date(registration.shirt_delivery_date).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(registration.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenPaymentModal(registration)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors duration-200 whitespace-nowrap"
                                  title="Gerenciar Pagamento"
                                >
                                  <Edit3 className="w-3 h-3 mr-1" />
                                  <span className="hidden xl:inline">Pag.</span>
                                </button>
                                <button
                                  onClick={() => handleOpenShirtModal(registration)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200 whitespace-nowrap"
                                  title="Gerenciar Entrega de Camisa"
                                >
                                  <Package className="w-3 h-3 mr-1" />
                                  <span className="hidden xl:inline">Camisa</span>
                                </button>
                              </div>
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
            </>
          ) : activeSection === 'financial' ? (
            <FinancialPage />
          ) : null}
        </main>
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

      {/* Shirt Delivery Modal */}
      {selectedRegistration && (
        <ShirtDeliveryModal
          isOpen={isShirtModalOpen}
          onClose={handleCloseShirtModal}
          registration={selectedRegistration}
          onUpdateDelivery={handleUpdateShirtDelivery}
        />
      )}
    </div>
  );
}