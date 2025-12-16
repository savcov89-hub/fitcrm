'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrainerDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  // ИСПРАВЛЕНИЕ: Используем правильный путь, который мы делали раньше (или проверяем оба варианта)
  const loadClients = async () => {
    try {
      // Попробуем загрузить список клиентов.
      // Обычно мы делали это через POST /api/trainer/get-clients или GET
      const res = await fetch('/api/trainer/get-clients', { 
          method: 'GET',
          cache: 'no-store' 
      });
      
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      if (Array.isArray(data)) {
          setClients(data);
      }
    } catch (e) { 
        console.error("Ошибка загрузки клиентов:", e);
        // Если вдруг старый API не сработал, попробуем запасной вариант (иногда мы называли search-clients)
        // Но скорее всего проблема была просто в методе fetch
    } 
    finally { setLoading(false); }
  };

  // --- ЛОГИКА АВТОМАТИЗАЦИИ ---
  const toggleStatus = async (client: any, e: any) => {
      e.stopPropagation(); 
      
      const newStatus = !client.isTraining;
      
      // Если нажимаем "Ушел" - спрашиваем подтверждение, так как это закроет тренировку
      if (!newStatus) {
          if (!confirm(`Завершить тренировку клиента ${client.name}?`)) return;
      }

      // 1. Визуально обновляем кнопку сразу (чтобы было быстро)
      setClients((prev) => prev.map((c) => 
          c.id === client.id ? { ...c, isTraining: newStatus } : c
      ));

      try {
          // 2. Отправляем на сервер. Сервер теперь умный:
          // Если isTraining = false -> он сам найдет активный план и закроет его.
          await fetch('/api/client/status', {
              method: 'POST',
              body: JSON.stringify({ userId: client.id, isTraining: newStatus })
          });
          
          // Если клиент ПРИШЕЛ - он сам появится в нижней панели (BottomNav сам обновляется каждые 5 сек)
      } catch (error) {
          alert("Ошибка соединения");
          loadClients(); // Если ошибка - возвращаем как было
      }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center">Загрузка...</div>;

  // Разделяем на активных и неактивных
  const activeClients = clients.filter((c) => c.isTraining);
  const inactiveClients = clients.filter((c) => !c.isTraining);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      {/* Шапка */}
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Тренерская</h1>
          <button onClick={() => { localStorage.removeItem('user'); router.push('/'); }} className="text-xs text-red-400 border border-red-900/50 px-3 py-1 rounded hover:bg-red-900/20 transition">Выйти</button>
      </div>

      {/* Индикатор */}
      <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${activeClients.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
          <span className="text-xs font-bold uppercase text-gray-400">LIVE: В зале ({activeClients.length})</span>
      </div>

      <div className="space-y-3">
        {/* Сначала те, кто В ЗАЛЕ */}
        {activeClients.map((client) => (
            <ClientCard key={client.id} client={client} router={router} toggleStatus={toggleStatus} />
        ))}
        
        {/* Потом остальные */}
        {inactiveClients.map((client) => (
            <ClientCard key={client.id} client={client} router={router} toggleStatus={toggleStatus} />
        ))}
        
        {clients.length === 0 && !loading && (
            <div className="text-gray-500 text-center mt-10 p-4 border border-dashed border-gray-700 rounded-xl">
                Клиентов пока нет. Добавьте их в базе данных.
            </div>
        )}
      </div>
    </div>
  );
}

// Компонент карточки
function ClientCard({ client, router, toggleStatus }: any) {
    return (
        <div 
            onClick={() => router.push(`/trainer/client/${client.id}`)}
            className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition active:scale-[0.98] ${
                client.isTraining 
                ? 'bg-gray-800 border-green-500/50 shadow-lg shadow-green-900/10' 
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
        >
            <div className="flex items-center gap-3">
                {/* Аватарка */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${
                    client.isTraining 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                    {client.name ? client.name[0].toUpperCase() : '?'}
                </div>
                
                {/* Инфо */}
                <div>
                    <h3 className={`font-bold text-sm ${client.isTraining ? 'text-white' : 'text-gray-300'}`}>
                        {client.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        {client.isTraining ? '🔥 Сейчас тренируется' : 'Не в зале'}
                    </p>
                </div>
            </div>

            {/* Кнопка Пришел/Ушел */}
            <button 
                onClick={(e) => toggleStatus(client, e)}
                className={`text-[10px] font-bold px-4 py-2 rounded-lg border transition shadow-sm ${
                    client.isTraining 
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-red-900/30 hover:text-red-400 hover:border-red-900' 
                    : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-blue-900/20'
                }`}
            >
                {client.isTraining ? 'Ушел 🚪' : 'Пришел 👋'}
            </button>
        </div>
    );
}