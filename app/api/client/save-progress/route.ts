import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plannedId, exercises } = body;

    if (!plannedId) {
        return NextResponse.json({ error: 'No plannedId' }, { status: 400 });
    }

    // Обновляем JSON с упражнениями в базе "на лету"
    await prisma.plannedWorkout.update({
        where: { id: parseInt(plannedId) },
        data: {
            exercises: JSON.stringify(exercises)
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка авто-сохранения:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}