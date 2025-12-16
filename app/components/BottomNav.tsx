'use client';
import { usePathname } from 'next/navigation';
import ClientMenu from './ClientMenu';
import TrainerMenu from './TrainerMenu';

export default function BottomNav() {
  const pathname = usePathname();

  // 1. Если это страница входа или регистрации — ничего не показываем
  if (pathname === '/' || pathname === '/register') {
    return null;
  }

  // 2. ЖЕЛЕЗОБЕТОННАЯ ПРОВЕРКА ПО URL
  // Если адрес начинается с /trainer — показываем меню тренера
  if (pathname.startsWith('/trainer')) {
    return <TrainerMenu />;
  }

  // 3. Если адрес начинается с /client — показываем меню клиента
  if (pathname.startsWith('/client')) {
    return <ClientMenu />;
  }

  // 4. Если мы где-то еще — ничего не показываем
  return null;
}