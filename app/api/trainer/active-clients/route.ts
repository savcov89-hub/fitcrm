import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Ищем всех клиентов, у которых isTraining = true
    const activeClients = await prisma.user.findMany({
      where: {
        role: 'client',
        isTraining: true
      },
      select: {
        id: true,
        name: true
      }
    });

    return NextResponse.json(activeClients);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching active clients' }, { status: 500 });
  }
}