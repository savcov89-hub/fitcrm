import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clientId, name } = await request.json();
    
    // 1. Берем текущий план клиента
    const plan = await prisma.plannedWorkout.findMany({
        where: { userId: parseInt(clientId), isDone: false },
        orderBy: { order: 'asc' }
    });

    if (plan.length === 0) return NextResponse.json({ error: 'План пуст' }, { status: 400 });

    // 2. Упаковываем тренировки в красивый формат для хранения
    const templateData = plan.map(p => ({
        name: p.name,
        exercises: JSON.parse(p.exercises)
    }));

    // 3. Сохраняем в таблицу шаблонов
    await prisma.template.create({
        data: {
            name: name,
            workouts: JSON.stringify(templateData)
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}