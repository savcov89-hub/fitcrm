import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const workoutId = parseInt(id);

    // 1. Находим оригинал
    const original = await prisma.plannedWorkout.findUnique({ where: { id: workoutId } });
    if (!original) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

    // 2. Ищем последний номер в очереди
    const last = await prisma.plannedWorkout.findFirst({
        where: { userId: original.userId, isDone: false },
        orderBy: { order: 'desc' }
    });
    const nextOrder = (last?.order || 0) + 1;

    // 3. Создаем копию
    await prisma.plannedWorkout.create({
        data: {
            userId: original.userId,
            name: `${original.name} (Копия)`,
            exercises: original.exercises, // Копируем упражнения
            order: nextOrder,
            isDone: false
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}