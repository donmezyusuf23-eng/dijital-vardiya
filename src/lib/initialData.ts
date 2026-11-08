import { DatabaseSchema, Staff, User, Shift, Feedback, AuditLog } from '@/types';

export const initialStaff: Staff[] = [
  { id: 'st-01', fullName: 'Ahmet Yılmaz', department: 'Mutfak', title: 'Baş Aşçı / Şef', phone: '05551000001', email: 'ahmet.yilmaz@vardiya.local', isActive: true },
  { id: 'st-02', fullName: 'Caner Şen', department: 'Mutfak', title: 'Sıcak Aşçısı', phone: '05551000002', email: 'caner.sen@vardiya.local', isActive: true },
  { id: 'st-03', fullName: 'Murat Arslan', department: 'Mutfak', title: 'Izgara Ustası', phone: '05551000003', email: 'murat.arslan@vardiya.local', isActive: true },
  { id: 'st-04', fullName: 'Emine Doğan', department: 'Mutfak', title: 'Soğuk Meze Şefi', phone: '05551000004', email: 'emine.dogan@vardiya.local', isActive: true },
  { id: 'st-05', fullName: 'Selin Koç', department: 'Mutfak', title: 'Tatlı / Pastane Ustası', phone: '05551000005', email: 'selin.koc@vardiya.local', isActive: true },
  { id: 'st-06', fullName: 'Burak Güneş', department: 'Mutfak', title: 'Aşçı Yardımcısı', phone: '05551000006', email: 'burak.gunes@vardiya.local', isActive: true },
  { id: 'st-07', fullName: 'Oğuzhan Çetin', department: 'Mutfak', title: 'Aşçı Yardımcısı', phone: '05551000007', email: 'oguzhan.cetin@vardiya.local', isActive: true },
  { id: 'st-08', fullName: 'Fatma Tekin', department: 'Mutfak', title: 'Hazırlık Elemanı', phone: '05551000008', email: 'fatma.tekin@vardiya.local', isActive: true },
  { id: 'st-09', fullName: 'Cem Aksoy', department: 'Mutfak', title: 'Bulaşıkhane Görevlisi', phone: '05551000009', email: 'cem.aksoy@vardiya.local', isActive: true },
  { id: 'st-10', fullName: 'Kemal Kurt', department: 'Mutfak', title: 'Depo ve Malzeme Sorumlusu', phone: '05551000010', email: 'kemal.kurt@vardiya.local', isActive: true },

  { id: 'st-11', fullName: 'Zeynep Kaya', department: 'Servis', title: 'Servis Şefi / Kaptan', phone: '05552000011', email: 'zeynep.kaya@vardiya.local', isActive: true },
  { id: 'st-12', fullName: 'Elif Çelik', department: 'Servis', title: 'Kıdemli Garson', phone: '05552000012', email: 'elif.celik@vardiya.local', isActive: true },
  { id: 'st-13', fullName: 'Kerem Yalçın', department: 'Servis', title: 'Garson', phone: '05552000013', email: 'kerem.yalcin@vardiya.local', isActive: true },
  { id: 'st-14', fullName: 'Büşra Aydın', department: 'Servis', title: 'Garson', phone: '05552000014', email: 'busra.aydin@vardiya.local', isActive: true },
  { id: 'st-15', fullName: 'Tolga Yıldız', department: 'Servis', title: 'Garson', phone: '05552000015', email: 'tolga.yildiz@vardiya.local', isActive: true },
  { id: 'st-16', fullName: 'Gizem Bulut', department: 'Servis', title: 'Hostes / Karşılama', phone: '05552000016', email: 'gizem.bulut@vardiya.local', isActive: true },
  { id: 'st-17', fullName: 'Serkan Öztürk', department: 'Servis', title: 'Barista', phone: '05552000017', email: 'serkan.ozturk@vardiya.local', isActive: true },
  { id: 'st-18', fullName: 'Merve Korkmaz', department: 'Servis', title: 'Barmen / Barmeyd', phone: '05552000018', email: 'merve.korkmaz@vardiya.local', isActive: true },
  { id: 'st-19', fullName: 'Deniz Polat', department: 'Servis', title: 'Komi', phone: '05552000019', email: 'deniz.polat@vardiya.local', isActive: true },
  { id: 'st-20', fullName: 'Ali Vural', department: 'Servis', title: 'Komi', phone: '05552000020', email: 'ali.vural@vardiya.local', isActive: true }
];

