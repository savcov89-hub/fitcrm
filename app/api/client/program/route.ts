import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) return NextResponse.json(null);
    const uid = parseInt(userId);

    // 1. Ищем активную (невыполненную) тренировку
    const activePlan = await prisma.plannedWorkout.findFirst({
      where: {
        userId: uid,
        isDone: false
      },
      orderBy: { order: 'asc' } // Берем самую первую в списке
    });

    // 2. Ищем самого клиента, чтобы получить его ИМЯ
    const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { name: true } // Нам нужно только имя
    });

    // Если тренировки нет, но юзер есть - возвращаем хотя бы имя (чтобы шапка не была пустой)
    if (!activePlan) {
        return NextResponse.json({
            clientName: user ? user.name : ''
        });
    }

    // 3. Возвращаем данные тренировки + Имя клиента одной пачкой
    return NextResponse.json({
      ...activePlan,
      clientName: user ? user.name : 'Неизвестный'
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}