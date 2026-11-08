import { NextRequest, NextResponse } from 'next/server';
import { createFeedback, resolveFeedback } from '@/lib/db';
import { Department, Role } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackData } = body;

    if (!feedbackData || !feedbackData.reason || !feedbackData.staffId) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik.' }, { status: 400 });
    }

    const result = createFeedback(feedbackData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ feedback: result.feedback });
  } catch {
    return NextResponse.json({ error: 'Geri bildirim gönderilirken hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, newStatus, resolutionNote, actor } = body as {
      feedbackId: string;
      newStatus: 'onaylandi' | 'reddedildi';
      resolutionNote: string;
      actor: { id: string; fullName: string; role: Role; department?: Department };
    };

    if (!actor || !actor.id) {
      return NextResponse.json({ error: 'Yetkilendirme bilgisi eksik.' }, { status: 401 });
    }

    const result = resolveFeedback(feedbackId, newStatus, resolutionNote || '', actor);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ feedback: result.feedback });
  } catch {
    return NextResponse.json({ error: 'Talep durumu güncellenirken hata oluştu.' }, { status: 500 });
  }
}
