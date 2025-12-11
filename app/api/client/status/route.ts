import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId, isTraining } = await request.json();

  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { isTraining: isTraining }
  });

  return NextResponse.json({ success: true });
}