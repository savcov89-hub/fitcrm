'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Функция загрузки данных (вынесли отдельно)
  const fetchProgram = async (userId: number) => {
      try {
          const res = await fetch('/api/client/program', {
              method: 'POST',
              body: JSON.stringify({ userId }),
              cache: 'no-store' // Важно: не кэшировать, брать свежее
          });
          const data = await res.json();
          // Сравниваем: если данные изменились — обновляем
          // (React сам оптимизирует и не будет перерисовывать, если объект тот же)
          setProgram(data);
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
    // 1. Проверяем авторизацию
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        router.push('/');
        return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    // 2. Первая загрузка сразу
    fetchProgram(userData.id).then(() => setLoading(false));

    // 3. АВТО-ОБНОВЛЕНИЕ КАЖДЫЕ 5 СЕКУНД (Polling)
    const interval = setInterval(() => {
        fetchProgram(userData.id);
    }, 5000);

    // Очистка таймера при уходе со страницы
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const startWorkout = () => {
      router.push('/trainer/active'); 
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      {/* Шапка */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Кабинет клиента</p>
        </div>
        <button onClick={handleLogout} className="text-xs text-red-400 border border-red-900/50 px-3 py-1 rounded-lg bg-red-900/10">Выйти</button>
      </div>

      {/* Основной блок */}
      <div className="flex flex-col gap-4">
        
        {/* КАРТОЧКА АКТИВНОЙ ТРЕНИРОВКИ */}
        {program ? (
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl border border-blue-500/30 relative overflow-hidden animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💪</div>
                <h2 className="text-white text-lg font-bold mb-1">{program.name}</h2>
                <div className="text-blue-200 text-xs mb-6">Ваша следующая тренировка</div>
                
                <button 
                    onClick={startWorkout}
                    className="w-full bg-white text-blue-900 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-100 transition active:scale-95 flex items-center justify-center gap-2"
                >
                    <span>▶</span> Начать тренировку
                </button>
            </div>
        ) : (
            <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 border-dashed animate-in fade-in duration-500">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-gray-300">План выполнен!</h3>
                <p className="text-sm text-gray-500 mt-2">На сегодня тренировок нет. Отдыхайте.</p>
            </div>
        )}

      </div>
    </div>
  );
}