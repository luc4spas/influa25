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
  payment_amount?: number;
  payment_bank?: string;
  shirt_delivered?: boolean;
  shirt_delivery_date?: string;
  shirt_delivery_notes?: string;
}

interface Expense {
  id: string;
  created_at: string;
  amount: number;
  category: string;
  description: string;
  receipt_url?: string;
  receipt_filename?: string;
}

interface DashboardStore {
  registrations: Registration[];
  expenses: Expense[];
  totalRegistrations: number;
  confirmedPayments: number;
  totalParticipants: number;
  deliveredShirts: number;
  totalRevenue: number;
  totalExpenses: number;
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
  fetchExpenses: () => Promise<void>;
  updatePaymentStatus: (id: string, status: string, paymentMethod?: string, notes?: string, amount?: number, bank?: string) => Promise<void>;
  updateShirtDelivery: (id: string, delivered: boolean, notes?: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  exportToCSV: () => void;
  getPaginatedRegistrations: () => Registration[];
  calculateAndSetTotalPages: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  registrations: [],
  expenses: [],
  totalRegistrations: 0,
  confirmedPayments: 0,
  totalParticipants: 0,
  deliveredShirts: 0,
  totalRevenue: 0,
  totalExpenses: 0,
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
          deliveredShirts: 0,
          loading: false
        });
        return;
      }

      const confirmed = data.filter(reg => reg.status === 'confirmed').length;
      const participated = data.filter(reg => reg.status === 'participated').length;
      const totalParticipants = confirmed + participated;
      const delivered = data.filter(reg => reg.shirt_delivered === true).length;
      // Calcular receita apenas de pagamentos confirmados
      const revenue = data
        .filter(reg => reg.status === 'confirmed' && reg.payment_amount)
        .reduce((sum, reg) => sum + (reg.payment_amount || 0), 0);

      set({
        registrations: data,
        totalRegistrations: data.length,
        confirmedPayments: confirmed,
        totalParticipants,
        deliveredShirts: delivered,
        totalRevenue: revenue,
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
        confirmedPayments: 0,
        totalParticipants: 0,
        deliveredShirts: 0
      });
    }
  },

  fetchExpenses: async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalExpenses = data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

      set({
        expenses: data || [],
        totalExpenses
      });
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    }
  },

  exportToCSV: () => {
    const { registrations } = get();
    
    if (registrations.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const headers = ['Nome', 'Email', 'Telefone', 'Idade', 'Tamanho da Camisa', 'Responsável', 'Status', 'Método de Pagamento', 'Valor Pago', 'Banco', 'Data do Pagamento', 'Observações', 'Camisa Entregue', 'Data da Entrega', 'Obs. Entrega', 'Data de Registro'];
    const csvData = registrations.map(reg => [
      reg.name,
      reg.email,
      reg.phone,
      reg.age,
      reg.shirt_size || 'M',
      reg.guardian_name || '',
      reg.status === 'confirmed' ? 'Confirmado' : reg.status === 'participated' ? 'Vai Pagar Depois' : 'Pendente',
      reg.payment_method || '',
      reg.payment_amount ? `R$ ${reg.payment_amount.toFixed(2)}` : '',
      reg.payment_bank || '',
      reg.payment_date ? new Date(reg.payment_date).toLocaleDateString('pt-BR') : '',
      reg.payment_notes || '',
      reg.shirt_delivered ? 'Sim' : 'Não',
      reg.shirt_delivery_date ? new Date(reg.shirt_delivery_date).toLocaleDateString('pt-BR') : '',
      reg.shirt_delivery_notes || '',
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

  updatePaymentStatus: async (id: string, status: string, paymentMethod?: string, notes?: string, amount?: number, bank?: string) => {
    try {
      const updateData: any = {
        status,
        payment_date: status === 'confirmed' ? new Date().toISOString() : null,
        payment_method: status === 'confirmed' ? paymentMethod : null,
        payment_notes: notes || null,
        payment_amount: status === 'confirmed' ? amount : null,
        payment_bank: status === 'confirmed' ? bank : null
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
              payment_notes: updateData.payment_notes,
              payment_amount: updateData.payment_amount,
              payment_bank: updateData.payment_bank
            }
          : reg
      );

      const confirmed = updatedRegistrations.filter(reg => reg.status === 'confirmed').length;
      const participated = updatedRegistrations.filter(reg => reg.status === 'participated').length;
      const totalParticipants = confirmed + participated;
      // Calcular receita apenas de pagamentos confirmados
      const revenue = updatedRegistrations
        .filter(reg => reg.status === 'confirmed' && reg.payment_amount)
        .reduce((sum, reg) => sum + (reg.payment_amount || 0), 0);

      set({
        registrations: updatedRegistrations,
        confirmedPayments: confirmed,
        totalParticipants,
        totalRevenue: revenue
      });

      // Recalculate total pages after updating data
      get().calculateAndSetTotalPages();

    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      throw error;
    }
  },

  updateShirtDelivery: async (id: string, delivered: boolean, notes?: string) => {
    try {
      const updateData: any = {
        shirt_delivered: delivered,
        shirt_delivery_date: delivered ? new Date().toISOString() : null,
        shirt_delivery_notes: notes || null
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
              shirt_delivered: delivered,
              shirt_delivery_date: updateData.shirt_delivery_date,
              shirt_delivery_notes: updateData.shirt_delivery_notes
            }
          : reg
      );

      const delivered_count = updatedRegistrations.filter(reg => reg.shirt_delivered === true).length;

      set({
        registrations: updatedRegistrations,
        deliveredShirts: delivered_count
      });

      // Recalculate total pages after updating data
      get().calculateAndSetTotalPages();

      // Recarregar dados para garantir sincronização
      await get().fetchRegistrations();

    } catch (error) {
      console.error('Erro ao atualizar entrega de camisa:', error);
      throw error;
    }
  },

  addExpense: async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([expense]);

      if (error) throw error;

      // Recarregar despesas
      await get().fetchExpenses();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local
      const { expenses } = get();
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      const totalExpenses = updatedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      set({
        expenses: updatedExpenses,
        totalExpenses
      });
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
  },

  updateExpense: async (id: string, expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local
      const { expenses } = get();
      const updatedExpenses = expenses.map(expense => 
        expense.id === id 
          ? { ...expense, ...expenseData }
          : expense
      );
      const totalExpenses = updatedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      set({
        expenses: updatedExpenses,
        totalExpenses
      });
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
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