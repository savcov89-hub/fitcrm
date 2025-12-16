'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrainerDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- РАСШИРЕННАЯ АНКЕТА ---
  const [newClient, setNewClient] = useState({ 
      name: '', 
      email: '', 
      password: '',
      gender: 'male', // По умолчанию Мужской
      height: '',
      birthDate: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const userStr = localStorage.getItem('user');
      let currentUserId = null;
      
      if (userStr) {
          const u = JSON.parse(userStr);
          setUser(u);
          currentUserId = u.id;
      }

      const url = currentUserId 
        ? `/api/trainer/get-clients?id=${currentUserId}` 
        : '/api/trainer/get-clients';

      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (Array.isArray(data)) setClients(data);
    } catch (e) { 
        console.error(e);
    } 
    finally { setLoading(false); }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newClient.name || !newClient.email || !newClient.password) {
          alert('Имя, Email и Пароль обязательны!');
          return;
      }

      try {
          const res = await fetch('/api/auth/register', {
              method: 'POST',
              body: JSON.stringify({
                  ...newClient, // Передаем все поля (рост, пол и т.д.)
                  role: 'client',
                  trainerId: user?.id
              })
          });

          const data = await res.json();

          if (data.success) {
              alert('Клиент успешно добавлен!');
              setIsModalOpen(false);
              // Сброс формы
              setNewClient({ name: '', email: '', password: '', gender: 'male', height: '', birthDate: '' }); 
              loadClients();
          } else {
              alert(data.error || 'Ошибка при создании');
          }
      } catch (e) {
          console.error(e);
          alert('Ошибка сервера');
      }
  };

  const toggleStatus = async (client: any, e: any) => {
      e.stopPropagation(); 
      const newStatus = !client.isTraining;
      if (!newStatus && !confirm(`Завершить тренировку клиента ${client.name}?`)) return;

      setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, isTraining: newStatus } : c));

      try {
          await fetch('/api/client/status', {
              method: 'POST',
              body: JSON.stringify({ userId: client.id, isTraining: newStatus })
          });
      } catch (error) {
          alert("Ошибка соединения");
          loadClients();
      }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-10 text-center">Загрузка...</div>;

  const activeClients = clients.filter((c) => c.isTraining);
  const inactiveClients = clients.filter((c) => !c.isTraining);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24 relative">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Тренерская</h1>
          <button onClick={() => { localStorage.removeItem('user'); router.push('/'); }} className="text-xs text-red-400 border border-red-900/50 px-3 py-1 rounded hover:bg-red-900/20 transition">Выйти</button>
      </div>

      <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${activeClients.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
          <span className="text-xs font-bold uppercase text-gray-400">LIVE: В зале ({activeClients.length})</span>
      </div>

      <div className="space-y-3">
        {activeClients.map((client) => (
            <ClientCard key={client.id} client={client} router={router} toggleStatus={toggleStatus} />
        ))}
        {inactiveClients.map((client) => (
            <ClientCard key={client.id} client={client} router={router} toggleStatus={toggleStatus} />
        ))}
        {clients.length === 0 && !loading && (
            <div className="text-gray-500 text-center mt-10 p-4 border border-dashed border-gray-700 rounded-xl">
                Клиентов пока нет. Нажмите "+" внизу.
            </div>
        )}
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-xl shadow-blue-900/40 flex items-center justify-center text-3xl text-white active:scale-90 transition z-10 border border-white/10"
      >
        +
      </button>

      {/* --- МОДАЛЬНОЕ ОКНО С АНКЕТОЙ --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-800 w-full max-w-sm rounded-2xl border border-gray-700 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4 text-center">Анкета клиента</h2>
                
                <form onSubmit={handleCreateClient} className="space-y-3">
                    {/* Основные данные */}
                    <div className="space-y-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold">Имя Фамилия *</label>
                            <input className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none" placeholder="Иван Петров" required
                                value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold">Email (Логин) *</label>
                            <input className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none" placeholder="mail@example.com" required
                                value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold">Пароль *</label>
                            <input className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none" placeholder="******" required
                                value={newClient.password} onChange={e => setNewClient({...newClient, password: e.target.value})} />
                        </div>
                    </div>

                    {/* Физические параметры */}
                    <div className="space-y-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                         <p className="text-xs text-blue-400 font-bold uppercase mb-1">Физические данные</p>
                         
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold">Пол</label>
                                <select className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                    value={newClient.gender} onChange={e => setNewClient({...newClient, gender: e.target.value})}>
                                    <option value="male">Мужской</option>
                                    <option value="female">Женский</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold">Рост (см)</label>
                                <input type="number" className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none" placeholder="180"
                                    value={newClient.height} onChange={e => setNewClient({...newClient, height: e.target.value})} />
                            </div>
                         </div>

                         <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold">Дата рождения</label>
                            <input type="date" className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                value={newClient.birthDate} onChange={e => setNewClient({...newClient, birthDate: e.target.value})} />
                         </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-700 py-3 rounded-xl font-bold text-gray-300 hover:bg-gray-600">Отмена</button>
                        <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 shadow-lg">Создать</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, router, toggleStatus }: any) {
    return (
        <div onClick={() => router.push(`/trainer/client/${client.id}`)}
            className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition active:scale-[0.98] ${client.isTraining ? 'bg-gray-800 border-green-500/50 shadow-lg shadow-green-900/10' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${client.isTraining ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {client.name ? client.name[0].toUpperCase() : '?'}
                </div>
                <div>
                    <h3 className={`font-bold text-sm ${client.isTraining ? 'text-white' : 'text-gray-300'}`}>{client.name}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{client.isTraining ? '🔥 Сейчас тренируется' : 'Не в зале'}</p>
                </div>
            </div>
            <button onClick={(e) => toggleStatus(client, e)}
                className={`text-[10px] font-bold px-4 py-2 rounded-lg border transition shadow-sm ${client.isTraining ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-red-900/30 hover:text-red-400 hover:border-red-900' : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-blue-900/20'}`}>
                {client.isTraining ? 'Ушел 🚪' : 'Пришел 👋'}
            </button>
        </div>
    );
}