export const initialUsers: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    fullName: 'Burak Demir',
    email: 'admin@vardiya.local',
    role: 'admin'
  },
  {
    id: 'usr-sef-mutfak',
    username: 'sef.ahmet',
    fullName: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@vardiya.local',
    role: 'supervisor',
    department: 'Mutfak',
    staffId: 'st-01'
  },
  {
    id: 'usr-sef-servis',
    username: 'sef.zeynep',
    fullName: 'Zeynep Kaya',
    email: 'zeynep.kaya@vardiya.local',
    role: 'supervisor',
    department: 'Servis',
    staffId: 'st-11'
  },
  {
    id: 'usr-calisan-caner',
    username: 'caner.sen',
    fullName: 'Caner Şen',
    email: 'caner.sen@vardiya.local',
    role: 'employee',
    department: 'Mutfak',
    staffId: 'st-02'
  },
  {
    id: 'usr-calisan-elif',
    username: 'elif.celik',
    fullName: 'Elif Çelik',
    email: 'elif.celik@vardiya.local',
    role: 'employee',
    department: 'Servis',
    staffId: 'st-12'
  },
  {
    id: 'usr-calisan-kerem',
    username: 'kerem.yalcin',
    fullName: 'Kerem Yalçın',
    email: 'kerem.yalcin@vardiya.local',
    role: 'employee',
    department: 'Servis',
    staffId: 'st-13'
  }
];

export const generateInitialShifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const baseDate = new Date('2026-11-08');

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(baseDate);
    currentDay.setDate(baseDate.getDate() + i);
    const dateStr = currentDay.toISOString().split('T')[0];

    initialStaff.forEach((staff, index) => {
      if ((index + i) % 7 === 0) {
        return;
      }

      let startTime = '08:00';
      let endTime = '16:00';
      let type: 'Sabah' | 'Akşam' | 'Gece' = 'Sabah';

      if (index % 3 === 1) {
        startTime = '16:00';
        endTime = '24:00';
        type = 'Akşam';
      } else if (index % 3 === 2) {
        startTime = '00:00';
        endTime = '08:00';
        type = 'Gece';
      }

      shifts.push({
        id: `sh-${dateStr}-${staff.id}`,
        staffId: staff.id,
        staffName: staff.fullName,
        department: staff.department,
        date: dateStr,
        startTime,
        endTime,
        type,
        status: 'planlandi'
      });
    });
  }

  return shifts;
};

export const initialFeedbacks: Feedback[] = [
  {
    id: 'fb-01',
    shiftId: 'sh-2026-11-09-st-02',
    shiftDate: '2026-11-09',
    shiftTime: '16:00 - 24:00',
    staffId: 'st-02',
    staffName: 'Caner Şen',
    department: 'Mutfak',
    type: 'degisiklik_talebi',
    reason: 'Üniversite vize sınavım sebebiyle sabah vardiyasına geçmek istiyorum.',
    status: 'beklemede',
    createdAt: '2026-11-08 10:15'
  },
  {
    id: 'fb-02',
    shiftId: 'sh-2026-11-10-st-12',
    shiftDate: '2026-11-10',
    shiftTime: '16:00 - 24:00',
    staffId: 'st-12',
    staffName: 'Elif Çelik',
    department: 'Servis',
    type: 'izin_talebi',
    reason: 'Ailevi mazeret izni talep ediyorum.',
    status: 'beklemede',
    createdAt: '2026-11-08 11:30'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-01',
    shiftId: 'sh-2026-11-08-st-03',
    staffName: 'Murat Arslan',
    department: 'Mutfak',
    performedByUserId: 'usr-sef-mutfak',
    performedByUserName: 'Ahmet Yılmaz',
    performedByRole: 'supervisor',
    previousValue: '08:00 - 16:00 (Sabah)',
    newValue: '16:00 - 24:00 (Akşam)',
    reason: 'Akşam servis yoğunluğu nedeniyle takviye yapıldı.',
    timestamp: '2026-11-08 09:30:12'
  }
];

export const getInitialData = (): DatabaseSchema => ({
  users: initialUsers,
  staff: initialStaff,
  shifts: generateInitialShifts(),
  feedbacks: initialFeedbacks,
  auditLogs: initialAuditLogs
});
