import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'trainer' },
      select: { id: true, name: true }
    });
    return NextResponse.json(trainers);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}