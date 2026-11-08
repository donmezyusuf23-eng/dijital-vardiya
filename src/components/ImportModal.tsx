'use client';

import React, { useState } from 'react';
import { Shift, User, Staff } from '@/types';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  currentUser: User;
  staffList: Staff[];
  onClose: () => void;
  onImport: (shifts: Omit<Shift, 'id'>[]) => Promise<boolean>;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  currentUser,
  staffList,
  onClose,
  onImport
}) => {
  const [csvText, setCsvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const sampleCsv = `st-02,Caner Şen,Mutfak,2026-11-15,08:00,16:00,Sabah
st-03,Murat Arslan,Mutfak,2026-11-15,16:00,24:00,Akşam
st-12,Elif Çelik,Servis,2026-11-15,08:00,16:00,Sabah
st-13,Kerem Yalçın,Servis,2026-11-15,16:00,24:00,Akşam`;

  const handleLoadSample = () => {
    setCsvText(sampleCsv);
  };

  const handleProcess = async () => {
    setErrorMessage('');
    setResultMessage('');

    if (!csvText.trim()) {
      setErrorMessage('Lütfen CSV formatında veri giriniz veya örnek şablonu yükleyiniz.');
      return;
    }

    const lines = csvText.trim().split('\n');
    const parsedShifts: Omit<Shift, 'id'>[] = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 7) {
        parsedShifts.push({
          staffId: parts[0],
          staffName: parts[1],
          department: parts[2] as Shift['department'],
          date: parts[3],
          startTime: parts[4],
          endTime: parts[5],
          type: parts[6] as Shift['type'],
          status: 'planlandi'
        });
      }
    }

    if (parsedShifts.length === 0) {
      setErrorMessage('Satırlar çözümlenemedi. Biçim: personelId, personelAd, birim, tarih, baslangic, bitis, tur');
      return;
    }

    setIsSubmitting(true);
    const success = await onImport(parsedShifts);
    setIsSubmitting(false);

    if (success) {
      setResultMessage(`${parsedShifts.length} adet vardiya başarıyla sisteme aktarıldı.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Excel / CSV Vardiya Planı İçe Aktar</h3>
              <p className="text-xs text-slate-500">Hazır çizelgeleri tek adımda sisteme yükleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {resultMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {resultMessage}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">CSV Verisi (personelId, ad, birim, tarih, baslangic, bitis, tur)</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Örnek Şablonu Doldur
            </button>
          </div>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={8}
            placeholder="st-02,Caner Şen,Mutfak,2026-11-15,08:00,16:00,Sabah..."
            className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProcess}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              {isSubmitting ? 'Aktarılıyor...' : 'Çizelgeyi İçe Aktar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
