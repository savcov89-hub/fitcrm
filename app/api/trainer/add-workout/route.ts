import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();
    const uid = parseInt(clientId);

    // 1. Ищем последний номер очереди (order)
    const lastWorkout = await prisma.plannedWorkout.findFirst({
        where: { userId: uid, isDone: false },
        orderBy: { order: 'desc' }
    });
    const nextOrder = (lastWorkout?.order || 0) + 1;

    // 2. Создаем пустую тренировку
    await prisma.plannedWorkout.create({
        data: {
            userId: uid,
            name: 'Новая тренировка', // Имя по умолчанию
            order: nextOrder,
            exercises: '[]', // Пустой список упражнений
            isDone: false
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}