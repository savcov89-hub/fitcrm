import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();
    const uid = parseInt(clientId);

    // Удаляем только те, что НЕ выполнены (isDone: false)
    // История (Архив) останется нетронутой.
    await prisma.plannedWorkout.deleteMany({
      where: { 
          userId: uid,
          isDone: false 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка очистки плана:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}