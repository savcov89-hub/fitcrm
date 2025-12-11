'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // Функция проверки роли
  const checkRole = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              setRole(user.role);
          } catch (e) {
              setRole(null);
          }
      } else {
          setRole(null);
      }
  };

  useEffect(() => {
      // 1. Проверяем при загрузке
      checkRole();

      // 2. Слушаем наше событие "user-login" (когда вошли)
      window.addEventListener('user-login', checkRole);
      
      // 3. Слушаем событие "storage" (если вышли в другой вкладке)
      window.addEventListener('storage', checkRole);

      return () => {
          window.removeEventListener('user-login', checkRole);
          window.removeEventListener('storage', checkRole);
      };
  }, []);

  // Если мы на странице входа — меню не показываем
  if (pathname === '/') return null;

  // Если роль известна — используем её. Если нет — гадаем по URL (как запасной вариант)
  const isTrainer = role ? role === 'trainer' : pathname.startsWith('/trainer');

  // ... (Дальше кнопки trainerTabs и clientTabs без изменений) ...
  // Кнопки для ТРЕНЕРА
  const trainerTabs = [
    { name: 'Клиенты', icon: '👥', path: '/trainer', isActive: (p: string) => p === '/trainer' || p.startsWith('/trainer/client/') || (p.startsWith('/trainer/workout/') && role === 'trainer') },
    { name: 'Конструктор', icon: '📝', path: '/trainer/create-program', isActive: (p: string) => p === '/trainer/create-program' },
    { name: 'История', icon: '📈', path: '/trainer/history', isActive: (p: string) => p === '/trainer/history' },
  ];

  // Кнопки для КЛИЕНТА
  const clientTabs = [
    { name: 'Главная', icon: '🏠', path: '/client', isActive: (p: string) => p === '/client' },
    { name: 'Тренировка', icon: '💪', path: '/trainer/active', isActive: (p: string) => p.startsWith('/client/workout') || p.startsWith('/trainer/active') },
    { name: 'Вес', icon: '⚖️', path: '/client/weight', isActive: (p: string) => p === '/client/weight' },
    { name: 'Замеры', icon: '📏', path: '/client/measurements', isActive: (p: string) => p === '/client/measurements' },
  ];

  const tabs = isTrainer ? trainerTabs : clientTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe pt-2 px-4 z-50 h-20">
      <div className="flex justify-around items-start pt-2">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center w-full space-y-1 transition-colors ${
                active ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className={`text-2xl ${active ? 'scale-110' : ''} transition-transform`}>{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}