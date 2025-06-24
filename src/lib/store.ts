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
}

interface DashboardStore {
  registrations: Registration[];
  totalRegistrations: number;
  confirmedPayments: number;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  fetchRegistrations: () => Promise<void>;
  exportToCSV: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  registrations: [],
  totalRegistrations: 0,
  confirmedPayments: 0,
  loading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'all',

  setSearchTerm: (term) => set({ searchTerm: term }),
  setStatusFilter: (status) => set({ statusFilter: status }),

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

    const headers = ['Nome', 'Email', 'Telefone', 'Idade', 'Tamanho da Camisa', 'Responsável', 'Status', 'Data de Registro'];
    const csvData = registrations.map(reg => [
      reg.name,
      reg.email,
      reg.phone,
      reg.age,
      reg.shirt_size || 'M',
      reg.guardian_name || '',
      reg.status === 'confirmed' ? 'Confirmado' : 'Pendente',
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
  }
}));