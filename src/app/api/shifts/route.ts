import { NextRequest, NextResponse } from 'next/server';
import { createShift, updateShiftWithAudit } from '@/lib/db';
import { Department, Role } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shiftData, actor } = body;

    if (!actor || !actor.id || !actor.role) {
      return NextResponse.json({ error: 'İşlemi gerçekleştiren kullanıcı bilgisi eksik.' }, { status: 401 });
    }

    const result = createShift(shiftData, actor);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ shift: result.shift });
  } catch {
    return NextResponse.json({ error: 'Vardiya oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { shiftId, updatedFields, reason, actor } = body as {
      shiftId: string;
      updatedFields: {
        startTime?: string;
        endTime?: string;
        type?: 'Sabah' | 'Akşam' | 'Gece' | 'Özel';
        status?: 'planlandi' | 'tamamlandi' | 'iptal';
        date?: string;
      };
      reason: string;
      actor: { id: string; fullName: string; role: Role; department?: Department };
    };

    if (!actor || !actor.id || !actor.role) {
      return NextResponse.json({ error: 'Yetkilendirme bilgisi eksik.' }, { status: 401 });
    }

    const result = updateShiftWithAudit(shiftId, updatedFields, reason, actor);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ shift: result.shift, log: result.log });
  } catch {
    return NextResponse.json({ error: 'Vardiya güncellenirken hata oluştu.' }, { status: 500 });
  }
}
