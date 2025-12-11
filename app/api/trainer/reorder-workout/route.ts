import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, direction } = await request.json(); // direction: 'up' или 'down'
    const workoutId = parseInt(id);

    // 1. Находим тренировку, которую двигаем
    const target = await prisma.plannedWorkout.findUnique({ where: { id: workoutId } });
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Находим соседа (сверху или снизу)
    const operator = direction === 'up' ? 'lt' : 'gt'; // lt = меньше (выше), gt = больше (ниже)
    const orderDir = direction === 'up' ? 'desc' : 'asc'; // Сортируем, чтобы найти БЛИЖАЙШЕГО

    const neighbor = await prisma.plannedWorkout.findFirst({
        where: {
            userId: target.userId,
            isDone: false,
            order: { [operator]: target.order }
        },
        orderBy: { order: orderDir }
    });

    // 3. Если сосед есть — меняемся с ним местами (номерами order)
    if (neighbor) {
        const tempOrder = target.order;
        
        // Используем транзакцию, чтобы поменять их одновременно
        await prisma.$transaction([
            prisma.plannedWorkout.update({
                where: { id: target.id },
                data: { order: neighbor.order }
            }),
            prisma.plannedWorkout.update({
                where: { id: neighbor.id },
                data: { order: tempOrder }
            })
        ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}