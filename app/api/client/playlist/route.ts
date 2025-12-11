import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const uid = parseInt(userId);

    // Достаем весь план, сортируем по порядку
    const playlist = await prisma.plannedWorkout.findMany({
      where: { userId: uid },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(playlist);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка загрузки плана' }, { status: 500 });
  }
}