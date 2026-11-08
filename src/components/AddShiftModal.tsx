'use client';

import React, { useState } from 'react';
import { Staff, Shift, User, Department } from '@/types';
import { X, Plus, Calendar, Clock } from 'lucide-react';

interface AddShiftModalProps {
  staffList: Staff[];
  currentUser: User;
  onClose: () => void;
  onSave: (newShiftData: Omit<Shift, 'id'>) => Promise<boolean>;
}

export const AddShiftModal: React.FC<AddShiftModalProps> = ({
  staffList,
  currentUser,
  onClose,
  onSave
}) => {
  const allowedStaff = staffList.filter(s => {
    if (currentUser.role === 'supervisor' && currentUser.department) {
      return s.department === currentUser.department;
    }
    return true;
  });

  const [staffId, setStaffId] = useState(allowedStaff[0]?.id || '');
  const [date, setDate] = useState('2026-11-09');
  const [type, setType] = useState<Shift['type']>('Sabah');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTypeSelect = (newType: Shift['type']) => {
    setType(newType);
    if (newType === 'Sabah') {
      setStartTime('08:00');
      setEndTime('16:00');
    } else if (newType === 'Akşam') {
      setStartTime('16:00');
      setEndTime('24:00');
    } else if (newType === 'Gece') {
      setStartTime('00:00');
      setEndTime('08:00');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const targetStaff = allowedStaff.find(s => s.id === staffId);
    if (!targetStaff) {
      setErrorMessage('Lütfen geçerli bir personel seçiniz.');
      return;
    }

    setIsSubmitting(true);
    const success = await onSave({
      staffId: targetStaff.id,
      staffName: targetStaff.fullName,
      department: targetStaff.department,
      date,
      startTime,
      endTime,
      type,
      status: 'planlandi',
      notes: notes.trim() || undefined
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Yeni Vardiya Planlama</h3>
            <p className="text-xs text-slate-500">Personel ve çalışma saatlerini belirleyiniz</p>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Personel Seçimi</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              {allowedStaff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} - {s.title} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vardiya Tarihi</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vardiya Türü</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('Sabah')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                  type === 'Sabah' ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Sabah (08:00 - 16:00)
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('Akşam')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                  type === 'Akşam' ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Akşam (16:00 - 24:00)
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('Gece')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                  type === 'Gece' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Gece (00:00 - 08:00)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Başlangıç Saati</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bitiş Saati</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Not / Açıklama (İsteğe bağlı)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Özel etkinlik hazırlığı"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Kaydediliyor...' : 'Vardiyayı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
