import React from 'react';
import { Users, DollarSign, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ isOpen, onClose, isExpanded, onToggleExpanded, activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'registrations',
      label: 'Registros',
      icon: Users,
    },
    {
      id: 'financial',
      label: 'Financeiro',
      icon: DollarSign,
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-40 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:h-auto
        ${isExpanded ? 'w-64' : 'w-16'}
      `}>
        <div className="flex flex-col h-full">
          {/* Toggle Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center justify-center w-full">
              <button
                onClick={onToggleExpanded}
                className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isExpanded ? 'Minimizar sidebar' : 'Expandir sidebar'}
              >
                {isExpanded ? (
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            <button
              onClick={onClose}
              className={`lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors ${!isExpanded ? 'absolute top-4 right-4' : ''}`}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onSectionChange(item.id);
                        onClose(); // Close sidebar on mobile after selection
                      }}
                      className={`
                        w-full flex items-center rounded-lg text-left transition-all duration-200
                        ${isExpanded ? 'px-4 py-3' : 'px-2 py-3 justify-center'}
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-yellow-500 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 ${isExpanded ? 'mr-3' : ''}`} />
                      {isExpanded && (
                        <div>
                          <div className="font-medium">{item.label}</div>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {isExpanded && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Influa Conference 2025
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}