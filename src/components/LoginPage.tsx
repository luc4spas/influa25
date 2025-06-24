import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Verificar se o usuário é um administrador
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        throw new Error('Usuário não autorizado');
      }

      navigate('/dashboard');
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/rabisco.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Carinhas animadas */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-12 h-12 opacity-70 animate-float"
          style={{ 
            top: '10%', 
            left: '10%',
            filter: 'drop-shadow(0 0 10px rgba(255, 193, 7, 0.5))'
          }}
        />
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-8 h-8 opacity-60 animate-float"
          style={{ 
            top: '20%', 
            right: '15%',
            animationDelay: '-2s',
            filter: 'drop-shadow(0 0 8px rgba(255, 193, 7, 0.4))'
          }}
        />
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-10 h-10 opacity-50 animate-float"
          style={{ 
            bottom: '15%', 
            left: '20%',
            animationDelay: '-4s',
            filter: 'drop-shadow(0 0 12px rgba(255, 193, 7, 0.6))'
          }}
        />
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-14 h-14 opacity-40 animate-float"
          style={{ 
            bottom: '25%', 
            right: '25%',
            animationDelay: '-1s',
            filter: 'drop-shadow(0 0 15px rgba(255, 193, 7, 0.3))'
          }}
        />
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-6 h-6 opacity-80 animate-float"
          style={{ 
            top: '50%', 
            left: '5%',
            animationDelay: '-3s',
            filter: 'drop-shadow(0 0 6px rgba(255, 193, 7, 0.7))'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Influa Conference 2025" 
                className="h-16 w-auto"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Área Administrativa
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Faça login para acessar o painel administrativo
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
            >
              ← Voltar para Inscrições
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}