import { create } from 'zustand';
import { supabase } from './supabase';

interface Registration {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  status: string;
  shirt_size: string;
  guardian_name?: string;
  payment_method?: string;
  payment_date?: string;
  payment_notes?: string;
}

interface DashboardStore {
  registrations: Registration[];
  totalRegistrations: number;
  confirmedPayments: number;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  fetchRegistrations: () => Promise<void>;
  updatePaymentStatus: (id: string, status: string, paymentMethod?: string, notes?: string) => Promise<void>;
  exportToCSV: () => void;
  getPaginatedRegistrations: () => Registration[];
  calculateAndSetTotalPages: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  registrations: [],
  totalRegistrations: 0,
  confirmedPayments: 0,
  loading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'all',
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 1,

  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().calculateAndSetTotalPages();
  },
  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().calculateAndSetTotalPages();
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (items) => {
    set({ itemsPerPage: items, currentPage: 1 });
    get().calculateAndSetTotalPages();
  },

  calculateAndSetTotalPages: () => {
    const { registrations, searchTerm, statusFilter, itemsPerPage } = get();
    
    // Filter registrations
    const filteredRegistrations = registrations.filter(reg => {
      const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Calculate total pages
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    set({ totalPages });
  },

  fetchRegistrations: async () => {
    set({ loading: true, error: null });
    try {
      // Verificar se há uma sessão ativa
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error('Não autenticado');
      }

      // Buscar registros com RLS desabilitado para admin
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar registros:', error);
        throw error;
      }

      console.log('Dados recebidos:', data);

      if (!data) {
        set({
          registrations: [],
          totalRegistrations: 0,
          confirmedPayments: 0,
          loading: false
        });
        return;
      }

      const confirmed = data.filter(reg => reg.status === 'confirmed').length;

      set({
        registrations: data,
        totalRegistrations: data.length,
        confirmedPayments: confirmed,
        loading: false
      });

      // Calculate total pages after fetching data
      get().calculateAndSetTotalPages();
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      set({ 
        error: 'Erro ao carregar registros', 
        loading: false,
        registrations: [],
        totalRegistrations: 0,
        confirmedPayments: 0
      });
    }
  },

  exportToCSV: () => {
    const { registrations } = get();
    
    if (registrations.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const headers = ['Nome', 'Email', 'Telefone', 'Idade', 'Tamanho da Camisa', 'Responsável', 'Status', 'Método de Pagamento', 'Data do Pagamento', 'Observações', 'Data de Registro'];
    const csvData = registrations.map(reg => [
      reg.name,
      reg.email,
      reg.phone,
      reg.age,
      reg.shirt_size || 'M',
      reg.guardian_name || '',
      reg.status === 'confirmed' ? 'Confirmado' : 'Pendente',
      reg.payment_method || '',
      reg.payment_date ? new Date(reg.payment_date).toLocaleDateString('pt-BR') : '',
      reg.payment_notes || '',
      new Date(reg.created_at).toLocaleDateString('pt-BR')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `influa_2025_registros_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  updatePaymentStatus: async (id: string, status: string, paymentMethod?: string, notes?: string) => {
    try {
      const updateData: any = {
        status,
        payment_date: status === 'confirmed' ? new Date().toISOString() : null,
        payment_method: status === 'confirmed' ? paymentMethod : null,
        payment_notes: notes || null
      };

      const { error } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Atualizar o estado local
      const { registrations } = get();
      const updatedRegistrations = registrations.map(reg => 
        reg.id === id 
          ? { 
              ...reg, 
              status, 
              payment_method: updateData.payment_method,
              payment_date: updateData.payment_date,
              payment_notes: updateData.payment_notes
            }
          : reg
      );

      const confirmed = updatedRegistrations.filter(reg => reg.status === 'confirmed').length;

      set({
        registrations: updatedRegistrations,
        confirmedPayments: confirmed
      });

      // Recalculate total pages after updating data
      get().calculateAndSetTotalPages();

    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      throw error;
    }
  },

  getPaginatedRegistrations: () => {
    const { registrations, searchTerm, statusFilter, currentPage, itemsPerPage } = get();
    
    // Filtrar registros
    const filteredRegistrations = registrations.filter(reg => {
      const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Paginar resultados
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredRegistrations.slice(startIndex, endIndex);
  }
}));