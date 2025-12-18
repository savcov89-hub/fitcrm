'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ClientWorkoutPage() {
  const router = useRouter();
  // const params = useParams(); // Оставляем, если понадобится ID из URL
  const [exercises, setExercises] = useState<any[]>([]);
  const [programName, setProgramName] = useState('');
  const [plannedId, setPlannedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userRole, setUserRole] = useState('client');
  const [isSaving, setIsSaving] = useState(false);

  // Ссылки для доступа к актуальным данным внутри таймеров
  const exercisesRef = useRef<any[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // ГЛАВНОЕ ИСПРАВЛЕНИЕ: Флаг "Грязных данных" (несохраненных изменений)
  const isDirtyRef = useRef(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return router.push('/');
    const user = JSON.parse(userStr);
    
    setUserRole(user.role);

    // 1. Статус "В зале"
    fetch('/api/client/status', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, isTraining: true })
    });

    // 2. Первая загрузка
    loadData(user.id, false);

    // 3. Авто-обновление (Polling)
    const interval = setInterval(() => {
        loadData(user.id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Синхронизируем реф с стейтом, чтобы логика сохранения видела актуальные данные
  useEffect(() => { exercisesRef.current = exercises; }, [exercises]);

  // --- ЛОГИКА АВТОСОХРАНЕНИЯ ---
  const triggerAutoSave = (currentExercises: any[], pId: number | null) => {
      if (!pId) return;
      
      // 1. Ставим метку: "Есть несохраненные данные!"
      // Это запретит loadData перезаписывать твои цифры
      isDirtyRef.current = true;
      setIsSaving(true);
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
          const cleanExercises = currentExercises.map(ex => ({
              ...ex,
              weight: ex.workingWeight,
              reps: ex.reps, 
              actualReps: ex.actualReps 
          }));

          try {
              await fetch('/api/client/save-progress', {
                  method: 'POST',
                  body: JSON.stringify({ 
                      plannedId: pId, 
                      exercises: cleanExercises 
                  })
              });
          } catch (e) {
              console.error("Ошибка сохранения", e);
          } finally {
              // 2. Сохранение прошло — снимаем метку
              isDirtyRef.current = false; 
              setIsSaving(false);
          }
      }, 1000); // Ждем 1 секунду после ввода перед отправкой
  };

  const loadData = (userId: number, isPolling: boolean) => {
    if (!isPolling) setLoading(true);

    // ВАЖНО: Если данные "грязные" (мы печатаем), пропускаем обновление с сервера
    if (isPolling && isDirtyRef.current) {
        return;
    }

    fetch('/api/client/program?t=' + new Date().getTime(), {
      method: 'POST',
      body: JSON.stringify({ userId: userId }),
      cache: 'no-store'
    })
    .then(res => res.json())
    .then(data => {
      // Двойная проверка: если пока шел запрос, мы начали печатать — отменяем обновление
      if (isPolling && isDirtyRef.current) return;

      if (data && data.exercises) {
        setProgramName(data.name);
        setPlannedId(data.plannedId);
        
        const serverExercises = typeof data.exercises === 'string' 
            ? JSON.parse(data.exercises) 
            : data.exercises;

        const ready = serverExercises.map((ex: any) => {
          const setsCount = parseInt(ex.sets) || 1;
          // Если на сервере пусто, создаем массив пустот, иначе берем массив с сервера
          const initialReps = ex.actualReps && Array.isArray(ex.actualReps) 
              ? ex.actualReps 
              : Array(setsCount).fill(''); // Пустые строки вместо undefined

          return {
            ...ex,
            workingWeight: ex.weight || '',
            actualReps: initialReps 
          };
        });
        
        // Обновляем только если данные реально отличаются
        if (JSON.stringify(ready) !== JSON.stringify(exercisesRef.current)) {
             setExercises(ready);
        }

      } else {
          if (!isPolling) {
              setProgramName('');
              setExercises([]);
          }
      }
      if (!isPolling) setLoading(false);
    })
    .catch(() => {
        if (!isPolling) setLoading(false);
    });
  };

  const goBack = () => {
      router.push('/client');
  };

  const updateReps = (exIndex: number, setIndex: number, value: string) => {
    // Немедленно блокируем обновления с сервера
    isDirtyRef.current = true;
    
    const updated = [...exercises];
    // Копируем вглубь, чтобы React увидел изменения
    updated[exIndex] = { ...updated[exIndex], actualReps: [...updated[exIndex].actualReps] };
    updated[exIndex].actualReps[setIndex] = value;
    
    setExercises(updated);
    triggerAutoSave(updated, plannedId); 
  };

  const updateWeight = (exIndex: number, value: string) => {
    isDirtyRef.current = true;

    const updated = [...exercises];
    updated[exIndex] = { ...updated[exIndex], workingWeight: value };
    
    setExercises(updated);
    triggerAutoSave(updated, plannedId); 
  };

  const finishWorkout = async () => {
    if (!confirm('Завершить тренировку?')) return;

    // Ждем сохранения, если оно идет
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

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
      
      await fetch('/api/client/status', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, isTraining: false })
      });

      alert('Тренировка завершена! 💪');
      goBack(); 
    } catch (e) { alert('Ошибка'); }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center text-sm">Загрузка...</div>;
  
  if (!programName) return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
          <p className="mb-4 text-gray-400">Нет активной программы.</p>
          <button onClick={goBack} className="bg-blue-600 px-6 py-3 rounded-xl font-bold">
              Назад в кабинет
          </button>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 pb-32">
      <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-2">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Сейчас идет тренировка</div>
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white leading-tight pr-2">{programName}</h1>
                {isSaving && <span className="text-[10px] text-yellow-400 animate-pulse">Сохранение...</span>}
            </div>
          </div>
          <button onClick={goBack} className="text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-lg text-xs whitespace-nowrap">✕ Закрыть</button>
      </div>

      <div className="space-y-2">
        {exercises.map((ex, i) => (
          <div key={i} className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm">
            <div className="mb-2">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-200 leading-tight w-3/4">{ex.name}</h3>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">{ex.sets} x {ex.reps}</span>
                </div>
                {ex.historyList && ex.historyList.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                        {ex.historyList.slice(0, 5).map((h: any, idx: number) => (
                            <div key={idx} className="flex gap-2 text-[9px] text-gray-500">
                                <span className="w-10 opacity-50">{h.date}</span>
                                <span className="font-mono text-purple-300 font-bold">{h.result}</span>
                            </div>
                        ))}
                    </div>
                ) : (<div className="text-[9px] text-gray-600 mt-1">Нет истории</div>)}
            </div>
            
            <div className="bg-gray-900/40 p-2 rounded-lg mb-2 flex items-center justify-between border border-gray-700/50 h-9">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Вес (кг):</label>
                <input 
                    type="number" 
                    className="bg-transparent w-16 text-right text-base font-bold text-white focus:outline-none" 
                    value={ex.workingWeight} 
                    onChange={(e) => updateWeight(i, e.target.value)} 
                    placeholder="0" 
                />
            </div>
            
            <div className="grid grid-cols-5 gap-2">
                {ex.actualReps.map((rep: any, setIdx: number) => (
                    <div key={setIdx} className="flex flex-col gap-0.5">
                        <input 
                            type="number" 
                            className={`w-full h-8 p-0 rounded-md text-center text-sm font-bold border outline-none transition-colors ${
                                rep ? 'bg-green-900/30 border-green-500/50 text-white' : 'bg-gray-700 border-gray-600 text-gray-400'
                            }`}
                            value={rep} 
                            onChange={(e) => updateReps(i, setIdx, e.target.value)} 
                            placeholder="-" 
                        />
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-3 right-3 z-40">
        <button onClick={finishWorkout} className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-[0.98]">✅ Завершить тренировку</button>
      </div>
    </div>
  );
}