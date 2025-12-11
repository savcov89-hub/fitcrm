import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId, isActive } = await request.json();

  const user = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { isActive: isActive },
  });

  return NextResponse.json(user);
}