'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [activeClients, setActiveClients] = useState<any[]>([]);

  const checkRole = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              setRole(user.role);
          } catch (e) { console.error(e); }
      }
  };

  const fetchActiveClients = async () => {
      try {
          const res = await fetch('/api/trainer/active-clients');
          const data = await res.json();
          if (Array.isArray(data)) {
              setActiveClients(data);
          }
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
      checkRole();
      fetchActiveClients();
      const interval = setInterval(fetchActiveClients, 5000);

      window.addEventListener('user-login', checkRole);
      return () => {
          window.removeEventListener('user-login', checkRole);
          clearInterval(interval);
      };
  }, []);

  if (pathname === '/') return null;

  let isTrainer = false;
  if (role) isTrainer = role === 'trainer';
  else isTrainer = pathname.startsWith('/trainer');

  if (!isTrainer) {
      const clientTabs = [
        { name: 'Главная', icon: '🏠', path: '/client', isActive: (p: string) => p === '/client' },
        { name: 'Тренировка', icon: '💪', path: '/trainer/active', isActive: (p: string) => p.startsWith('/client/workout') || p.startsWith('/trainer/active') },
        { name: 'Вес', icon: '⚖️', path: '/client/weight', isActive: (p: string) => p === '/client/weight' },
        { name: 'Замеры', icon: '📏', path: '/client/measurements', isActive: (p: string) => p === '/client/measurements' },
      ];
      return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe pt-2 px-4 z-50 h-20">
          <div className="flex justify-around items-start pt-2">
            {clientTabs.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <button key={tab.path} onClick={() => router.push(tab.path)} className={`flex flex-col items-center justify-center w-full space-y-1 transition-colors ${active ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
                  <span className={`text-2xl ${active ? 'scale-110' : ''} transition-transform`}>{tab.icon}</span>
                  <span className="text-[10px] font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
  }

  const trainerTabs = [
    { name: 'Клиенты', icon: '👥', path: '/trainer', isActive: (p: string) => p === '/trainer' || p.startsWith('/trainer/client/') || p.startsWith('/trainer/workout/') },
    { name: 'Конструктор', icon: '📝', path: '/trainer/create-program', isActive: (p: string) => p === '/trainer/create-program' },
    { name: 'История', icon: '📈', path: '/trainer/history', isActive: (p: string) => p === '/trainer/history' },
  ];

  return (
    <>
      {activeClients.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 z-40 px-2 pb-2 pointer-events-none">
              <div className="flex justify-center">
                  <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-2xl p-2 shadow-2xl pointer-events-auto flex gap-3 items-center overflow-x-auto max-w-full">
                      <span className="text-[10px] text-green-400 font-bold uppercase whitespace-nowrap px-1 animate-pulse">● В зале:</span>
                      {activeClients.map(client => (
                          <button 
                            key={client.id}
                            onClick={() => router.push(`/trainer/workout/${client.id}`)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition ${pathname.includes(`/workout/${client.id}`) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                          >
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                                  {client.name[0]}
                              </div>
                              <span className="text-xs font-bold truncate max-w-[80px]">{client.name}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe pt-2 px-4 z-50 h-20">
        <div className="flex justify-around items-start pt-2">
          {trainerTabs.map((tab) => {
            const active = tab.isActive(pathname);
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`flex flex-col items-center justify-center w-full space-y-1 transition-colors ${active ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <span className={`text-2xl ${active ? 'scale-110' : ''} transition-transform`}>{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}