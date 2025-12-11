import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { id } = await request.json();
  await prisma.plannedWorkout.delete({
    where: { id: parseInt(id) }
  });
  return NextResponse.json({ success: true });
}