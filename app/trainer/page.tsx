'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrainerClientsList() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояния для поиска
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Состояния для модального окна добавления
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Поля формы создания
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newGender, setNewGender] = useState('male');
  const [newHeight, setNewHeight] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');

  const router = useRouter();

  const loadClients = () => {
    fetch('/api/trainer/clients', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Ошибка загрузки');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setClients(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsCreating(true);

      try {
          const res = await fetch('/api/trainer/add-client', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: newName,
                  email: newEmail,
                  password: newPassword,
                  gender: newGender,
                  height: newHeight,
                  birthDate: newBirthDate
              })
          });

          const json = await res.json();

          if (!res.ok) {
              alert(json.error || 'Ошибка');
          } else {
              setShowAddModal(false);
              setNewName(''); setNewEmail(''); setNewPassword('');
              setNewGender('male'); setNewHeight(''); setNewBirthDate('');
              loadClients();
          }
      } catch (e) {
          alert('Ошибка сети');
      } finally {
          setIsCreating(false);
      }
  };

  const calculateAge = (dateString: string) => {
      if (!dateString) return '';
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age;
  };

  const toggleStatus = async (e: any, client: any) => {
      e.stopPropagation(); 
      const newStatus = !client.isActive; 
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, isActive: newStatus } : c));
      try {
          await fetch('/api/trainer/status', {
              method: 'POST',
              body: JSON.stringify({ userId: client.id, isActive: newStatus })
          });
      } catch (err) {
          setClients(prev => prev.map(c => c.id === client.id ? { ...c, isActive: !newStatus } : c));
      }
  };

  const handleLogout = () => {
    if (confirm('Выйти из аккаунта?')) {
        localStorage.removeItem('user');
        router.push('/'); 
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center">Загрузка...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-400 p-10 text-center">{error}</div>;

  // --- ЛОГИКА ФИЛЬТРАЦИИ ---
  // Сначала фильтруем по поиску, потом делим на группы
  const filteredClients = clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeClients = filteredClients.filter(c => c.isActive); 
  const inactiveClients = filteredClients.filter(c => !c.isActive); 

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24 relative">
      
      {/* Шапка */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Тренерская</h1>
        <div className="flex gap-2">
            {/* Кнопка ПОИСК */}
            <button 
                onClick={() => {
                    setShowSearch(!showSearch);
                    if (showSearch) setSearchQuery(''); // Очистить при закрытии
                }} 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow active:scale-95 transition border ${showSearch ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                🔍
            </button>

            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow active:scale-95 transition hover:bg-blue-500">+</button>
            <button onClick={handleLogout} className="bg-red-900/20 text-red-400 border border-red-900/50 px-3 py-1 rounded-lg text-xs font-bold">Выйти</button>
        </div>
      </div>

      {/* ПОЛЕ ПОИСКА (Появляется при нажатии) */}
      {showSearch && (
          <div className="mb-6 animate-in slide-in-from-top duration-200">
              <input 
                  type="text" 
                  autoFocus
                  placeholder="Найти клиента..." 
                  className="w-full bg-gray-800 p-3 rounded-xl border border-blue-500/50 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
      )}

      <div className="mb-8">
          <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">🔴 Live: В зале ({activeClients.length})</h2>
          <div className="space-y-2">
              {activeClients.length === 0 ? <div className="text-center p-6 border border-dashed border-gray-800 rounded-xl text-gray-600 text-sm">Никого нет</div> : activeClients.map(c => (
                  <div key={c.id} onClick={() => router.push(`/trainer/client/${c.id}`)} className="bg-gray-800/80 border border-orange-500/30 p-3 rounded-xl flex justify-between items-center shadow-lg shadow-orange-900/10 cursor-pointer active:scale-[0.99] transition">
                      <div className="flex items-center gap-3">
                          <div className="relative"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-white shadow">{c.name[0]}</div><div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full animate-pulse"></div></div>
                          <div><div className="font-bold text-sm">{c.name}</div><div className="text-[10px] text-orange-400 font-bold flex items-center gap-1">{c.isTraining ? '🔥 Тренируется' : '⏳ В раздевалке / Отдых'}</div></div>
                      </div>
                      <button onClick={(e) => toggleStatus(e, c)} className="bg-gray-700 hover:bg-gray-600 text-xs px-3 py-2 rounded-lg text-gray-300 border border-gray-600 transition">Ушел 🚪</button>
                  </div>
              ))}
          </div>
      </div>

      <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Все клиенты ({inactiveClients.length})</h2>
          <div className="space-y-2">
              {inactiveClients.map(c => (
                  <div key={c.id} onClick={() => router.push(`/trainer/client/${c.id}`)} className="bg-gray-800 p-3 rounded-xl flex justify-between items-center border border-gray-700/50 cursor-pointer active:bg-gray-700 transition">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-400">{c.name[0]}</div>
                          <div><div className="font-bold text-sm text-gray-300">{c.name}</div><div className="text-[10px] text-gray-600">Не в зале</div></div>
                      </div>
                      <button onClick={(e) => toggleStatus(e, c)} className="bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/50 text-xs px-3 py-2 rounded-lg transition">Пришел 👋</button>
                  </div>
              ))}
              {/* Если поиск активен и ничего не найдено */}
              {searchQuery && inactiveClients.length === 0 && activeClients.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">Клиент не найден</div>
              )}
          </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <div className="bg-gray-800 w-full max-w-sm p-6 rounded-2xl border border-gray-600 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-white">Новый клиент</h3>
                <form onSubmit={handleCreateClient} className="space-y-3">
                    <div className="flex gap-2">
                        <div className="flex-1"><label className="text-xs text-gray-400 block mb-1">ФИО</label><input className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none text-white text-sm" placeholder="Иванов Иван Иванович" value={newName} onChange={e => setNewName(e.target.value)} required /></div>
                        <div className="w-1/3"><label className="text-xs text-gray-400 block mb-1">Пол</label><select className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none text-white text-sm" value={newGender} onChange={e => setNewGender(e.target.value)}><option value="male">М</option><option value="female">Ж</option></select></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1"><label className="text-xs text-gray-400 block mb-1">Дата рождения {newBirthDate && <span className="text-blue-400">({calculateAge(newBirthDate)} лет)</span>}</label><input type="date" className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none text-white text-sm" value={newBirthDate} onChange={e => setNewBirthDate(e.target.value)} /></div>
                        <div className="w-1/3"><label className="text-xs text-gray-400 block mb-1">Рост (см)</label><input type="number" className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none text-white text-sm" placeholder="180" value={newHeight} onChange={e => setNewHeight(e.target.value)} /></div>
                    </div>
                    <div><label className="text-xs text-gray-400 block mb-1">Email (Логин)</label><input type="email" className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none text-white text-sm" placeholder="client@fit.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required /></div>
                    <div><label className="text-xs text-gray-400 block mb-1">Пароль</label><input type="text" className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 outline-none text-white text-sm" placeholder="123" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-gray-300">Отмена</button><button type="submit" disabled={isCreating} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg">{isCreating ? '...' : 'Создать'}</button></div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}