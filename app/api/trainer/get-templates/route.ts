import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(templates);
}