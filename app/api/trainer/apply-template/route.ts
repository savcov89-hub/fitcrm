import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { WORKOUT_LIBRARY } from '../../../data/workout-templates';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clientId, templateId, weeks } = await request.json();
    const uid = parseInt(clientId);
    const duration = parseInt(weeks) || 4;

    let workoutsToCopy: any[] = [];

    // 1. Сначала ищем в СТАНДАРТНОЙ библиотеке (по ID-строке)
    const libTemplate = WORKOUT_LIBRARY.find(t => t.id === templateId);
    
    if (libTemplate) {
        workoutsToCopy = libTemplate.workouts;
    } else {
        // 2. Если не нашли, ищем в ЛИЧНЫХ шаблонах (в базе данных)
        // (ID в базе это число, поэтому пробуем парсить)
        const dbId = parseInt(templateId);
        if (!isNaN(dbId)) {
            const dbTemplate = await prisma.template.findUnique({ where: { id: dbId } });
            if (dbTemplate) {
                workoutsToCopy = JSON.parse(dbTemplate.workouts);
            }
        }
    }

    if (workoutsToCopy.length === 0) {
        return NextResponse.json({ error: 'Шаблон не найден' }, { status: 404 });
    }

    // 3. Очищаем старый план и создаем новый цикл
    await prisma.plannedWorkout.deleteMany({
      where: { userId: uid, isDone: false }
    });

    const newWorkouts = [];
    let orderCounter = 1;

    for (let week = 1; week <= duration; week++) {
        for (const workout of workoutsToCopy) {
            newWorkouts.push({
                userId: uid,
                name: `Неделя ${week}: ${workout.name}`,
                order: orderCounter++,
                exercises: JSON.stringify(workout.exercises),
                isDone: false
            });
        }
    }

    await prisma.plannedWorkout.createMany({ data: newWorkouts });
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("ОШИБКА apply-template:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}