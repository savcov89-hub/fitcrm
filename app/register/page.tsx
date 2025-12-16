'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'trainer' | 'client'>('client');
  const [trainers, setTrainers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    trainerId: ''
  });

  // Загружаем список тренеров
  useEffect(() => {
    fetch('/api/public/trainers')
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setTrainers(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'client' && !formData.trainerId) {
        alert("Пожалуйста, выберите тренера");
        return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...formData, role })
    });

    const data = await res.json();
    if (data.success) {
      alert("Регистрация успешна! Теперь войдите.");
      router.push('/');
    } else {
      alert(data.error || "Ошибка регистрации");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 pb-24">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Регистрация</h1>

        {/* ПЕРЕКЛЮЧАТЕЛЬ РОЛИ */}
        <div className="flex bg-gray-700 p-1 rounded-lg mb-6">
          <button 
            type="button"
            onClick={() => setRole('client')}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition ${role === 'client' ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}
          >
            Я Клиент
          </button>
          <button 
            type="button"
            onClick={() => setRole('trainer')}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition ${role === 'trainer' ? 'bg-orange-600 text-white shadow' : 'text-gray-400'}`}
          >
            Я Тренер
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase">Имя</label>
            <input 
              type="text" required 
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-3 mt-1 focus:border-blue-500 outline-none font-bold"
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Иван Иванов"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase">Email</label>
            <input 
              type="email" required 
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-3 mt-1 focus:border-blue-500 outline-none font-bold"
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="mail@example.com"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase">Пароль</label>
            <input 
              type="password" required 
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-3 mt-1 focus:border-blue-500 outline-none font-bold"
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="••••••"
            />
          </div>

          {/* ВЫБОР ТРЕНЕРА (Только для клиентов) */}
          {role === 'client' && (
            <div className="pt-2">
              <label className="text-orange-400 text-xs font-bold uppercase">Ваш тренер</label>
              <select 
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-3 mt-1 focus:border-orange-500 outline-none appearance-none font-bold"
                onChange={e => setFormData({...formData, trainerId: e.target.value})}
                defaultValue=""
                required
              >
                <option value="" disabled>-- Выберите из списка --</option>
                {trainers.length > 0 ? trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                )) : <option disabled>Нет тренеров</option>}
              </select>
            </div>
          )}

          <button className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded-lg mt-4 transition shadow-lg active:scale-95">
            Зарегистрироваться
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Уже есть аккаунт? <button onClick={() => router.push('/')} className="text-blue-400 hover:text-blue-300 font-bold">Войти</button>
        </p>
      </div>
    </div>
  );
}