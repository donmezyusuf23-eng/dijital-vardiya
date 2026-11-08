'use client';

import React, { useState } from 'react';
import { AuditLog, User } from '@/types';
import { History, Shield, ArrowRight, Search, FileText } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
  currentUser: User;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => {
    if (currentUser.role === 'supervisor' && currentUser.department) {
      if (l.department !== currentUser.department) return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.staffName.toLowerCase().includes(term) ||
      l.performedByUserName.toLowerCase().includes(term) ||
      l.reason.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            Vardiya Değişiklik Geçmişi ve Denetim İzi (Audit Log)
          </h2>
          <p className="text-xs text-slate-500">
            Sistemde yetkililerce yapılan tüm vardiya düzenlemeleri, saat değişimleri ve gerekçeleri
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Personel veya gerekçe ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-56"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Kayıtlı denetim kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Tarih / Saat</th>
                  <th className="py-3 px-4">İşlemi Yapan Yetkili</th>
                  <th className="py-3 px-4">İlgili Personel & Birim</th>
                  <th className="py-3 px-4">Eski Değer ➔ Yeni Değer</th>
                  <th className="py-3 px-4">Zorunlu Değişiklik Gerekçesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.performedByUserName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-purple-600" />
                        <span className="capitalize">{log.performedByRole}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{log.staffName}</div>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {log.department}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block font-mono text-[11px] line-through">
                          {log.previousValue}
                        </div>
                        <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">
                          <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{log.newValue}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700 text-xs italic">
                        &quot;{log.reason}&quot;
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
