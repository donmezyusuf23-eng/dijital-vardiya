'use client';

import React, { useState } from 'react';
import { Staff, User } from '@/types';
import { Users, Phone, Mail, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

interface StaffListProps {
  staff: Staff[];
  currentUser: User;
}

export const StaffList: React.FC<StaffListProps> = ({ staff, currentUser }) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const filteredStaff = staff.filter(s => {
    if (currentUser.role === 'supervisor' && currentUser.department) {
      if (s.department !== currentUser.department) return false;
    }
    if (selectedDept !== 'ALL') {
      return s.department === selectedDept;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            İşletme Personel Kadrosu (Pilot Test Veri Seti - 20 Personel)
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'supervisor'
              ? `${currentUser.department} birimindeki aktif personelleriniz`
              : 'Mutfak ve Servis birimlerindeki tüm personel ve unvan bilgileri'}
          </p>
        </div>

        {currentUser.role !== 'supervisor' && (
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Tüm Departmanlar</option>
            <option value="Mutfak">Mutfak Kadrosu (10 Personel)</option>
            <option value="Servis">Servis Kadrosu (10 Personel)</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStaff.map(s => (
          <div
            key={s.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{s.fullName}</h3>
                <p className="text-xs text-slate-500 font-medium">{s.title}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                s.department === 'Mutfak'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {s.department}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{s.email}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-100">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Aktif Personel
              </span>
              <span className="text-slate-400 font-mono">ID: {s.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
