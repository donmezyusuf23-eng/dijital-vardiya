import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Role, Department } from '@/types';

export async function GET(request: NextRequest) {
  const db = getDb();
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get('role') as Role | null;
  const department = searchParams.get('department') as Department | null;
  const staffId = searchParams.get('staffId');

  let filteredShifts = [...db.shifts];
  let filteredFeedbacks = [...db.feedbacks];
  let filteredStaff = [...db.staff];
  let filteredLogs = [...db.auditLogs];

  if (role === 'employee' && staffId) {
    filteredShifts = filteredShifts.filter(s => s.staffId === staffId);
    filteredFeedbacks = filteredFeedbacks.filter(f => f.staffId === staffId);
  } else if (role === 'supervisor' && department) {
    filteredShifts = filteredShifts.filter(s => s.department === department);
    filteredFeedbacks = filteredFeedbacks.filter(f => f.department === department);
    filteredStaff = filteredStaff.filter(st => st.department === department);
    filteredLogs = filteredLogs.filter(l => l.department === department);
  }

  return NextResponse.json({
    users: db.users,
    staff: filteredStaff,
    shifts: filteredShifts,
    feedbacks: filteredFeedbacks,
    auditLogs: filteredLogs
  });
}
