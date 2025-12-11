import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, details, plannedId } = body; 
    const uid = parseInt(userId);

    // 1. Сохраняем в Историю (Log) - для статистики
    const log = await prisma.workoutLog.create({
        data: {
          userId: uid,
          details: JSON.stringify(details),
          isDone: true
        }
    });

    // 2. ОБНОВЛЯЕМ ПЛАН (PlannedWorkout)
    // Мы не просто ставим isDone: true, но и перезаписываем 'exercises' 
    // теми данными, которые ввел клиент (с реальными подходами).
    if (plannedId) {
        await prisma.plannedWorkout.update({
            where: { id: parseInt(plannedId) },
            data: { 
                isDone: true,
                exercises: JSON.stringify(details) // <--- ВАЖНО: Сохраняем факт в план
            }
        });
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }
}