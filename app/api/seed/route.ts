import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // 1. Создаем Тренера
  const trainer = await prisma.user.create({
    data: {
      email: 'trainer@fit.com',
      password: '123', 
      role: 'trainer',
      name: 'Иван Тренер',
    },
  });

  // 2. Создаем Клиента
  const client = await prisma.user.create({
    data: {
      email: 'client@fit.com',
      password: '123',
      role: 'client',
      name: 'Алексей Клиент',
      measurements: {
        create: {
          weight: 80.5,
          height: 180, 
          neck: 40,
          waist: 90,
        }
      }
    },
  });

  return NextResponse.json({ message: 'База данных успешно заполнена!', trainer, client });
}