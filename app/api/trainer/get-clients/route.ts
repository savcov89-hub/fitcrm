import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Получаем всех пользователей с ролью 'client'
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: {
          id: true,
          name: true,
          isTraining: true
          // Можем добавить подсчет тренировок, если нужно, но пока просто список
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}