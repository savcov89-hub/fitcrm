'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TrainerWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [exercises, setExercises] = useState<any[]>([]);
  const [clientName, setClientName] = useState('Клиент');
  const [loading, setLoading] = useState(true);
  const [plannedId, setPlannedId] = useState<number | null>(null); // Храним ID плана, чтобы завершить его
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    loadData();
  }, []);

  // --- АВТОСОХРАНЕНИЕ ---
  useEffect(() => {
    if (loading || exercises.length === 0) return;
    if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
    }

    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
        saveToCloud();
    }, 1500);

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [exercises]);

  const saveToCloud = async () => {
    const logsToSend = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        actualSets: ex.actualReps.map((r: any) => ({
            weight: ex.workingWeight, 
            reps: r
        }))
    }));

    try {
        const res = await fetch('/api/client/log', {
            method: 'POST',
            body: JSON.stringify({ userId: clientId, details: logsToSend })
        });
        if (res.ok) {
            setSaveStatus('saved');
        } else {
            setSaveStatus('error');
        }
    } catch (e) {
        setSaveStatus('error');
    }
  };

  // --- ЗАГРУЗКА ДАННЫХ (ИСПРАВЛЕННАЯ СИНХРОНИЗАЦИЯ) ---
  const loadData = async () => {
    // 1. Имя клиента
    const clientsRes = await fetch('/api/trainer/clients', { cache: 'no-store' });
    const clientsData = await clientsRes.json();
    const currentClient = clientsData.find((c: any) => c.id == clientId);
    if (currentClient) setClientName(currentClient.name);

    // 2. ВСЕГДА БЕРЕМ АКТУАЛЬНЫЙ ПЛАН (из очереди)
    // (Игнорируем старую историю "за сегодня", чтобы не было путаницы)
    const res = await fetch('/api/client/program', {
      method: 'POST',
      body: JSON.stringify({ userId: clientId })
    });
    const data = await res.json();

    if (data && data.exercises) {
      setPlannedId(data.plannedId); // Запоминаем ID плана
      
      const parsed = JSON.parse(data.exercises);
      const ready = parsed.map((ex: any) => {
          const setsCount = parseInt(ex.sets) || 1;
          const initialReps = Array(setsCount).fill(ex.reps);
          return {
            ...ex,
            workingWeight: ex.weight || '',
            actualReps: initialReps 
          };
      });
      setExercises(ready);
    } else {
        setExercises([]); // Нет плана
    }
    
    setLoading(false);
    // Даем небольшую задержку перед включением автосейва, чтобы не сохранить данные сразу при загрузке
    setTimeout(() => isFirstLoad.current = false, 500);
  };

  const updateReps = (exIndex: number, setIndex: number, value: string) => {
    const updated = [...exercises];
    updated[exIndex].actualReps[setIndex] = value;
    setExercises(updated);
  };

  const updateWeight = (exIndex: number, value: string) => {
    const updated = [...exercises];
    updated[exIndex].workingWeight = value;
    setExercises(updated);
  };

  // --- ЗАВЕРШЕНИЕ ТРЕНИРОВКИ ---
  const finishWorkout = async () => {
    if (!confirm(`Завершить тренировку для ${clientName}? Она исчезнет из плана.`)) return;

    const logsToSend = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        actualSets: ex.actualReps.map((r: any) => ({
            weight: ex.workingWeight, 
            reps: r
        }))
    }));

    try {
      await fetch('/api/client/log', {
        method: 'POST',
        body: JSON.stringify({ 
            userId: clientId, 
            details: logsToSend,
            plannedId: plannedId // Отправляем ID, чтобы сервер вычеркнул тренировку
        })
      });
      alert('Тренировка сохранена и закрыта!');
      router.push(`/trainer/client/${clientId}`); // Возвращаемся в карточку
    } catch (e) { alert('Ошибка'); }
  };

  if (loading) return <div className="p-10 text-white text-center text-sm">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 pb-32">
      
      {/* Шапка */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 z-20 py-2 border-b border-gray-800">
          <button 
            onClick={() => router.push(`/trainer/client/${clientId}`)} // Возврат в карточку
            className="text-gray-400 text-sm flex items-center hover:text-white transition"
          >
             ← Назад к клиенту
          </button>
          
          <div className="text-xs font-bold flex items-center gap-2">
            {saveStatus === 'saved' && <span className="text-green-500 flex items-center gap-1">☁️ Сохранено</span>}
            {saveStatus === 'saving' && <span className="text-yellow-500 flex items-center gap-1">⏳ Сохраняю...</span>}
            {saveStatus === 'error' && <span className="text-red-500">⚠️ Ошибка</span>}
          </div>
      </div>

      <h1 className="text-lg font-bold text-orange-500 leading-none mb-4">{clientName}</h1>

      {exercises.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
              Нет активной тренировки в плане.
              <br/>
              Назначьте программу в карточке клиента.
          </div>
      ) : (
          <div className="space-y-3">
            {exercises.map((ex, i) => (
              <div key={i} className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm">
                
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-gray-200 leading-tight w-3/4">{ex.name}</h3>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded">
                        {ex.sets} x {ex.reps}
                    </span>
                </div>

                <div className="bg-gray-900/40 p-2 rounded-lg mb-2 flex items-center justify-between border border-gray-700/50 h-10">
                    <label className="text-xs text-gray-400">Вес (кг):</label>
                    <input 
                        type="number" 
                        className="bg-transparent w-20 text-right text-lg font-bold text-white focus:outline-none placeholder-gray-600"
                        value={ex.workingWeight}
                        onChange={(e) => updateWeight(i, e.target.value)}
                        placeholder="0"
                    />
                </div>

                <div className="grid grid-cols-5 gap-2"> 
                    {ex.actualReps.map((rep: any, setIdx: number) => (
                        <div key={setIdx} className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-center text-gray-600">#{setIdx + 1}</span>
                            <input 
                                type="number" 
                                className="bg-gray-700 w-full h-8 p-0 rounded-md text-center text-sm font-bold text-white focus:ring-1 focus:ring-green-500 outline-none"
                                value={rep}
                                onChange={(e) => updateReps(i, setIdx, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

              </div>
            ))}
          </div>
      )}

      {exercises.length > 0 && (
          <div className="fixed bottom-20 left-3 right-3 z-40">
            <button 
                onClick={finishWorkout} 
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-black/50 text-sm transition active:scale-[0.98]"
            >
                ✅ Завершить и закрыть
            </button>
          </div>
      )}
      
    </div>
  );
}