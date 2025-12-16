'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WORKOUT_LIBRARY } from '../../../data/workout-templates';
import { EXERCISE_DB } from '../../../data/exercises';

export default function ClientCRMPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id ? (params.id as string) : null;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'plan' | 'history' | 'measurements'>('plan');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [showGenerator, setShowGenerator] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editExercises, setEditExercises] = useState<any[]>([]); 
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  
  const [historyOpenIndex, setHistoryOpenIndex] = useState<number | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [genWeeks, setGenWeeks] = useState('4');
  const [genSplit, setGenSplit] = useState('2day');
  const [libraryWeeks, setLibraryWeeks] = useState('4');

  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [exerciseList, setExerciseList] = useState<any[]>([]);

  // АВТО-ОБНОВЛЕНИЕ (как мы делали раньше)
  useEffect(() => {
    if (clientId) {
        loadData(false); 
        const interval = setInterval(() => { loadData(true); }, 5000);
        return () => clearInterval(interval);
    } else { setError('Неверная ссылка'); }
  }, [clientId]);

  useEffect(() => { if (showLibrary) loadTemplates(); }, [showLibrary]);
  useEffect(() => { fetch('/api/trainer/exercises').then(res => res.json()).then(d => { if(Array.isArray(d)) setExerciseList(d); }); }, []);

  const loadTemplates = () => { fetch('/api/trainer/get-templates').then(res => res.json()).then(d => { if (Array.isArray(d)) setCustomTemplates(d); }); };

  const loadData = async (isSilent = false) => {
    try {
        if (!isSilent) setLoading(true);
        const res = await fetch('/api/trainer/client-details', {
            method: 'POST',
            body: JSON.stringify({ clientId }),
            cache: 'no-store'
        });
        const json = await res.json();
        if (json.error && !isSilent) setError(json.error);
        else setData(json);
    } catch (e: any) { if (!isSilent) setError(e.message); } 
    finally { if (!isSilent) setLoading(false); }
  };

  // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ (БОЛЬШЕ НЕ СОЗДАЕТ ДУБЛЕЙ) ---
  const startPlannedWorkout = (workout: any) => {
    // Мы просто переходим на страницу выполнения.
    // Активная страница сама подхватит ближайшую невыполненную тренировку.
    router.push(`/trainer/workout/${clientId}`);
  };
  // -------------------------------------------------------

  const handleCloneFromHistory = async (log: any) => {
      if (!confirm('Скопировать эту тренировку в текущий План?')) return;
      setIsProcessing(true);
      try {
          const oldExercises = JSON.parse(log.details);
          const newExercises = oldExercises.map((ex: any) => {
              let planWeight = ex.weight || '';
              if (ex.actualSets && ex.actualSets.length > 0 && ex.actualSets[0].weight) planWeight = ex.actualSets[0].weight;
              else if (ex.doneWeight) planWeight = ex.doneWeight;
              return { name: ex.name, sets: ex.sets || '3', reps: ex.reps || '10', weight: planWeight };
          });
          const dateStr = new Date(log.date).toLocaleDateString('ru-RU');
          await fetch('/api/programs/assign', { method: 'POST', body: JSON.stringify({ clientId, name: `Повтор (${dateStr})`, exercises: newExercises }) });
          alert('Добавлено в План!');
          loadData();
          setActiveTab('plan');
      } catch (e) { alert('Ошибка'); } finally { setIsProcessing(false); }
  };

  // Остальные функции (сокращены для экономии места, они рабочие)
  const handleCreateExercise = async (name: string) => { if (!name) return; setExerciseList(prev => [...prev, { name }].sort((a,b) => a.name.localeCompare(b.name))); try { await fetch('/api/trainer/exercises', { method: 'POST', body: JSON.stringify({ name }) }); } catch (e) { console.error(e); } };
  const handleClearPlan = async () => { if (!confirm('Удалить ВЕСЬ план?')) return; setIsProcessing(true); try { await fetch('/api/trainer/clear-plan', { method: 'POST', body: JSON.stringify({ clientId }) }); loadData(); } catch (e) { alert('Ошибка'); } finally { setIsProcessing(false); } };
  const handleDeleteTemplate = async (templateId: number, e: any) => { e.stopPropagation(); if (!confirm('Удалить шаблон?')) return; try { await fetch('/api/trainer/delete-template', { method: 'POST', body: JSON.stringify({ id: templateId }) }); loadTemplates(); } catch (e) { alert('Ошибка'); } };
  const handleCloneWorkout = async (id: number, e: any) => { e.stopPropagation(); if(!confirm('Создать копию?')) return; setIsProcessing(true); try { await fetch('/api/trainer/clone-workout', { method: 'POST', body: JSON.stringify({ id }) }); loadData(); } catch (e) { alert('Ошибка'); } finally { setIsProcessing(false); } };
  const handleSaveAsTemplate = async () => { const name = prompt('Название шаблона:'); if (!name) return; setIsProcessing(true); try { const res = await fetch('/api/trainer/save-template', { method: 'POST', body: JSON.stringify({ clientId, name }) }); if (res.ok) alert('Сохранено!'); } catch (e) { alert('Ошибка'); } finally { setIsProcessing(false); } };
  const handleAddWorkout = async () => { setIsProcessing(true); try { await fetch('/api/trainer/add-workout', { method: 'POST', body: JSON.stringify({ clientId }) }); loadData(); } catch (e) { alert('Ошибка'); } finally { setIsProcessing(false); } };
  const handleReorder = async (id: number, direction: 'up' | 'down', e: any) => { e.stopPropagation(); try { await fetch('/api/trainer/reorder-workout', { method: 'POST', body: JSON.stringify({ id, direction }) }); loadData(); } catch (e) { alert('Ошибка'); } };
  
  const loadExerciseHistory = (exName: string, idx: number) => { if (historyOpenIndex === idx) { setHistoryOpenIndex(null); return; } if (!data || !data.history) return; const historyItems: any[] = []; data.history.forEach((log: any) => { try { const details = JSON.parse(log.details); const found = details.find((d: any) => d.name.toLowerCase().includes(exName.toLowerCase()) || exName.toLowerCase().includes(d.name.toLowerCase())); if (found) { let resStr = ''; if (found.actualSets && found.actualSets.length > 0) { const w = found.actualSets[0].weight || found.workingWeight || 0; const r = found.actualSets.map((s:any) => s.reps).join(', '); resStr = `${w}кг x [${r}]`; } else { resStr = `${found.doneWeight}кг x ${found.doneReps}`; } historyItems.push({ date: new Date(log.date).toLocaleDateString('ru-RU', {day:'numeric', month:'short'}), result: resStr }); } } catch (e) {} }); setExerciseHistory(historyItems.slice(0, 5)); setHistoryOpenIndex(idx); };
  const handleApplyTemplate = async (templateId: string | number) => { if (!confirm('Применить шаблон?')) return; setIsProcessing(true); try { await fetch('/api/trainer/apply-template', { method: 'POST', body: JSON.stringify({ clientId, templateId, weeks: libraryWeeks }) }); setShowLibrary(false); loadData(); } catch (e) { alert('Ошибка'); } finally { setIsProcessing(false); } };
  const handleGenerate = async () => { if (!confirm('Сгенерировать?')) return; setIsProcessing(true); await fetch('/api/trainer/generate-cycle', { method: 'POST', body: JSON.stringify({ clientId, weeks: genWeeks, splitType: genSplit }) }); setIsProcessing(false); setShowGenerator(false); loadData(); };
  
  const openEditModal = (workout: any, e: any) => { e.stopPropagation(); setEditingWorkout(workout); setEditName(workout.name); setHistoryOpenIndex(null); try { const exs = JSON.parse(workout.exercises); setEditExercises(exs.map((ex:any) => ({...ex, weight: ex.weight||''}))); } catch(e){ setEditExercises([]); } };
  const updateEditExercise = (idx: number, field: string, val: string) => { const updated = [...editExercises]; updated[idx][field] = val; setEditExercises(updated); };
  const selectSuggestion = (idx: number, suggestion: any) => { const updated = [...editExercises]; updated[idx].name = suggestion.name; updated[idx].sets = '3'; updated[idx].reps = ''; updated[idx].weight = ''; setEditExercises(updated); setActiveSearchIndex(null); };
  const removeEditExercise = (idx: number) => { const updated = [...editExercises]; updated.splice(idx, 1); setEditExercises(updated); };
  const addEditExercise = () => { setEditExercises([...editExercises, { name: '', sets: '3', reps: '', weight: '' }]); };
  const saveEdit = async () => { if (!editingWorkout) return; setIsProcessing(true); try { await fetch('/api/trainer/update-plan', { method: 'POST', body: JSON.stringify({ id: editingWorkout.id, name: editName, exercises: JSON.stringify(editExercises) }) }); setEditingWorkout(null); loadData(); } catch(e){ alert('Ошибка'); } finally { setIsProcessing(false); } };
  const deleteWorkout = async () => { if (!confirm('Удалить?')) return; setIsProcessing(true); try { await fetch('/api/trainer/delete-plan', { method: 'POST', body: JSON.stringify({ id: editingWorkout.id }) }); setEditingWorkout(null); loadData(); } catch(e){ alert('Ошибка'); } finally { setIsProcessing(false); } };
  const toggleFolder = (id: number) => { if (expandedId === id) setExpandedId(null); else setExpandedId(id); };
  const getSuggestions = (query: string) => { if (!query || query.length < 2) return []; return exerciseList.filter(ex => ex.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5); };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center">Загрузка...</div>;
  if (!data || !data.client) return <div className="p-10 text-white text-center">Нет данных</div>;

  const { client, playlist, history, measurements } = data;
  const futureWorkouts = playlist.filter((w: any) => !w.isDone);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-32 relative" onClick={() => setActiveSearchIndex(null)}>
      <div className="flex items-center gap-4 mb-4"><button onClick={() => router.push('/trainer')} className="text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-lg text-sm transition">← Список</button><div className="flex-1 text-right"><h1 className="text-xl font-bold">{client.name}</h1></div><div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">{client.name ? client.name[0] : '?'}</div></div>
      <div className="flex bg-gray-800 p-1 rounded-xl mb-6"><button onClick={() => setActiveTab('plan')} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${activeTab === 'plan' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>📅 План</button><button onClick={() => setActiveTab('measurements')} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${activeTab === 'measurements' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>⚖️ Замеры</button><button onClick={() => setActiveTab('history')} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${activeTab === 'history' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>📜 Архив</button></div>

      {activeTab === 'plan' && (
        <div className="mb-8">
            <div className="flex justify-end gap-2 mb-3">
                {futureWorkouts.length > 0 && (<button onClick={handleClearPlan} className="text-[10px] bg-red-900/40 border border-red-500 text-red-300 px-3 py-1.5 rounded-lg transition font-bold">🗑️ Очистить</button>)}
                <button onClick={handleSaveAsTemplate} className="text-[10px] bg-green-900/40 border border-green-500 text-green-300 px-3 py-1.5 rounded-lg transition font-bold">💾 Сохранить</button>
                <button onClick={() => setShowLibrary(true)} className="text-[10px] bg-purple-900/40 border border-purple-500 text-purple-300 px-3 py-1.5 rounded-lg transition font-bold">📚 Библиотека</button>
                <button onClick={() => setShowGenerator(true)} className="text-[10px] bg-gray-800 border border-gray-600 px-3 py-1.5 rounded-lg transition">⚡ Авто</button>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden min-h-[100px]">
                {futureWorkouts.length === 0 ? (<div className="p-8 text-center text-gray-500 text-sm">📭 План пуст.</div>) : (
                    <div className="divide-y divide-gray-700">
                        {futureWorkouts.map((workout: any, i: number) => {
                            const isExpanded = expandedId === workout.id;
                            let exercises = []; try { exercises = JSON.parse(workout.exercises); } catch (e) {}
                            return (
                                <div key={workout.id} className="hover:bg-gray-700/50">
                                    <div onClick={() => toggleFolder(workout.id)} className="p-4 flex justify-between items-center cursor-pointer transition">
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            <div className="flex flex-col gap-1 mr-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={(e) => handleReorder(workout.id, 'up', e)} className="text-gray-600 hover:text-white text-[10px] leading-none px-1 py-0.5 hover:bg-gray-600 rounded">▲</button>
                                                <button onClick={(e) => handleReorder(workout.id, 'down', e)} className="text-gray-600 hover:text-white text-[10px] leading-none px-1 py-0.5 hover:bg-gray-600 rounded">▼</button>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 shrink-0"><span className="text-gray-400 text-xs font-mono">{i + 1}</span></div>
                                            <div className="truncate flex-1 pr-2"><div className="font-bold text-sm text-white truncate">{workout.name}</div>{!isExpanded && <div className="text-xs mt-0.5"><span className="text-gray-500">{exercises.length} упражнений</span></div>}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={(e) => handleCloneWorkout(workout.id, e)} className="text-gray-500 hover:text-green-400 p-1 z-10" title="Клонировать">❐</button>
                                            <button onClick={(e) => openEditModal(workout, e)} className="text-gray-500 hover:text-white p-1 z-10">✎</button>
                                            <div className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
                                        </div>
                                    </div>
                                    {isExpanded && (<div className="bg-black/20 p-4 border-t border-gray-700/50"><div className="space-y-2 mb-4">{exercises.map((ex: any, idx: number) => (<div key={idx} className="flex justify-between items-center text-sm border-b border-gray-700/30 pb-2 last:border-0"><span className="text-gray-300">{idx + 1}. {ex.name}</span><span className="font-mono text-blue-300 text-xs bg-blue-900/20 px-2 py-1 rounded">{ex.sets}x{ex.reps}</span></div>))}</div><button onClick={() => startPlannedWorkout(workout)} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"><span>▶</span> Начать тренировку</button></div>)}
                                </div>
                            );
                        })}
                    </div>
                )}
                <button onClick={handleAddWorkout} disabled={isProcessing} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-bold border-t border-gray-700 flex items-center justify-center gap-2 transition">+ Добавить тренировку</button>
            </div>
        </div>
      )}

      {activeTab === 'measurements' && measurements && measurements.length > 0 && (<div className="space-y-3">{measurements.map((m: any) => (<div key={m.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center"><div><div className="text-xs text-gray-500 mb-1">{new Date(m.date).toLocaleDateString('ru-RU', {day:'numeric', month:'long', year:'numeric'})}</div>{m.weight > 0 && <div className="text-xl font-bold text-white">{m.weight} кг</div>}</div>{m.bodyFat && (<div className="text-right"><div className="text-2xl font-bold text-green-400">{m.bodyFat}%</div><div className="text-[9px] text-gray-500 uppercase">Жир</div></div>)}</div>))}</div>)}
      {activeTab === 'history' && (
        <div className="space-y-4">
            {history.map((log: any) => {
                let exercises = []; try { exercises = JSON.parse(log.details); } catch(e) {}
                const date = new Date(log.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                    <div key={log.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="bg-gray-700/30 p-3 border-b border-gray-700 flex justify-between items-center">
                            <span className="font-bold text-gray-300">📅 {date}</span>
                            <button onClick={() => handleCloneFromHistory(log)} className="text-[10px] bg-blue-900/40 text-blue-300 px-3 py-1 rounded border border-blue-500/30 hover:bg-blue-800 hover:text-white transition">↺ Повторить</button>
                        </div>
                        <div className="p-4 space-y-3">
                            {exercises.map((ex: any, idx: number) => {
                                const weight = ex.actualSets ? ex.actualSets[0]?.weight : ex.doneWeight;
                                const setsInfo = ex.actualSets ? ex.actualSets.map((s:any)=>s.reps).join(', ') : `${ex.doneSets}x${ex.doneReps}`;
                                return (<div key={idx} className="flex justify-between items-start text-sm border-b border-gray-700/30 pb-2 last:border-0 last:pb-0"><span className="text-gray-300 w-2/3">{ex.name}</span><div className="text-right"><div className="font-bold text-white">{weight ? weight+' кг' : '-'}</div><div className="text-xs text-gray-500">{setsInfo}</div></div></div>);
                            })}
                        </div>
                    </div>
                );
            })}
            {history.length === 0 && <div className="text-gray-500 text-center py-10">Архив пуст.</div>}
        </div>
      )}

      {/* МОДАЛКИ (Без изменений, они работают корректно) */}
      {showLibrary && (<div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-[100] backdrop-blur-sm p-0 sm:p-4"><div className="bg-gray-800 w-full sm:w-[400px] h-[95vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border-t sm:border border-gray-700 animate-in slide-in-from-bottom duration-300"><div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center rounded-t-2xl sticky top-0 z-10 shrink-0"><div className="flex items-center gap-4"><div><h3 className="text-xl font-bold text-white">Библиотека</h3><p className="text-xs text-gray-400">Выберите программу</p></div><select className="bg-gray-900 text-xs text-white border border-gray-600 rounded p-1 outline-none" value={libraryWeeks} onChange={(e) => setLibraryWeeks(e.target.value)}><option value="4">4 нед</option><option value="8">8 нед</option><option value="12">12 нед</option></select></div><button onClick={() => setShowLibrary(false)} className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-300">✕</button></div><div className="overflow-y-auto p-4 space-y-3 flex-1 pb-20">{customTemplates.length > 0 && (<div className="mb-4"><h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">⭐ Мои шаблоны</h4><div className="space-y-2">{customTemplates.map((template) => (<div key={template.id} className="bg-gray-700/50 p-4 rounded-xl border border-green-500/30 active:bg-gray-700 transition relative"><button onClick={(e) => handleDeleteTemplate(template.id, e)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 p-1 transition" title="Удалить шаблон">🗑️</button><h4 className="font-bold text-white text-sm mb-1 pr-6">{template.name}</h4><div className="text-[10px] text-gray-400 mb-2">Создан: {new Date(template.createdAt).toLocaleDateString()}</div><button onClick={() => handleApplyTemplate(template.id)} disabled={isProcessing} className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold shadow transition active:scale-95">Применить</button></div>))}</div></div>)}<h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">📦 Базовые</h4>{WORKOUT_LIBRARY.map((template) => (<div key={template.id} className="bg-gray-700/30 p-4 rounded-xl border border-gray-600 active:bg-gray-700 transition relative group"><div className="absolute top-4 right-4"><span className="text-[9px] bg-purple-900/50 text-purple-200 px-2 py-1 rounded uppercase font-bold border border-purple-500/30">{template.category}</span></div><h4 className="font-bold text-white text-sm pr-20 mb-1 leading-tight">{template.title}</h4><p className="text-xs text-gray-400 mb-4 leading-relaxed pr-2">{template.description}</p><button onClick={() => handleApplyTemplate(template.id)} disabled={isProcessing} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-sm font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2">{isProcessing ? '...' : '🚀 Применить'}</button></div>))}</div></div></div>)}
      {editingWorkout && (<div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[110] backdrop-blur-sm" onClick={(e) => e.stopPropagation()}><div className="bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-600 flex flex-col max-h-[90vh]"><div className="p-4 border-b border-gray-700"><h3 className="text-lg font-bold">Редактировать план</h3></div><div className="p-4 overflow-y-auto flex-1 space-y-4"><div><label className="text-xs text-gray-400 block mb-1">Название</label><input className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700 outline-none text-white text-sm" value={editName} onChange={(e) => setEditName(e.target.value)} /></div><div><label className="text-xs text-gray-400 block mb-2">Упражнения</label><div className="space-y-2 pb-20">{editExercises.map((ex, idx) => (<div key={idx} className="bg-gray-700/30 p-2 rounded-lg border border-gray-700 relative"><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2 flex-1 relative"><span className="text-gray-500 text-xs w-4">{idx+1}.</span><input className="w-full bg-transparent border-b border-gray-600 text-sm text-white focus:outline-none placeholder-gray-500" value={ex.name} onFocus={() => setActiveSearchIndex(idx)} onChange={(e) => updateEditExercise(idx, 'name', e.target.value)} placeholder="Название упражнения" />{activeSearchIndex === idx && (<div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 z-50 shadow-xl max-h-40 overflow-y-auto">{getSuggestions(ex.name).map((sugg, i) => (<div key={i} onClick={() => selectSuggestion(idx, sugg)} className="p-3 text-sm hover:bg-blue-600 cursor-pointer border-b border-gray-700 last:border-0">{sugg.name}</div>))}{ex.name.length > 2 && getSuggestions(ex.name).length === 0 && (<div onClick={() => { handleCreateExercise(ex.name); setActiveSearchIndex(null); }} className="p-3 text-sm font-bold text-green-400 hover:bg-gray-700 cursor-pointer flex items-center gap-2 border-t border-gray-700"><span>+</span> Добавить "{ex.name}" в базу</div>)}</div>)}</div><div className="flex items-center gap-1"><button onClick={() => loadExerciseHistory(ex.name, idx)} className={`text-[10px] px-2 py-1 rounded border transition ${historyOpenIndex === idx ? 'bg-purple-600 text-white border-purple-500' : 'bg-purple-900/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/60'} mr-1`}>{historyOpenIndex === idx ? 'Скрыть' : 'История'}</button><button onClick={() => removeEditExercise(idx)} className="text-red-400 text-lg px-1 hover:bg-red-900/20 rounded">×</button></div></div>{historyOpenIndex === idx && (<div className="bg-black/40 p-2 rounded mb-2 border border-purple-500/30"><div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Прошлые результаты:</div>{exerciseHistory.length > 0 ? (exerciseHistory.map((h, hIdx) => (<div key={hIdx} className="flex justify-between py-1 border-b border-gray-700/30 last:border-0 text-xs"><span className="text-gray-400">{h.date}</span><span className="font-bold text-green-400 font-mono">{h.result}</span></div>))) : (<div className="text-center text-xs text-gray-500 italic py-1">Нет записей</div>)}</div>)}<div className="flex gap-2 pl-6"><div className="flex-1"><label className="text-[9px] text-gray-500 block">Вес</label><input className="w-full bg-gray-900 text-center text-xs rounded py-1 border border-gray-600 text-white" value={ex.weight} onChange={(e) => updateEditExercise(idx, 'weight', e.target.value)} placeholder="-" /></div><div className="flex-1"><label className="text-[9px] text-gray-500 block">Подходы</label><input className="w-full bg-gray-900 text-center text-xs rounded py-1 border border-gray-600 text-white" value={ex.sets} onChange={(e) => updateEditExercise(idx, 'sets', e.target.value)} /></div><div className="flex-1"><label className="text-[9px] text-gray-500 block">Повторы</label><input className="w-full bg-gray-900 text-center text-xs rounded py-1 border border-gray-600 text-white" value={ex.reps} onChange={(e) => updateEditExercise(idx, 'reps', e.target.value)} /></div></div></div>))}</div><button onClick={addEditExercise} className="mt-3 w-full py-2 border border-dashed border-gray-600 text-gray-400 text-xs rounded-lg hover:bg-gray-800">+ Добавить упражнение</button></div></div><div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-3"><button onClick={deleteWorkout} className="px-4 py-3 bg-red-900/30 text-red-400 border border-red-900 rounded-xl font-bold text-sm">Удалить</button><div className="flex-1 flex gap-2 justify-end"><button onClick={() => setEditingWorkout(null)} className="px-4 py-3 bg-gray-700 rounded-xl font-bold text-sm text-gray-300">Отмена</button><button onClick={saveEdit} className="px-6 py-3 bg-blue-600 rounded-xl font-bold text-sm text-white shadow-lg">Сохранить</button></div></div></div></div>)}
      {showGenerator && (<div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-sm"><div className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm border border-gray-600 shadow-2xl"><h3 className="text-xl font-bold mb-4">Генератор (Авто)</h3><div className="space-y-4"><select className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none" value={genWeeks} onChange={(e) => setGenWeeks(e.target.value)}><option value="4">4 недели</option><option value="8">8 недель</option></select><select className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none" value={genSplit} onChange={(e) => setGenSplit(e.target.value)}><option value="2day">2 дня (Верх / Низ)</option><option value="3day">3 дня (Push / Pull / Legs)</option></select></div><div className="flex gap-3 mt-6"><button onClick={() => setShowGenerator(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold">Отмена</button><button onClick={handleGenerate} disabled={isProcessing} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold">{isProcessing ? '...' : 'Создать'}</button></div></div></div>)}

    </div>
  );
}