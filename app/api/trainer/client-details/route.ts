import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId } = body;
    
    if (!clientId) {
        return NextResponse.json({ error: 'Не передан ID клиента' }, { status: 400 });
    }

    const uid = parseInt(clientId);

    // 1. Клиент
    const client = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!client) {
        return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
    }

    // 2. Плейлист (Активные)
    const playlist = await prisma.plannedWorkout.findMany({
      where: { userId: uid, isDone: false },
      orderBy: { order: 'asc' }
    });

    // 3. История (Архив) - УВЕЛИЧИЛИ ЛИМИТ
    const history = await prisma.workoutLog.findMany({
      where: { userId: uid },
      orderBy: { date: 'desc' },
      take: 50 // <--- Было 5, стало 50. Теперь увидишь последние 50 тренировок.
    });

    // 4. Замеры
    const measurements = await prisma.measurement.findMany({
      where: { userId: uid },
      orderBy: { date: 'desc' },
      take: 20
    });

    return NextResponse.json({ client, playlist, history, measurements });
  } catch (error) {
    console.error("Ошибка API client-details:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}