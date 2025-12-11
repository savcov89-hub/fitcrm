'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/trainer/clients').then(res => res.json()).then(setClients);
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    setLoading(true);
    fetch('/api/history', {
      method: 'POST',
      body: JSON.stringify({ clientId: selectedClient })
    })
    .then(res => res.json())
    .then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, [selectedClient]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-2xl font-bold text-blue-500">История</h1>
      </div>

      <div className="mb-6">
        <select 
          className="w-full bg-gray-800 p-3 rounded-xl border border-gray-700"
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          <option value="">-- Выберите клиента --</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading && <div className="text-center text-gray-400">Загрузка...</div>}

      <div className="space-y-6">
        {logs.map((log) => {
          const exercises = JSON.parse(log.details);
          const date = new Date(log.date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
          });

          return (
            <div key={log.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-gray-700/50 p-3 border-b border-gray-700 flex justify-between">
                <span className="font-bold text-blue-400">📅 {date}</span>
              </div>

              <div className="p-4 space-y-5">
                {exercises.map((ex: any, i: number) => {
                  // Определяем рабочий вес (берем из первого подхода, так как он теперь единый)
                  const workingWeight = ex.actualSets ? ex.actualSets[0]?.weight : ex.doneWeight;

                  return (
                    <div key={i} className="border-b border-gray-700/50 pb-4 last:border-0 last:pb-0">
                      
                      {/* Верхняя строка: Название + Вес */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-white text-lg w-2/3 leading-tight">{ex.name}</div>
                        <div className="text-right">
                            <span className="block text-xl font-bold text-green-400">
                                {workingWeight} <span className="text-sm text-gray-400">кг</span>
                            </span>
                            <span className="text-xs text-gray-500 uppercase">Рабочий вес</span>
                        </div>
                      </div>
                      
                      {/* Нижняя строка: Ряд повторений */}
                      {ex.actualSets ? (
                        <div className="flex flex-wrap gap-2">
                            {ex.actualSets.map((set: any, sIdx: number) => (
                                <div key={sIdx} className="bg-gray-700 w-12 h-10 rounded-lg flex flex-col items-center justify-center border border-gray-600">
                                    <span className="text-white font-bold leading-none">{set.reps}</span>
                                    <span className="text-[9px] text-gray-400 leading-none mt-0.5">повт</span>
                                </div>
                            ))}
                        </div>
                      ) : (
                        // Для старых записей
                        <div className="text-gray-400 text-sm">
                            Сделано: {ex.doneSets} x {ex.doneReps}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}