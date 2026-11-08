'use client';

import React, { useState } from 'react';
import { Shift, User } from '@/types';
import { X, Send, MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  shift: Shift;
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: {
    shiftId: string;
    shiftDate: string;
    shiftTime: string;
    staffId: string;
    staffName: string;
    department: Shift['department'];
    type: 'degisiklik_talebi' | 'izin_talebi' | 'itiraz' | 'bilgi';
    reason: string;
  }) => Promise<boolean>;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  shift,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [type, setType] = useState<'degisiklik_talebi' | 'izin_talebi' | 'itiraz' | 'bilgi'>('degisiklik_talebi');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMessage('Lütfen talebinizi açıklayan en az 5 karakterlik bir gerekçe belirtiniz.');
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      shiftId: shift.id,
      shiftDate: shift.date,
      shiftTime: `${shift.startTime} - ${shift.endTime}`,
      staffId: shift.staffId,
      staffName: shift.staffName,
      department: shift.department,
      type,
      reason: reason.trim()
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Vardiya Geri Bildirim & Değişiklik Talebi</h3>
              <p className="text-xs text-slate-500">Talebiniz birim şefinize ve yöneticiye iletilecektir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">İlgili Personel:</span>
              <span className="font-semibold text-slate-800">{shift.staffName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Birim:</span>
              <span className="font-semibold text-slate-800">{shift.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vardiya Tarih & Saat:</span>
              <span className="font-medium text-slate-800">{shift.date} | {shift.startTime} - {shift.endTime} ({shift.type})</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Talep Türü</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="degisiklik_talebi">Vardiya Saat/Gün Değişikliği Talebi</option>
              <option value="izin_talebi">Mazeret / İzin Talebi</option>
              <option value="itiraz">Hatalı Çizelge İtirazı</option>
              <option value="bilgi">Bilgilendirme / Not</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gerekçe ve Açıklama <span className="text-red-500 font-bold">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Talep gerekçenizi ve tercih ettiğiniz alternatif saati detaylıca yazınız..."
              rows={4}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Gönderiliyor...' : 'Talebi İlet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
