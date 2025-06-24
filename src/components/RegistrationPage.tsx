import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function RegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    shirt_size: '',
    guardian_name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const registrationData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        shirt_size: formData.shirt_size,
        status: 'pending'
      };

      // Adicionar nome do responsável se menor de 18 anos
      if (parseInt(formData.age) < 18 && formData.guardian_name) {
        registrationData.guardian_name = formData.guardian_name;
      }

      const { error } = await supabase
        .from('registrations')
        .insert([registrationData]);

      if (error) throw error;

      toast.success('Registro realizado com sucesso!');
      navigate('/welcome');
    } catch (error) {
      toast.error('Erro ao realizar registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isMinor = parseInt(formData.age) < 18;

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
          className="absolute w-42 h-42 opacity-70 animate-float"
          style={{ 
            top: '50%', 
            left: '50%',
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
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-16 h-16 opacity-30 animate-float"
          style={{ 
            top: '70%', 
            right: '8%',
            animationDelay: '-5s',
            filter: 'drop-shadow(0 0 20px rgba(255, 193, 7, 0.2))'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Influa Conference 2025" 
                className="h-20 w-auto"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}
              />
            </div>
            <p className="text-gray-600 mb-2">
              Preencha o formulário para se inscrever
            </p>
            <p className="text-sm text-purple-600 font-medium">
              DIA 19/07 • INVESTIMENTO: R$ 100
            </p>
            <p className="text-xs text-gray-500">
              CAMISA + LANCHE DA TARDE INCLUSO
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Idade
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {isMinor && (
                <div className="animate-fade-in">
                  <label htmlFor="guardian_name" className="block text-sm font-medium text-gray-700">
                    Nome do Responsável
                  </label>
                  <input
                    id="guardian_name"
                    name="guardian_name"
                    type="text"
                    required
                    value={formData.guardian_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Obrigatório para menores de 18 anos"
                  />
                </div>
              )}

              <div>
                <label htmlFor="shirt_size" className="block text-sm font-medium text-gray-700">
                  Tamanho da Camisa
                </label>
                <select
                  id="shirt_size"
                  name="shirt_size"
                  required
                  value={formData.shirt_size}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value=""></option>
                  <option value="P">P - Pequeno</option>
                  <option value="M">M - Médio</option>
                  <option value="G">G - Grande</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || (isMinor && !formData.guardian_name)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Registrando...' : 'Registrar no Influa 2025'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
            >
              Área Administrativa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}