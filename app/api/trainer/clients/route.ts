import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Эта строчка ВАЖНА: она запрещает кэширование
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
      const clients = await prisma.user.findMany({
        where: { role: 'client' },
        select: { 
            id: true, 
            name: true, 
            email: true,
            isActive: true,   // Статус "В зале"
            isTraining: true  // Статус "Начал тренировку"
        },
        orderBy: { name: 'asc' }
      });
      
      return NextResponse.json(clients);
  } catch (error: any) {
      console.error("ОШИБКА API CLIENTS:", error);
      return NextResponse.json({ error: 'Ошибка базы данных: ' + error.message }, { status: 500 });
  }
}