import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { clientId } = await request.json();

  // Достаем историю, сортируем: новые сверху (desc)
  const logs = await prisma.workoutLog.findMany({
    where: { userId: parseInt(clientId) },
    orderBy: { date: 'desc' }
  });

  return NextResponse.json(logs);
}