'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MeasurementsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  
  // Поля ввода
  const [gender, setGender] = useState<'male' | 'female'>('male'); // Пол важен для формулы
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [neck, setNeck] = useState('');
  
  // Рассчитанный жир
  const [calculatedFat, setCalculatedFat] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // АВТО-РАСЧЕТ при изменении цифр
  useEffect(() => {
      calculateBodyFat();
  }, [gender, height, waist, hips, neck]);

  const calculateBodyFat = () => {
      const h = parseFloat(height);
      const w = parseFloat(waist);
      const n = parseFloat(neck);
      const hi = parseFloat(hips);

      if (!h || !w || !n) {
          setCalculatedFat(null);
          return;
      }

      let bodyFat = 0;

      // Формула ВМС США (Metric)
      if (gender === 'male') {
          // Для мужчин: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
          if (w - n <= 0) return; // Защита от ошибок
          bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
      } else {
          // Для женщин: 495 / (1.29579 - 0.35004 * log10(waist + hips - neck) + 0.22100 * log10(height)) - 450
          if (!hi || (w + hi - n) <= 0) return;
          bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
      }

      if (bodyFat > 0 && bodyFat < 70) {
          setCalculatedFat(bodyFat.toFixed(1));
      } else {
          setCalculatedFat(null);
      }
  };

  const loadData = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return router.push('/');
    const user = JSON.parse(userStr);

    const res = await fetch(`/api/client/measurements?userId=${user.id}`);
    const data = await res.json();
    if (Array.isArray(data)) setHistory(data);
    
    // Пытаемся найти последний рост, чтобы клиенту не вводить его каждый раз
    if (Array.isArray(data) && data.length > 0) {
        const lastRec = data.find((r:any) => r.height);
        if (lastRec) setHeight(lastRec.height.toString());
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!waist && !hips && !neck) return alert('Введите хотя бы одно значение');
    
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr || '{}');

    await fetch('/api/client/measurements', {
        method: 'POST',
        body: JSON.stringify({ 
            userId: user.id, 
            waist, hips, neck, height, 
            bodyFat: calculatedFat // Сохраняем рассчитанный процент
        })
    });

    setWaist(''); setHips(''); setNeck('');
    loadData();
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      
      {/* Шапка */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/client')} className="text-gray-400 bg-gray-800 px-3 py-1 rounded-lg text-sm">← Назад</button>
        <h1 className="text-xl font-bold">Замеры и Жир %</h1>
      </div>

      {/* КАРТОЧКА ВВОДА */}
      <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 mb-8 shadow-lg relative overflow-hidden">
          
          {/* Переключатель пола */}
          <div className="flex bg-gray-900 p-1 rounded-lg mb-4">
              <button onClick={() => setGender('male')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${gender==='male' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}>Мужчина</button>
              <button onClick={() => setGender('female')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${gender==='female' ? 'bg-pink-600 text-white shadow' : 'text-gray-500'}`}>Женщина</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Рост (см)</label>
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="180" />
              </div>
              <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Шея (см)</label>
                  <input type="number" value={neck} onChange={e => setNeck(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="40" />
              </div>
              <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Талия (см)</label>
                  <input type="number" value={waist} onChange={e => setWaist(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="80" />
              </div>
              <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Бедра {gender==='male' && '(необяз)'}</label>
                  <input type="number" value={hips} onChange={e => setHips(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="90" />
              </div>
          </div>

          {/* Результат расчета */}
          <div className="bg-black/30 rounded-xl p-3 mb-4 flex justify-between items-center border border-white/5">
              <span className="text-gray-400 text-xs">Процент жира (US Navy):</span>
              {calculatedFat ? (
                  <span className="text-xl font-bold text-green-400">{calculatedFat}%</span>
              ) : (
                  <span className="text-gray-600 text-xs">Заполните данные</span>
              )}
          </div>

          <button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition">Сохранить</button>
      </div>

      {/* ИСТОРИЯ */}
      <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 ml-1">История</h3>
          <div className="space-y-2">
              {history.map((item: any) => (
                  <div key={item.id} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                          <span className="text-gray-400 text-xs">
                              {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          {item.bodyFat && (
                              <span className="text-green-400 font-bold text-sm bg-green-900/20 px-2 py-0.5 rounded">
                                  {item.bodyFat}% жира
                              </span>
                          )}
                      </div>
                      <div className="flex gap-3 text-xs text-gray-300 justify-end">
                          {item.waist && <span>Т: {item.waist}</span>}
                          {item.hips && <span>Б: {item.hips}</span>}
                          {item.neck && <span>Ш: {item.neck}</span>}
                      </div>
                  </div>
              ))}
              {history.length === 0 && <div className="text-center text-gray-600 text-xs py-4">Нет данных</div>}
          </div>
      </div>

    </div>
  );
}