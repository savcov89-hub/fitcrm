import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clientId, name, exercises } = await request.json();
    const uid = parseInt(clientId);

    // 1. Узнаем, какой сейчас последний номер по порядку, чтобы встать в конец очереди
    const lastWorkout = await prisma.plannedWorkout.findFirst({
        where: { userId: uid },
        orderBy: { order: 'desc' }
    });
    const nextOrder = (lastWorkout?.order || 0) + 1;

    // 2. Создаем тренировку
    // Если exercises пришел как объект (массив), превращаем в строку. Если уже строка - оставляем.
    const exercisesString = typeof exercises === 'string' ? exercises : JSON.stringify(exercises);

    const newWorkout = await prisma.plannedWorkout.create({
        data: {
            userId: uid,
            name: name,
            exercises: exercisesString,
            order: nextOrder,
            isDone: false
        }
    });

    return NextResponse.json({ success: true, workout: newWorkout });
  } catch (error) {
    console.error("Ошибка назначения:", error);
    return NextResponse.json({ error: 'Не удалось назначить программу' }, { status: 500 });
  }
}