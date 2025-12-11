'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EXERCISE_DB } from '../../data/exercises';
// Импортируем библиотеку, чтобы взять оттуда названия сплитов
import { WORKOUT_LIBRARY } from '../../data/workout-templates';

export default function CreateProgram() {
  const router = useRouter();
  
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientHistory, setClientHistory] = useState<any[]>([]); 
  
  const [programName, setProgramName] = useState('');
  // По умолчанию выбираем первый шаблон из библиотеки
  const [selectedTemplateId, setSelectedTemplateId] = useState(WORKOUT_LIBRARY[0]?.id || '');
  const [exerciseCount, setExerciseCount] = useState(5); 

  const [exercises, setExercises] = useState([
    { name: '', sets: '', reps: '', weight: '' }
  ]);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- 1. ЗАГРУЗКА ---
  useEffect(() => {
    fetch('/api/trainer/clients').then(res => res.json()).then(setClients);
  }, []);

  useEffect(() => {
    if (!selectedClient) {
        setClientHistory([]);
        return;
    }
    fetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({ clientId: selectedClient })
    })
    .then(res => res.json())
    .then(data => setClientHistory(data));
  }, [selectedClient]);

  // --- 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
  const getExerciseHistory = (exName: string) => {
    if (!exName || clientHistory.length === 0) return [];
    const relevant = clientHistory.filter(log => {
        try {
            const details = JSON.parse(log.details);
            return Array.isArray(details) && details.some((d: any) => d.name === exName);
        } catch (e) { return false; }
    });
    return relevant.slice(0, 5).map(log => {
        const details = JSON.parse(log.details);
        const item = details.find((d: any) => d.name === exName);
        let resStr = '';
        if (item.actualSets && item.actualSets.length > 0) {
             const w = item.actualSets[0].weight || item.workingWeight || 0;
             const r = item.actualSets.map((s:any) => s.reps).join(', ');
             resStr = `${w}кг x ${r}`;
        } else {
             resStr = `${item.doneWeight}кг x ${item.doneReps}`;
        }
        const date = new Date(log.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        return { date, result: resStr };
    });
  };

  // --- 3. ЛОГИКА ИИ (С УЧЕТОМ ШАБЛОНА) ---
  const handleAiGenerate = async () => {
    if (!selectedClient) return alert('Выберите клиента!');
    
    setIsAiLoading(true);

    let historySummary = "Клиент новичок.";
    try {
        if (clientHistory && clientHistory.length > 0) {
            const lastLog = clientHistory[0];
            if (lastLog && lastLog.details) {
                const lastWorkout = JSON.parse(lastLog.details);
                historySummary = `Последняя трен: \n`;
                if (Array.isArray(lastWorkout)) {
                    lastWorkout.forEach((ex: any) => {
                        let w = "0";
                        if (ex.actualSets && ex.actualSets[0]?.weight) w = ex.actualSets[0].weight;
                        else if (ex.workingWeight) w = ex.workingWeight;
                        historySummary += `- ${ex.name}: ${w}кг\n`;
                    });
                }
            }
        }

        // Находим выбранный шаблон
        const template = WORKOUT_LIBRARY.find(t => t.id === selectedTemplateId);
        const templateDesc = template ? `${template.title} (${template.description})` : "Свободная тренировка";

        const promptGoal = aiGoal ? aiGoal : `Следуй шаблону: ${templateDesc}. Подбери упражнения.`;

        const res = await fetch('/api/ai/generate', {
            method: 'POST',
            body: JSON.stringify({
              goal: `${promptGoal}. Кол-во упражнений: ${exerciseCount}`,
              split: template?.category || "Full Body",
              level: 'Средний',
              historyContext: historySummary
            })
        });
        
        const data = await res.json();
        
        if (data.exercises && Array.isArray(data.exercises)) {
            const formatted = data.exercises.map((e: any) => ({
                ...e, 
                weight: e.weight ? e.weight.toString() : "",
                sets: e.sets ? e.sets.toString() : "3",
                reps: e.reps ? e.reps.toString() : "10"
            }));
            setExercises(formatted);
            setShowAiModal(false);
        } else {
            alert('ИИ вернул пустой ответ.');
        }

    } catch (e: any) {
        alert('Ошибка: ' + e.message);
    } finally {
        setIsAiLoading(false);
    }
  };

  // --- ОСТАЛЬНОЕ ---
  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '3', reps: '', weight: '' }]);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const newExercises: any = [...exercises];
    newExercises[index][field] = value;
    if (field === 'name') {
        const found = EXERCISE_DB.find(e => e.name === value);
        if (found) {
            newExercises[index].sets = '3';
        }
    }
    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!selectedClient) return alert('Выберите клиента!');
    await fetch('/api/programs/assign', {
      method: 'POST',
      body: JSON.stringify({
        clientId: selectedClient,
        name: programName || 'Новая тренировка',
        split: 'AI Generated',
        exercises 
      })
    });
    alert('Программа назначена!');
    router.push('/trainer');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20 relative">
      <h1 className="text-xl font-bold mb-4 text-blue-500">Конструктор (Smart V3) 🧠</h1>
      
      <datalist id="exercise-list">
        {EXERCISE_DB.map((ex, i) => <option key={i} value={ex.name} />)}
      </datalist>

      {/* КНОПКА ГЕНЕРАЦИИ */}
      <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setShowAiModal(true)} 
            className="flex items-center gap-2 w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-400 px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition active:scale-95"
          >
             🤖 Сгенерировать (AI)
          </button>
      </div>

      <div className="space-y-4">
        {/* КЛИЕНТ */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Клиент</label>
          <select 
            className="w-full bg-gray-800 p-3 rounded-xl border border-gray-700 outline-none"
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">-- Выберите --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* НАЗВАНИЕ */}
        <div>
            <label className="text-sm text-gray-400 block mb-1">Название</label>
            <input 
                placeholder="Напр. День ног" 
                className="w-full bg-gray-800 p-3 rounded-xl border border-gray-700 outline-none"
                onChange={e => setProgramName(e.target.value)} 
            />
        </div>
        
        {/* ВЫБОР ШАБЛОНА (ВСЕ СПЛИТЫ) - ИСПРАВЛЕННЫЙ ФОРМАТ */}
        <div>
            <label className="text-sm text-gray-400 block mb-1">Шаблон / Сплит</label>
            <select 
                className="w-full bg-gray-800 p-3 rounded-xl border border-gray-700 outline-none text-sm" 
                value={selectedTemplateId} 
                onChange={e => setSelectedTemplateId(e.target.value)}
            >
                {WORKOUT_LIBRARY.map(t => (
                    <option key={t.id} value={t.id}>
                        {/* ФОРМАТ: КАТЕГОРИЯ: НАЗВАНИЕ */}
                        {t.category}: {t.title.replace(/Вариант \d: /, '')}
                    </option>
                ))}
            </select>
        </div>

        {/* УПРАЖНЕНИЯ */}
        <div className="space-y-3 mt-6">
          {exercises.map((ex, i) => {
            const historyList = getExerciseHistory(ex.name);
            return (
                <div key={i} className="bg-gray-800 p-3 rounded-xl border border-gray-700 relative">
                
                <div className="flex justify-between mb-2">
                    <input 
                        list="exercise-list"
                        placeholder="Упражнение..." 
                        className="w-full bg-transparent border-b border-gray-600 p-1 font-bold text-blue-200 focus:outline-none"
                        value={ex.name}
                        onChange={e => updateExercise(i, 'name', e.target.value)}
                    />
                    <button onClick={() => {
                        const newEx = [...exercises];
                        newEx.splice(i, 1);
                        setExercises(newEx);
                    }} className="text-red-500 ml-2 font-bold px-2">✕</button>
                </div>
                
                {historyList.length > 0 && (
                    <details className="mb-3 group">
                        <summary className="text-xs text-purple-400 cursor-pointer list-none flex items-center gap-1 hover:text-purple-300 transition select-none">
                            <span>📜 История ({historyList.length})</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-1 bg-black/30 rounded p-2 text-xs space-y-1 border border-purple-500/20">
                            {historyList.map((h, idx) => (
                                <div key={idx} className="flex justify-between text-gray-300">
                                    <span>{h.date}</span>
                                    <span className="font-bold text-white">{h.result}</span>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
                
                <div className="flex gap-2 text-sm">
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-500 uppercase">Вес</span>
                        <input type="number" className="w-full bg-gray-700 rounded p-2 text-center font-bold text-white" value={ex.weight} placeholder="Auto" onChange={e => updateExercise(i, 'weight', e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-500 uppercase">Подходы</span>
                        <input type="number" className="w-full bg-gray-700 rounded p-2 text-center text-white" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-500 uppercase">Повторы</span>
                        <input type="number" className="w-full bg-gray-700 rounded p-2 text-center text-white" value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} />
                    </div>
                </div>
                </div>
            );
          })}
          
          <button onClick={addExercise} className="w-full py-3 border border-dashed border-gray-500 rounded-xl text-gray-400 hover:bg-gray-800 transition">
            + Добавить упражнение
          </button>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 py-4 rounded-xl font-bold text-lg fixed bottom-24 left-4 right-4 mx-0 shadow-lg z-10"
          style={{ width: 'calc(100% - 2rem)' }}
        >
          Сохранить программу
        </button>
      </div>

      {/* MODAL AI */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Тренер</h3>
                
                {/* ВЫБОР КОЛИЧЕСТВА */}
                <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-1">Кол-во упражнений</label>
                    <div className="flex gap-2">
                        {[4, 5, 6, 7, 8].map(num => (
                            <button 
                                key={num}
                                onClick={() => setExerciseCount(num)}
                                className={`flex-1 py-2 rounded-lg font-bold border ${exerciseCount === num ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-gray-300 text-sm mb-2 font-medium">Пожелания (необязательно):</p>
                <textarea 
                    className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 h-20 mb-4 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-600"
                    placeholder="Например: Убрать нагрузку с поясницы."
                    value={aiGoal}
                    onChange={e => setAiGoal(e.target.value)}
                />
                
                <div className="flex gap-2">
                    <button onClick={() => setShowAiModal(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-gray-300">Отмена</button>
                    <button 
                        onClick={handleAiGenerate}
                        disabled={isAiLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white disabled:opacity-50"
                    >
                        {isAiLoading ? 'Думаю...' : 'Создать'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}