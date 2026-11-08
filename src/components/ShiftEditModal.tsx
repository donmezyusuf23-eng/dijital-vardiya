'use client';

import React, { useState } from 'react';
import { Shift, User } from '@/types';
import { X, Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface ShiftEditModalProps {
  shift: Shift;
  currentUser: User;
  onClose: () => void;
  onSave: (shiftId: string, updatedFields: Partial<Shift>, reason: string) => Promise<boolean>;
}

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
  shift,
  currentUser,
  onClose,
  onSave
}) => {
  const [startTime, setStartTime] = useState(shift.startTime);
  const [endTime, setEndTime] = useState(shift.endTime);
  const [type, setType] = useState<Shift['type']>(shift.type);
  const [status, setStatus] = useState<Shift['status']>(shift.status);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSupervisorOfAnotherDept =
    currentUser.role === 'supervisor' && currentUser.department !== shift.department;

  const isEmployee = currentUser.role === 'employee';

  const handlePresetSelect = (presetType: 'Sabah' | 'Akşam' | 'Gece') => {
    setType(presetType);
    if (presetType === 'Sabah') {
      setStartTime('08:00');
      setEndTime('16:00');
    } else if (presetType === 'Akşam') {
      setStartTime('16:00');
      setEndTime('24:00');
    } else if (presetType === 'Gece') {
      setStartTime('00:00');
      setEndTime('08:00');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isEmployee) {
      setErrorMessage('Çalışanların doğrudan vardiya değiştirme yetkisi yoktur. Lütfen Geri Bildirim / Değişiklik Talebi oluşturunuz.');
      return;
    }

    if (isSupervisorOfAnotherDept) {
      setErrorMessage(`Yetki Sınırı: ${currentUser.department} birimi şefi olarak ${shift.department} birimi vardiyasını değiştiremezsiniz.`);
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMessage('Değişiklik gerekçesi zorunludur ve en az 5 karakter içermelidir.');
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(
      shift.id,
      { startTime, endTime, type, status },
      reason.trim()
    );
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Vardiya Düzenleme ve Değişiklik Kaydı</h3>
            <p className="text-xs text-slate-500">Denetim izi için zorunlu gerekçe kaydı oluşturulacaktır</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSupervisorOfAnotherDept && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Yetkisiz İşlem Engellendi</p>
                <p className="mt-0.5 text-rose-700">
                  Siz <strong>{currentUser.department}</strong> birimi sorumlususunuz. Bu vardiya ise <strong>{shift.department}</strong> birimine aittir. Yalnızca sorumlu olduğunuz birimde değişiklik yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {isEmployee && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Çalışan Yetki Kısıtlaması</p>
                <p className="mt-0.5 text-amber-700">
                  Çalışan rolündeki kullanıcılar vardiya saatlerini doğrudan düzenleyemez. Lütfen mazeret veya takas talebinizi &quot;Talep Gönder&quot; butonuyla iletiniz.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block">Personel:</span>
              <span className="font-semibold text-slate-800 text-sm">{shift.staffName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Birim:</span>
              <span className="inline-block px-2 py-0.5 font-semibold rounded-md bg-white border border-slate-200 text-slate-700">
                {shift.department}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Tarih:</span>
              <span className="font-medium text-slate-700">{shift.date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Mevcut Saat:</span>
              <span className="font-medium text-slate-700">{shift.startTime} - {shift.endTime}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hızlı Vardiya Şablonu</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('Sabah')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                  type === 'Sabah' ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Sabah (08-16)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('Akşam')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                  type === 'Akşam' ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Akşam (16-24)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('Gece')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                  type === 'Gece' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Gece (00-08)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Başlangıç Saati</label>
              <div className="relative">
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="08:00"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bitiş Saati</label>
              <div className="relative">
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="16:00"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vardiya Durumu</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Shift['status'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="planlandi">Planlandı (Aktif)</option>
              <option value="tamamlandi">Tamamlandı</option>
              <option value="iptal">İptal Edildi</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-800">
                Değişiklik Gerekçesi <span className="text-red-500 font-bold">* (Zorunlu)</span>
              </label>
              <span className="text-[11px] text-slate-400">Denetim kütüğüne yazılır</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Örn: Akşam yoğunluğu nedeniyle personelin saatleri kaydırıldı veya sağlık mazereti bildirimi."
              rows={3}
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
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSupervisorOfAnotherDept || isEmployee}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isSubmitting ? 'Kaydediliyor...' : 'Gerekçeyle Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
