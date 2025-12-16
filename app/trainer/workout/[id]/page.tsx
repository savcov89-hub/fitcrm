'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TrainerWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  
  const targetUserId = params?.id ? parseInt(params.id as string) : null;

  const [exercises, setExercises] = useState<any[]>([]);
  const [programName, setProgramName] = useState('');
  const [clientName, setClientName] = useState('');
  const [plannedId, setPlannedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'typing'>('saved');

  const exercisesRef = useRef<any[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEditTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!targetUserId) return;

    fetch('/api/client/status', {
        method: 'POST',
        body: JSON.stringify({ userId: targetUserId, isTraining: true })
    });

    loadData(targetUserId, false);

    const interval = setInterval(() => {
        loadData(targetUserId, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [targetUserId]);

  useEffect(() => { exercisesRef.current = exercises; }, [exercises]);

  const triggerAutoSave = (currentExercises: any[], pId: number | null) => {
      if (!pId) return;
      setSaveStatus('typing');
      lastEditTimeRef.current = Date.now();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
          setSaveStatus('saving');
          const cleanExercises = currentExercises.map(ex => ({
              ...ex,
              weight: ex.workingWeight,
              reps: ex.reps,
              actualReps: ex.actualReps 
          }));
          try {
              await fetch('/api/client/save-progress', {
                  method: 'POST',
                  body: JSON.stringify({ plannedId: pId, exercises: cleanExercises })
              });
              setSaveStatus('saved');
          } catch (e) { console.error(e); }
      }, 1000); 
  };

  const loadData = (uid: number, isPolling: boolean) => {
    if (!isPolling) setLoading(true);

    fetch('/api/client/program?t=' + new Date().getTime(), {
      method: 'POST',
      body: JSON.stringify({ userId: uid }),
      cache: 'no-store'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        if (data.clientName) setClientName(data.clientName);

        if (data.exercises) {
            if (isPolling && (Date.now() - lastEditTimeRef.current < 4000)) return; 

            setProgramName(data.name);
            setPlannedId(data.plannedId);
            
            const serverExercises = typeof data.exercises === 'string' ? JSON.parse(data.exercises) : data.exercises;
            
            const ready = serverExercises.map((ex: any) => {
              const setsCount = parseInt(ex.sets) || 1;
              const initialReps = ex.actualReps && Array.isArray(ex.actualReps) ? ex.actualReps : Array(setsCount).fill(ex.reps);
              return { ...ex, workingWeight: ex.weight || '', actualReps: initialReps };
            });
            
            if (JSON.stringify(ready) !== JSON.stringify(exercisesRef.current)) setExercises(ready);
        }
      }
      if (!isPolling) setLoading(false);
    });
  };

  const updateReps = (exIndex: number, setIndex: number, value: string) => {
    lastEditTimeRef.current = Date.now();
    const updated = [...exercises];
    updated[exIndex].actualReps[setIndex] = value;
    setExercises(updated);
    triggerAutoSave(updated, plannedId);
  };

  const updateWeight = (exIndex: number, value: string) => {
    lastEditTimeRef.current = Date.now();
    const updated = [...exercises];
    updated[exIndex].workingWeight = value;
    updated[exIndex].weight = value; 
    setExercises(updated);
    triggerAutoSave(updated, plannedId);
  };

  const finishAndClose = async () => {
      if (!confirm('Завершить тренировку за клиента?')) return;
      const logsToSend = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        actualSets: ex.actualReps.map((r: any) => ({ weight: ex.workingWeight, reps: r }))
      }));

      await fetch('/api/client/log', {
        method: 'POST',
        body: JSON.stringify({ userId: targetUserId, details: logsToSend, plannedId: plannedId })
      });
      
      await fetch('/api/client/status', {
          method: 'POST',
          body: JSON.stringify({ userId: targetUserId, isTraining: false })
      });
      router.push('/trainer');
  };

  const getStatusIndicator = () => {
      if (saveStatus === 'typing') return <span className="text-[10px] text-blue-400 font-mono">✎...</span>;
      if (saveStatus === 'saving') return <span className="text-[10px] text-yellow-400 font-mono animate-pulse">● Сохр...</span>;
      return <span className="text-[10px] text-green-500 font-mono">● OK</span>;
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 pb-40 relative">
      
      {/* --- СТИКИ ШАПКА --- */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 -mx-3 px-3 py-2 mb-4 shadow-xl">
         <div className="flex items-center justify-between gap-3">
             <div className="flex items-center gap-3 overflow-hidden">
                <button 
                    onClick={() => router.back()} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white border border-gray-700 active:scale-95 transition shrink-0"
                >
                    ←
                </button>
                
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shrink-0 border border-white/10">
                        <span className="font-bold text-xs text-white">
                            {clientName ? clientName[0].toUpperCase() : '?'}
                        </span>
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider leading-none mb-0.5 truncate">
                            {clientName || 'Клиент'}
                        </span>
                        <span className="text-xs font-bold text-white leading-none truncate">
                            {programName}
                        </span>
                    </div>
                </div>
             </div>

             <div className="bg-gray-800 px-2 py-1 rounded border border-gray-700 shrink-0">
                {getStatusIndicator()}
             </div>
         </div>
      </div>

      <div className="space-y-2">
        {exercises.map((ex, i) => (
          <div key={i} className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm">
            <div className="mb-2">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-200 leading-tight w-3/4">{ex.name}</h3>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">{ex.sets} x {ex.reps}</span>
                </div>
            </div>

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

            <div className="grid grid-cols-5 gap-2">
                {ex.actualReps.map((rep: any, setIdx: number) => (
                    <div key={setIdx} className="flex flex-col gap-0.5">
                        <input 
                            type="number" 
                            className="bg-gray-700 w-full h-8 p-0 rounded-md text-center text-sm font-bold text-white border border-gray-600 focus:border-green-500 outline-none transition-colors" 
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

      {/* ИСПРАВЛЕНИЕ: КНОПКА ПОДНЯТА ВЫШЕ (bottom-40) */}
      <div className="fixed bottom-40 left-4 right-4 z-30">
        <button onClick={finishAndClose} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-900/20 active:scale-[0.98] transition border-t border-white/10">
            ✅ Завершить за клиента
        </button>
      </div>
    </div>
  );
}