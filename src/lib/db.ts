import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Shift, Feedback, AuditLog, User, Staff, Role, Department } from '@/types';
import { getInitialData } from './initialData';

const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'store.json');

const ensureDbExists = (): DatabaseSchema => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbFilePath)) {
    const defaultData = getInitialData();
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    const defaultData = getInitialData();
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
};

const saveDb = (data: DatabaseSchema): void => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const getDb = (): DatabaseSchema => {
  return ensureDbExists();
};

export const resetDb = (): DatabaseSchema => {
  const initialData = getInitialData();
  saveDb(initialData);
  return initialData;
};

export const findUserById = (userId: string): User | undefined => {
  const db = ensureDbExists();
  return db.users.find(u => u.id === userId);
};

export const updateShiftWithAudit = (
  shiftId: string,
  updatedFields: Partial<Pick<Shift, 'startTime' | 'endTime' | 'type' | 'status' | 'date'>>,
  reason: string,
  actor: { id: string; fullName: string; role: Role; department?: Department }
): { success: boolean; error?: string; shift?: Shift; log?: AuditLog } => {
  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'Değişiklik gerekçesi en az 5 karakter olmalıdır.' };
  }

  const db = ensureDbExists();
  const shiftIndex = db.shifts.findIndex(s => s.id === shiftId);

  if (shiftIndex === -1) {
    return { success: false, error: 'Vardiya bulunamadı.' };
  }

  const currentShift = db.shifts[shiftIndex];

  if (actor.role === 'employee') {
    return { success: false, error: 'Çalışanların vardiya değiştirme yetkisi bulunmamaktadır.' };
  }

  if (actor.role === 'supervisor' && actor.department !== currentShift.department) {
    return {
      success: false,
      error: `Yetki hatası: ${actor.department} şefi yalnızca kendi biriminin vardiyalarını güncelleyebilir.`
    };
  }

  const previousValue = `${currentShift.date} [${currentShift.startTime} - ${currentShift.endTime}] (${currentShift.type}) - Durum: ${currentShift.status}`;

  const updatedShift: Shift = {
    ...currentShift,
    ...updatedFields
  };

  const newValue = `${updatedShift.date} [${updatedShift.startTime} - ${updatedShift.endTime}] (${updatedShift.type}) - Durum: ${updatedShift.status}`;

  const now = new Date();
  const timestampStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    shiftId: currentShift.id,
    staffName: currentShift.staffName,
    department: currentShift.department,
    performedByUserId: actor.id,
    performedByUserName: actor.fullName,
    performedByRole: actor.role,
    previousValue,
    newValue,
    reason: reason.trim(),
    timestamp: timestampStr
  };

  db.shifts[shiftIndex] = updatedShift;
  db.auditLogs.unshift(newLog);

  saveDb(db);

  return { success: true, shift: updatedShift, log: newLog };
};

export const createShift = (
  newShiftData: Omit<Shift, 'id'>,
  actor: { id: string; fullName: string; role: Role; department?: Department }
): { success: boolean; error?: string; shift?: Shift } => {
  if (actor.role === 'employee') {
    return { success: false, error: 'Çalışanların yeni vardiya ekleme yetkisi yoktur.' };
  }

  if (actor.role === 'supervisor' && actor.department !== newShiftData.department) {
    return {
      success: false,
      error: `Yetki hatası: Yalnızca ${actor.department} birimine ait vardiya oluşturabilirsiniz.`
    };
  }

  const db = ensureDbExists();
  const id = `sh-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const created: Shift = { ...newShiftData, id };

  db.shifts.push(created);

  const now = new Date();
  const timestampStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    shiftId: created.id,
    staffName: created.staffName,
    department: created.department,
    performedByUserId: actor.id,
    performedByUserName: actor.fullName,
    performedByRole: actor.role,
    previousValue: 'Yok (Yeni Planlama)',
    newValue: `${created.date} [${created.startTime} - ${created.endTime}] (${created.type})`,
    reason: 'İlk vardiya planlaması oluşturuldu.',
    timestamp: timestampStr
  });

  saveDb(db);

  return { success: true, shift: created };
};

export const createFeedback = (
  feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'status'>
): { success: boolean; error?: string; feedback?: Feedback } => {
  const db = ensureDbExists();
  const now = new Date();
  const createdAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  const created: Feedback = {
    ...feedbackData,
    id: `fb-${Date.now()}`,
    status: 'beklemede',
    createdAt
  };

  db.feedbacks.unshift(created);
  saveDb(db);

  return { success: true, feedback: created };
};

export const resolveFeedback = (
  feedbackId: string,
  newStatus: 'onaylandi' | 'reddedildi',
  resolutionNote: string,
  actor: { id: string; fullName: string; role: Role; department?: Department }
): { success: boolean; error?: string; feedback?: Feedback } => {
  if (actor.role === 'employee') {
    return { success: false, error: 'Çalışanlar geri bildirim değerlendiremez.' };
  }

  const db = ensureDbExists();
  const fbIndex = db.feedbacks.findIndex(f => f.id === feedbackId);

  if (fbIndex === -1) {
    return { success: false, error: 'Talebi bulunamadı.' };
  }

  const feedback = db.feedbacks[fbIndex];

  if (actor.role === 'supervisor' && actor.department !== feedback.department) {
    return {
      success: false,
      error: `Yetki hatası: ${actor.department} şefi yalnızca kendi biriminin taleplerini yönetebilir.`
    };
  }

  const now = new Date();
  const resolvedAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  feedback.status = newStatus;
  feedback.resolvedBy = actor.fullName;
  feedback.resolvedAt = resolvedAt;
  feedback.resolutionNote = resolutionNote;

  saveDb(db);

  return { success: true, feedback };
};

export const bulkImportShifts = (
  shifts: Omit<Shift, 'id'>[],
  actor: { id: string; fullName: string; role: Role; department?: Department }
): { success: boolean; count: number; error?: string } => {
  if (actor.role === 'employee') {
    return { success: false, count: 0, error: 'Yetkisiz işlem.' };
  }

  const db = ensureDbExists();
  let addedCount = 0;

  shifts.forEach(s => {
    if (actor.role === 'supervisor' && actor.department !== s.department) {
      return;
    }
    db.shifts.push({
      ...s,
      id: `sh-imp-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    });
    addedCount++;
  });

  const now = new Date();
  const timestampStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    shiftId: 'toplu-aktarim',
    staffName: 'Toplu Aktarım',
    department: actor.department || 'Mutfak',
    performedByUserId: actor.id,
    performedByUserName: actor.fullName,
    performedByRole: actor.role,
    previousValue: '-',
    newValue: `${addedCount} adet vardiya içeri aktarıldı`,
    reason: 'Toplu veri çizelgesi sisteme aktarıldı.',
    timestamp: timestampStr
  });

  saveDb(db);

  return { success: true, count: addedCount };
};
