import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Gift } from 'lucide-react';

export function WelcomePage() {
  const navigate = useNavigate();

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
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-9 h-9 opacity-65 animate-float"
          style={{ 
            top: '35%', 
            right: '40%',
            animationDelay: '-6s',
            filter: 'drop-shadow(0 0 9px rgba(255, 193, 7, 0.5))'
          }}
        />
        <img 
          src="/carinha.png" 
          alt="" 
          className="absolute w-11 h-11 opacity-45 animate-float"
          style={{ 
            bottom: '40%', 
            left: '8%',
            animationDelay: '-7s',
            filter: 'drop-shadow(0 0 11px rgba(255, 193, 7, 0.4))'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Main Welcome Card */}
          <div className="bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/logo.png" 
                alt="Influa Conference 2025" 
                className="h-24 w-auto"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">
                🎉 Bem-vindo ao Influa 2025!
              </h2>
              
              <p className="text-lg text-gray-600">
                Sua inscrição foi realizada com sucesso! Estamos muito animados para te ver no evento.
              </p>

              <div className="bg-gradient-to-r from-purple-100 to-yellow-100 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">
                  Detalhes do Evento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">19 de Julho de 2025</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Horário em breve</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Local em breve</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Camisa + Lanche incluso</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                <h4 className="text-green-800 font-semibold mb-4 text-lg">
                  💰 Informações de Pagamento
                </h4>
                
                <div className="space-y-4">
                  <p className="text-green-800">
                    <strong>Valor:</strong> R$ 100,00 (Camisa + Lanche incluso)
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium mb-3">
                      Pague via PIX da Igreja:
                    </p>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src="/qrcode-pix.png" 
                          alt="QR Code PIX" 
                          className="w-32 h-32 border border-gray-200 rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1 w-full">
                        <p className="text-sm text-gray-600 mb-2">
                          Ou copie e cole o código PIX:
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <code className="text-xs break-all text-gray-800 font-mono">
                            00020126360014BR.GOV.BCB.PIX0114234289410001265204000053039865406100.005802BR5901N6001C62100506INFLUA6304321A
                          </code>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('00020126360014BR.GOV.BCB.PIX0114234289410001265204000053039865406100.005802BR5901N6001C62100506INFLUA6304321A');
                            alert('Código PIX copiado!');
                          }}
                          className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          📋 Copiar Código PIX
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-yellow-800">
                  <strong>Próximos passos:</strong> Realize o pagamento via PIX e aguarde a confirmação. Mais detalhes do evento serão enviados em breve.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full max-w-md mx-auto block py-3 px-6 bg-gradient-to-r from-purple-600 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200"
            >
              Fazer Nova Inscrição
            </button>
            
            <p className="text-white/80 text-sm">
              Quer inscrever mais alguém? Clique no botão acima!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}