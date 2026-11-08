'use client';

import React, { useState } from 'react';
import { Feedback, User } from '@/types';
import { CheckCircle2, XCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';

interface FeedbackListProps {
  feedbacks: Feedback[];
  currentUser: User;
  onResolve: (feedbackId: string, status: 'onaylandi' | 'reddedildi', note: string) => Promise<boolean>;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbacks,
  currentUser,
  onResolve
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedFb, setSelectedFb] = useState<Feedback | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filterStatus !== 'ALL' && fb.status !== filterStatus) return false;
    if (currentUser.role === 'employee' && currentUser.staffId) {
      return fb.staffId === currentUser.staffId;
    }
    if (currentUser.role === 'supervisor' && currentUser.department) {
      return fb.department === currentUser.department;
    }
    return true;
  });

  const getStatusBadge = (status: Feedback['status']) => {
    switch (status) {
      case 'onaylandi':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Onaylandı</span>;
      case 'reddedildi':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Reddedildi</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Beklemede</span>;
    }
  };

  const getTypeLabel = (type: Feedback['type']) => {
    switch (type) {
      case 'degisiklik_talebi':
        return 'Vardiya Değişiklik Talebi';
      case 'izin_talebi':
        return 'Mazeret / İzin Talebi';
      case 'itiraz':
        return 'Çizelge İtirazı';
      default:
        return 'Bilgilendirme';
    }
  };

  const handleResolveAction = async (status: 'onaylandi' | 'reddedildi') => {
    if (!selectedFb) return;
    setIsSubmitting(true);
    const success = await onResolve(selectedFb.id, status, resolutionNote);
    setIsSubmitting(false);
    if (success) {
      setSelectedFb(null);
      setResolutionNote('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Vardiya Geri Bildirim ve Değişiklik Talepleri</h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'employee'
              ? 'Gönderdiğiniz tüm talepler ve yöneticilerin yanıtları'
              : 'Çalışanlardan gelen vardiya değişim, itiraz ve mazeret bildirimleri'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="beklemede">Beklemede Olanlar</option>
            <option value="onaylandi">Onaylananlar</option>
            <option value="reddedildi">Reddedilenler</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Kayıtlı talep veya geri bildirim bulunmuyor.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFeedbacks.map(fb => (
              <div key={fb.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{fb.staffName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs border border-slate-200 font-medium">
                        {fb.department}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {getTypeLabel(fb.type)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      İlgili Vardiya: <strong>{fb.shiftDate} ({fb.shiftTime})</strong> • Gönderim Tarihi: {fb.createdAt}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(fb.status)}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-1">Çalışanın Açıklaması:</span>
                  {fb.reason}
                </div>

                {fb.resolvedBy && (
                  <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                    <div className="font-semibold flex items-center justify-between">
                      <span>Değerlendiren: {fb.resolvedBy}</span>
                      <span className="text-[11px] text-emerald-700">{fb.resolvedAt}</span>
                    </div>
                    {fb.resolutionNote && (
                      <p className="text-emerald-800 mt-1">Not: {fb.resolutionNote}</p>
                    )}
                  </div>
                )}

                {currentUser.role !== 'employee' && fb.status === 'beklemede' && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => setSelectedFb(fb)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-2xs cursor-pointer"
                    >
                      Talebi Değerlendir (Onayla / Reddet)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedFb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Talebi Sonuçlandır</h3>
            <p className="text-xs text-slate-600">
              <strong>{selectedFb.staffName}</strong> tarafından iletilen {selectedFb.shiftDate} tarihli vardiya talebini onaylamak veya reddetmek üzeresiniz.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yönetici Notu (Çalışan tarafından görüntülenecektir)
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Örn: Talep incelendi, ilgili gün sabah vardiyasına aktarılmıştır."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedFb(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Kapat
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleResolveAction('reddedildi')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                Reddet
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleResolveAction('onaylandi')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
