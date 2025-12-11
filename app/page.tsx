'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Если пользователь уже вошел, перекидываем его внутрь
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'trainer') router.push('/trainer');
        else if (user.role === 'client') router.push('/client');
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent, forceEmail?: string, forcePass?: string) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    // Используем либо переданные данные (от быстрых кнопок), либо то, что в полях
    const emailToSend = forceEmail || email;
    const passToSend = forcePass || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend, password: passToSend })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      // 1. Сохраняем пользователя в память браузера
      localStorage.setItem('user', JSON.stringify(data.user));

      // 2. ВАЖНО: Сообщаем всему приложению, что мы вошли (чтобы обновилось нижнее меню)
      window.dispatchEvent(new Event('user-login'));

      // 3. Перенаправляем в зависимости от роли
      if (data.user.role === 'trainer') {
        router.push('/trainer');
      } else {
        router.push('/client');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Функция для быстрого входа через тестовые кнопки
  const quickLogin = (role: 'trainer' | 'client') => {
      // Визуально заполняем поля, чтобы было красиво
      if (role === 'trainer') {
          setEmail('trainer@fit.com');
          setPassword('123');
          // Вызываем вход сразу с нужными данными
          handleLogin(undefined, 'trainer@fit.com', '123');
      } else {
          setEmail('client@fit.com');
          setPassword('123');
          handleLogin(undefined, 'client@fit.com', '123');
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">FitCRM</h1>
          <p className="text-gray-400 text-sm">Система ведения клиентов</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="text-gray-400 text-xs uppercase font-bold block mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase font-bold block mb-2">Пароль</label>
            <input 
              type="password" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти в систему'}
          </button>
        </form>

        {/* --- БЛОК БЫСТРОГО ВХОДА (ТЕСТОВЫЙ) --- */}
        <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center mb-3 uppercase font-bold tracking-widest">Тестовый вход</p>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    type="button" // Важно, чтобы не срабатывал submit формы
                    onClick={() => quickLogin('trainer')}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-2 rounded-lg border border-gray-600 transition active:scale-95"
                >
                    👨‍🏫 Я Тренер
                    <div className="text-[9px] text-gray-500 mt-0.5">pass: 123</div>
                </button>
                <button 
                    type="button"
                    onClick={() => quickLogin('client')}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-2 rounded-lg border border-gray-600 transition active:scale-95"
                >
                    🏃‍♂️ Я Клиент
                    <div className="text-[9px] text-gray-500 mt-0.5">pass: 123</div>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}