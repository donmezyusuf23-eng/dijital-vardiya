'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Staff, Shift, Feedback, AuditLog } from '@/types';
import { Navbar } from '@/components/Navbar';
import { ShiftTable } from '@/components/ShiftTable';
import { ShiftEditModal } from '@/components/ShiftEditModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { FeedbackList } from '@/components/FeedbackList';
import { AuditLogView } from '@/components/AuditLogView';
import { StaffList } from '@/components/StaffList';
import { AddShiftModal } from '@/components/AddShiftModal';
import { ImportModal } from '@/components/ImportModal';
import {
  CalendarDays,
  MessageSquare,
  History,
  Users,
  Upload,
  CheckCircle,
  AlertTriangle,
  Building,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'shifts' | 'feedbacks' | 'audit' | 'staff'>('shifts');

  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [feedbackShift, setFeedbackShift] = useState<Shift | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = useCallback(async (activeUser?: User | null) => {
    try {
      const userToUse = activeUser || currentUser;
      let url = '/api/data';
      if (userToUse) {
        const params = new URLSearchParams();
        params.append('role', userToUse.role);
        if (userToUse.department) params.append('department', userToUse.department);
        if (userToUse.staffId) params.append('staffId', userToUse.staffId);
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setUsers(data.users || []);
      setStaff(data.staff || []);
      setShifts(data.shifts || []);
      setFeedbacks(data.feedbacks || []);
      setAuditLogs(data.auditLogs || []);

      if (!currentUser && data.users && data.users.length > 0) {
        setCurrentUser(data.users[0]);
      }
    } catch {
      showToast('Veriler yüklenirken bir bağlantı hatası oluştu.', 'error');
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    loadData(user);
    showToast(`Oturum "${user.fullName}" (${user.role.toUpperCase()}) olarak değiştirildi.`);
  };

  const handleResetData = async () => {
    if (!confirm('Tüm test verileri başlangıç durumuna (20 personel, 2 şef, 1 admin ve haftalık plan) sıfırlansın mı?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await loadData(currentUser);
        showToast('Veritabanı başlangıç test verilerine başarıyla sıfırlandı.');
      } else {
        showToast('Sıfırlama işlemi başarısız oldu.', 'error');
      }
    } catch {
      showToast('Sıfırlama sırasında hata oluştu.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveShiftEdit = async (
    shiftId: string,
    updatedFields: Partial<Shift>,
    reason: string
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          updatedFields,
          reason,
          actor: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            role: currentUser.role,
            department: currentUser.department
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Vardiya güncellenemedi.', 'error');
        return false;
      }

      await loadData(currentUser);
      showToast('Vardiya güncellendi ve değişiklik gerekçesi denetim izine kaydedildi.');
      return true;
    } catch {
      showToast('Sunucu hatası.', 'error');
      return false;
    }
  };

  const handleAddNewShift = async (newShiftData: Omit<Shift, 'id'>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftData: newShiftData,
          actor: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            role: currentUser.role,
            department: currentUser.department
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Vardiya eklenemedi.', 'error');
        return false;
      }

      await loadData(currentUser);
      showToast('Yeni vardiya başarıyla planlandı.');
      return true;
    } catch {
      showToast('Sunucu hatası.', 'error');
      return false;
    }
  };

  const handleSendFeedback = async (data: {
    shiftId: string;
    shiftDate: string;
    shiftTime: string;
    staffId: string;
    staffName: string;
    department: Shift['department'];
    type: 'degisiklik_talebi' | 'izin_talebi' | 'itiraz' | 'bilgi';
    reason: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackData: data })
      });

      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Geri bildirim gönderilemedi.', 'error');
        return false;
      }

      await loadData(currentUser);
      showToast('Vardiya değişiklik talebiniz birim şefinize iletildi.');
      return true;
    } catch {
      showToast('Bağlantı hatası.', 'error');
      return false;
    }
  };

  const handleResolveFeedback = async (
    feedbackId: string,
    status: 'onaylandi' | 'reddedildi',
    note: string
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          newStatus: status,
          resolutionNote: note,
          actor: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            role: currentUser.role,
            department: currentUser.department
          }
        })
      });

      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Talep sonuçlandırılamadı.', 'error');
        return false;
      }

      await loadData(currentUser);
      showToast(`Talep başarıyla ${status === 'onaylandi' ? 'onaylandı' : 'reddedildi'}.`);
      return true;
    } catch {
      showToast('Sunucu hatası.', 'error');
      return false;
    }
  };

  const handleBulkImport = async (importedShifts: Omit<Shift, 'id'>[]): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/shifts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shifts: importedShifts,
          actor: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            role: currentUser.role,
            department: currentUser.department
          }
        })
      });

      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'İçe aktarım başarısız.', 'error');
        return false;
      }

      await loadData(currentUser);
      showToast(`${result.count} adet vardiya aktarıldı ve denetim kütüğüne işlendi.`);
      return true;
    } catch {
      showToast('Hata oluştu.', 'error');
      return false;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="animate-spin text-blue-600">
          <Clock className="w-8 h-8" />
        </div>
      </div>
    );
  }

  const pendingFeedbackCount = feedbacks.filter(f => f.status === 'beklemede').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Toplam Vardiya</span>
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{shifts.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Haftalık aktif planlama</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Kadro Büyüklüğü</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{staff.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">2 Birim (Mutfak, Servis)</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Bekleyen Talepler</span>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{pendingFeedbackCount}</span>
              {pendingFeedbackCount > 0 && (
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Aksiyon Bekliyor
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Çalışan bildirimleri</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Denetim İzi Kaydı</span>
              <History className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{auditLogs.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Gerekçeli değişiklik kütüğü</div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'shifts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Vardiya Çizelgesi</span>
            </button>

            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer relative ${
                activeTab === 'feedbacks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Geri Bildirimler & Talepler</span>
              {pendingFeedbackCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'feedbacks' ? 'bg-white text-blue-700' : 'bg-amber-500 text-white'
                }`}>
                  {pendingFeedbackCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Değişiklik Geçmişi (Denetim İzi)</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Personel Kadrosu</span>
            </button>
          </div>

          {currentUser.role !== 'employee' && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Excel / CSV İçe Aktar</span>
            </button>
          )}
        </div>

        {activeTab === 'shifts' && (
          <ShiftTable
            shifts={shifts}
            staff={staff}
            currentUser={currentUser}
            onEditShift={(s) => setEditingShift(s)}
            onRequestFeedback={(s) => setFeedbackShift(s)}
            onAddNewShift={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'feedbacks' && (
          <FeedbackList
            feedbacks={feedbacks}
            currentUser={currentUser}
            onResolve={handleResolveFeedback}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView
            logs={auditLogs}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'staff' && (
          <StaffList
            staff={staff}
            currentUser={currentUser}
          />
        )}
      </main>

      {editingShift && (
        <ShiftEditModal
          shift={editingShift}
          currentUser={currentUser}
          onClose={() => setEditingShift(null)}
          onSave={handleSaveShiftEdit}
        />
      )}

      {feedbackShift && (
        <FeedbackModal
          shift={feedbackShift}
          currentUser={currentUser}
          onClose={() => setFeedbackShift(null)}
          onSubmit={handleSendFeedback}
        />
      )}

      {isAddModalOpen && (
        <AddShiftModal
          staffList={staff}
          currentUser={currentUser}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddNewShift}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          currentUser={currentUser}
          staffList={staff}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleBulkImport}
        />
      )}
    </div>
  );
}
