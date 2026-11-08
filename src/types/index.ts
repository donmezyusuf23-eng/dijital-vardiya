export type Role = 'admin' | 'supervisor' | 'employee';

export type Department = 'Mutfak' | 'Servis' | 'Ön Büro' | 'Teknik';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  department?: Department;
  staffId?: string;
}

export interface Staff {
  id: string;
  fullName: string;
  department: Department;
  title: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  date: string;
  startTime: string;
  endTime: string;
  type: 'Sabah' | 'Akşam' | 'Gece' | 'Özel';
  status: 'planlandi' | 'tamamlandi' | 'iptal';
  notes?: string;
}

export interface Feedback {
  id: string;
  shiftId: string;
  shiftDate: string;
  shiftTime: string;
  staffId: string;
  staffName: string;
  department: Department;
  type: 'degisiklik_talebi' | 'izin_talebi' | 'itiraz' | 'bilgi';
  reason: string;
  status: 'beklemede' | 'onaylandi' | 'reddedildi';
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface AuditLog {
  id: string;
  shiftId: string;
  staffName: string;
  department: Department;
  performedByUserId: string;
  performedByUserName: string;
  performedByRole: Role;
  previousValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  staff: Staff[];
  shifts: Shift[];
  feedbacks: Feedback[];
  auditLogs: AuditLog[];
}
