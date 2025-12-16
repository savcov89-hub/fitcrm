import { NextResponse, NextRequest } from 'next/server'; // Добавили NextRequest
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. Получаем ID тренера из адреса запроса (например ?id=5)
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get('id');

    if (!trainerId) {
        return NextResponse.json([]); // Если ID не передали — список пуст
    }

    // 2. Ищем клиентов, которые привязаны ИМЕННО К ЭТОМУ тренеру
    const clients = await prisma.user.findMany({
      where: { 
        role: 'client',
        trainerId: parseInt(trainerId) // <--- ВОТ ГЛАВНЫЙ ФИЛЬТР
      },
      select: {
          id: true,
          name: true,
          isTraining: true,
          // Можем добавить фото или email, если нужно
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}