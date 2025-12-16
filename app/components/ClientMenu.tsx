'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { 
        name: 'Тренировка', 
        icon: '💪', 
        path: '/client', 
        // Активна на главной или внутри тренировки
        isActive: (p: string) => p === '/client' || p.startsWith('/client/workout') 
    },
    { 
        name: 'Вес', 
        icon: '⚖️', 
        path: '/client/weight', 
        isActive: (p: string) => p === '/client/weight' 
    },
    { 
        name: 'Замеры', 
        icon: '📏', 
        path: '/client/measurements', 
        isActive: (p: string) => p === '/client/measurements' 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe pt-2 px-4 z-50 h-20">
      <div className="flex justify-around items-start pt-2">
        {tabs.map((tab) => {
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
  );
}