import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, name, exercises } = await request.json();
    
    // Подготовим объект для обновления
    const dataToUpdate: any = { name };
    // Если прислали новый список упражнений - обновляем и его
    if (exercises) {
        dataToUpdate.exercises = exercises;
    }

    await prisma.plannedWorkout.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}