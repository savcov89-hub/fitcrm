'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkoutPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [programName, setProgramName] = useState('');
  const [plannedId, setPlannedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        router.push('/');
        return;
    }
    const user = JSON.parse(userStr);

    // Загружаем данные без кэша
    fetch('/api/client/program?t=' + Date.now(), {
      method: 'POST',
      body: JSON.stringify({ userId: user.id }),
      cache: 'no-store'
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.exercises) {
        setProgramName(data.name);
        setPlannedId(data.plannedId);
        
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
      }
      setLoading(false);
    });
  }, []);

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

  const finishWorkout = async () => {
    if (!confirm('Завершить тренировку?')) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

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
            userId: user.id, 
            details: logsToSend, 
            plannedId: plannedId 
        })
      });
      
      // Выключаем статус "Тренируется"
      await fetch('/api/client/status', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, isTraining: false })
      });

      alert('Отлично потренировались! 💪');
      window.location.href = '/client';
    } catch (e) { alert('Ошибка'); }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center text-xs">Загрузка...</div>;
  
  if (!programName) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="text-4xl mb-2">🤷‍♂️</div>
      <p className="text-sm text-gray-400">Нет активной программы.</p>
      <button onClick={() => router.push('/client')} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold">Назад</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 pb-32">
      
      {/* 1. ШАПКА */}
      <div className="flex justify-between items-center mb-3 sticky top-0 bg-gray-900 z-20 py-2 border-b border-gray-800">
          <div>
            <h1 className="text-base font-bold text-white leading-tight pr-2">{programName}</h1>
          </div>
          <button 
            onClick={() => router.push('/client')} 
            className="text-gray-400 hover:text-white text-xs border border-gray-700 px-2 py-1 rounded"
          >
             ✕ Выход
          </button>
      </div>

      {/* 2. СПИСОК УПРАЖНЕНИЙ */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div key={i} className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm">
            
            {/* Заголовок + План */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm text-gray-200 leading-tight w-3/4">{ex.name}</h3>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">
                    {ex.sets} x {ex.reps}
                </span>
            </div>

            {/* История (Компактный спойлер) */}
            {ex.historyList && ex.historyList.length > 0 && (
                <details className="mb-2 group">
                    <summary className="text-[10px] text-gray-500 cursor-pointer list-none flex items-center gap-1 hover:text-gray-300 w-fit">
                        <span>🕒 История</span>
                        <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-1 pl-2 border-l-2 border-gray-700 space-y-0.5">
                        {ex.historyList.slice(0, 3).map((h: any, idx: number) => (
                            <div key={idx} className="flex gap-2 text-[9px] text-gray-400">
                                <span className="w-10 opacity-50">{h.date}</span>
                                <span className="font-mono text-purple-300">{h.result}</span>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            {/* Ввод веса */}
            <div className="bg-gray-900/40 p-2 rounded-lg mb-2 flex items-center justify-between border border-gray-700/50 h-9">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Вес (кг):</label>
                <input 
                    type="number" 
                    className="bg-transparent w-16 text-right text-base font-bold text-white focus:outline-none placeholder-gray-600"
                    value={ex.workingWeight}
                    onChange={(e) => updateWeight(i, e.target.value)}
                    placeholder="0"
                />
            </div>

            {/* Сетка повторений (Компактная) */}
            <div>
                <div className="grid grid-cols-5 gap-2">
                    {ex.actualReps.map((rep: any, setIdx: number) => (
                        <div key={setIdx} className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-center text-gray-600">#{setIdx + 1}</span>
                            <input 
                                type="number" 
                                className="bg-gray-700 w-full h-8 p-0 rounded-md text-center text-sm font-bold text-white border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                value={rep}
                                onChange={(e) => updateReps(i, setIdx, e.target.value)}
                                placeholder="-"
                            />
                        </div>
                    ))}
                </div>
            </div>

          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-3 right-3 z-40">
        <button 
            onClick={finishWorkout} 
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-black/50 text-sm transition active:scale-[0.98]"
        >
            ✅ Завершить тренировку
        </button>
      </div>

    </div>
  );
}