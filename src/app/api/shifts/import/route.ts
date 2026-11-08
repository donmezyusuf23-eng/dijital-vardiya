import { NextRequest, NextResponse } from 'next/server';
import { bulkImportShifts } from '@/lib/db';
import { Department, Role, Shift } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shifts, actor } = body as {
      shifts: Omit<Shift, 'id'>[];
      actor: { id: string; fullName: string; role: Role; department?: Department };
    };

    if (!actor || !actor.id) {
      return NextResponse.json({ error: 'Yetkilendirme bilgisi eksik.' }, { status: 401 });
    }

    if (!Array.isArray(shifts) || shifts.length === 0) {
      return NextResponse.json({ error: 'İçe aktarılacak vardiya verisi bulunamadı.' }, { status: 400 });
    }

    const result = bulkImportShifts(shifts, actor);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ count: result.count, success: true });
  } catch {
    return NextResponse.json({ error: 'İçe aktarım sırasında hata oluştu.' }, { status: 500 });
  }
}
