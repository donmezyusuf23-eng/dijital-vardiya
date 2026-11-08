import { NextResponse } from 'next/server';
import { resetDb } from '@/lib/db';

export async function POST() {
  const freshData = resetDb();
  return NextResponse.json({
    message: 'Veritabanı başlangıç test verilerine başarıyla sıfırlandı.',
    data: freshData
  });
}
