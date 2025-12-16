import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, isTraining } = body;
    const uid = parseInt(userId);

    // 1. Если клиент "УШЕЛ" (isTraining = false) -> ЗАВЕРШАЕМ ТРЕНИРОВКУ
    if (!isTraining) {
        // Ищем активную тренировку
        const activeWorkout = await prisma.plannedWorkout.findFirst({
            where: { userId: uid, isDone: false },
            orderBy: { order: 'asc' }
        });

        if (activeWorkout) {
            // Сохраняем её в историю (лог)
            let exercises = [];
            try { exercises = JSON.parse(activeWorkout.exercises); } catch (e) {}

            // Превращаем план в факт для истории
            const logsToSend = exercises.map((ex: any) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                // Если есть реальные подходы - берем их, иначе просто план
                actualSets: (ex.actualReps && Array.isArray(ex.actualReps)) 
                    ? ex.actualReps.map((r: any) => ({ weight: ex.weight || '', reps: r })) 
                    : Array(parseInt(ex.sets)||1).fill({ weight: ex.weight || '', reps: ex.reps || '' })
            }));
            
            // Записываем в лог
            await prisma.workoutLog.create({
                data: {
                    userId: uid,
                    details: JSON.stringify(logsToSend),
                    date: new Date()
                }
            });

            // Помечаем план как выполненный
            await prisma.plannedWorkout.update({
                where: { id: activeWorkout.id },
                data: { isDone: true }
            });
        }
    }

    // 2. Если клиент "ПРИШЕЛ" (isTraining = true) -> НИЧЕГО ОСОБЕННОГО НЕ ДЕЛАЕМ
    // (Просто меняем статус, а тренировка подтянется сама, когда тренер в нее зайдет)
    // НО! Важно убедиться, что у него вообще есть план. Если нет - это задача тренера создать его.

    // 3. Обновляем статус самого юзера
    await prisma.user.update({
      where: { id: uid },
      data: { isTraining: isTraining }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка смены статуса:", error);
    return NextResponse.json({ error: 'Error updating status' }, { status: 500 });
  }
}