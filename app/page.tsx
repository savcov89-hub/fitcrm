'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Проверка, если уже вошли - кидаем внутрь
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const u = JSON.parse(user);
      router.push(u.role === 'trainer' ? '/trainer' : '/client');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push(data.user.role === 'trainer' ? '/trainer' : '/client');
    } else {
      alert('Неверный логин или пароль');
    }
  };

  const fastLogin = async (role: string) => {
      // Для тестов оставим быстрый вход (потом можно убрать)
      const email = role === 'trainer' ? 'trainer@fit.com' : 'client@fit.com'; 
      const res = await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: '123' })
      });
      const data = await res.json();
      if(data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push(data.user.role === 'trainer' ? '/trainer' : '/client');
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">FitCRM</h1>
          <p className="text-gray-400 text-sm">Система ведения клиентов</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="name@example.com"
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="•••"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition transform active:scale-95 shadow-lg shadow-blue-900/50">
            Войти в систему
          </button>
        </form>

        {/* --- НОВАЯ КНОПКА РЕГИСТРАЦИИ --- */}
        <div className="mt-6 text-center border-t border-gray-700 pt-4">
            <p className="text-gray-500 text-xs mb-3">Впервые здесь?</p>
            <button 
                onClick={() => router.push('/register')} 
                className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white font-bold py-2.5 rounded-lg transition text-sm"
            >
                Создать аккаунт
            </button>
        </div>

        {/* ТЕСТОВЫЙ ВХОД (Можно оставить или убрать) */}
        <div className="mt-8 pt-4 border-t border-gray-700/50">
            <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Тестовый вход</p>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => fastLogin('trainer')} className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded text-xs font-bold transition border border-gray-600">
                    🏋️‍♂️ Я Тренер
                </button>
                <button onClick={() => fastLogin('client')} className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded text-xs font-bold transition border border-gray-600">
                    🏃‍♂️ Я Клиент
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}