'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function WeightTrackerPage() {
  const router = useRouter();
  
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Состояние графика
  const [period, setPeriod] = useState<'1M' | '3M' | '6M' | 'ALL'>('1M');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    loadData();
  }, []);

  const loadData = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return router.push('/');
    const user = JSON.parse(userStr);

    try {
        const res = await fetch(`/api/client/weight?userId=${user.id}`);
        const json = await res.json();
        setData(json);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!weight || !date) return;
    setSaving(true);
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr || '{}');

    await fetch('/api/client/weight', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, weight, date })
    });

    setWeight(''); setSaving(false); loadData();
  };

  // --- ЛОГИКА ГРАФИКА ---
  const chartData = useMemo(() => {
      if (!data?.logs) return [];
      
      const now = new Date();
      let days = 30;
      if (period === '3M') days = 90;
      if (period === '6M') days = 180;
      if (period === 'ALL') days = 3650; // 10 лет

      const cutoff = new Date();
      cutoff.setDate(now.getDate() - days);

      // Фильтруем по дате и переворачиваем (старые слева, новые справа)
      return data.logs
        .filter((l: any) => new Date(l.date) >= cutoff)
        .reverse();
  }, [data, period]);

  // Расчет координат SVG
  const weights = chartData.map((d: any) => d.weight);
  const minW = Math.min(...weights) - 0.5; 
  const maxW = Math.max(...weights) + 0.5; 
  const range = maxW - minW || 1;

  const points = chartData.map((d: any, i: number) => {
      const x = (i / (chartData.length - 1 || 1)) * 100; 
      const y = 100 - ((d.weight - minW) / range) * 80 - 10; // Отступ 10% сверху и снизу
      return { x, y, ...d };
  });

  const polylinePoints = points.map((p: any) => `${p.x},${p.y}`).join(' ');

  // Компонент маленькой карточки
  const StatCard = ({ title, value, diff }: { title: string, value: string | null, diff: string | null }) => {
      const diffNum = Number(diff);
      const diffColor = diffNum < 0 ? 'text-green-400' : diffNum > 0 ? 'text-red-400' : 'text-gray-500';
      const sign = diffNum > 0 ? '+' : '';
      return (
        <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 flex flex-col justify-center items-center h-20">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{title}</div>
            <div className="font-bold text-gray-200 text-lg leading-none">{value || '—'}</div>
            {diff && <div className={`text-[10px] font-bold ${diffColor} mt-1`}>{sign}{diff} кг</div>}
        </div>
      );
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center">Загрузка...</div>;

  const stats = data?.stats || {};
  const listHistory = (data?.logs || []).slice(0, 10);
  const diffCurrentNum = Number(stats.diffCurrent);
  const mainColor = diffCurrentNum < 0 ? 'text-green-400' : diffCurrentNum > 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24" onClick={() => setHoveredPoint(null)}>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/client')} className="text-gray-400 bg-gray-800 px-3 py-1 rounded-lg text-sm">← Назад</button>
        <h1 className="text-xl font-bold">Контроль веса</h1>
      </div>

      {/* КАРТОЧКА ГРАФИКА */}
      <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-6 shadow-xl relative">
          
          {/* Заголовок и текущее значение */}
          <div className="text-center mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest">Средний (7 дней)</p>
              <div className="text-4xl font-bold text-white">
                  {stats.current || '—'} <span className="text-lg text-gray-500 font-normal">кг</span>
              </div>
              {stats.diffCurrent && (
                  <div className={`text-sm font-bold ${mainColor}`}>
                      {diffCurrentNum > 0 ? '+' : ''}{stats.diffCurrent} кг за неделю
                  </div>
              )}
          </div>

          {/* Сам график */}
          <div className="h-40 w-full relative mb-4" onClick={(e) => e.stopPropagation()}>
              {chartData.length > 1 ? (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      {/* Линия */}
                      <polyline points={polylinePoints} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      
                      {/* Область под графиком */}
                      <defs>
                        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={`M0,100 ${polylinePoints} V100 Z`} fill="url(#grad)" stroke="none" />

                      {/* Точки (для нажатия) */}
                      {points.map((p: any, i: number) => (
                          <g key={i}>
                              {/* Невидимая большая зона для клика */}
                              <circle 
                                cx={p.x} cy={p.y} r="6" fill="transparent" 
                                className="cursor-pointer"
                                onClick={() => setHoveredPoint(p)}
                              />
                              {/* Видимая точка */}
                              <circle cx={p.x} cy={p.y} r="1.5" fill="white" pointerEvents="none" />
                          </g>
                      ))}
                  </svg>
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 text-xs">Мало данных для графика</div>
              )}

              {/* Всплывашка при клике на точку */}
              {hoveredPoint && (
                  <div 
                    className="absolute bg-gray-900 border border-blue-500 rounded-lg p-2 shadow-xl z-10 transform -translate-x-1/2 -translate-y-full pointer-events-none"
                    style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y - 5}%` }}
                  >
                      <div className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(hoveredPoint.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-sm font-bold text-white text-center">{hoveredPoint.weight} кг</div>
                      <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-blue-500 transform rotate-45"></div>
                  </div>
              )}
          </div>

          {/* Кнопки периода */}
          <div className="flex bg-gray-900 p-1 rounded-xl">
              {['1M', '3M', '6M', 'ALL'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setPeriod(t as any)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${period === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                      {t}
                  </button>
              ))}
          </div>
      </div>

      {/* ФОРМА ВВОДА */}
      <div className="mb-8">
          <label className="text-gray-400 text-xs ml-1 mb-2 block">Добавить запись:</label>
          <div className="flex gap-2">
              <input type="date" className="bg-gray-800 text-white text-sm p-3 rounded-xl w-1/3 border border-gray-700 outline-none" value={date} onChange={e => setDate(e.target.value)} />
              <input type="number" placeholder="00.0" className="bg-gray-800 text-white text-xl p-3 rounded-xl w-1/3 border border-gray-700 outline-none text-center" value={weight} onChange={e => setWeight(e.target.value)} />
              <button onClick={handleSave} disabled={saving} className="bg-blue-600 px-4 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition disabled:opacity-50 w-1/3">
                  {saving ? '...' : 'Сохранить'}
              </button>
          </div>
      </div>

      {/* СЕТКА ДИНАМИКИ (4 НЕДЕЛИ) */}
      <div className="mb-6">
          <h3 className="text-xs text-gray-500 font-bold uppercase mb-2 ml-1">Динамика (4 недели)</h3>
          <div className="grid grid-cols-2 gap-3">
              <StatCard title="Неделю назад" value={stats.week2} diff={stats.diffWeek2} />
              <StatCard title="2 недели назад" value={stats.week3} diff={stats.diffWeek3} />
              <StatCard title="3 недели назад" value={stats.week4} diff={stats.diffWeek4} />
              <StatCard title="4 недели назад" value={stats.week5} diff={stats.diffWeek4 ? null : ''} /> 
          </div>
      </div>

      {/* ИСТОРИЯ */}
      <div>
          <h3 className="text-xs text-gray-500 font-bold uppercase mb-2 ml-1">История</h3>
          <div className="space-y-2">
              {listHistory.map((log: any) => (
                  <div key={log.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700/50">
                      <span className="text-gray-400 text-sm">
                          {new Date(log.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="font-bold text-white text-lg">{log.weight} кг</span>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
}