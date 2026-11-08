'use client';

import React from 'react';
import { User, Role } from '@/types';
import { Shield, UserCheck, Users, RefreshCw, KeyRound, Building2 } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onResetData: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onResetData,
  isResetting
}) => {
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300"><Shield className="w-3.5 h-3.5" /> Admin / Yönetici</span>;
      case 'supervisor':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"><UserCheck className="w-3.5 h-3.5" /> Şef / Sorumlu</span>;
      case 'employee':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><Users className="w-3.5 h-3.5" /> Çalışan</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Dijital Vardiya Yönetim Sistemi</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Yetki Tabanlı Planlama, Denetim İzi & Süreç Yönetimi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium px-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Test Rolü Seç:</span>
              </span>
              <select
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer"
                value={currentUser.id}
                onChange={(e) => {
                  const selected = allUsers.find(u => u.id === e.target.value);
                  if (selected) onSelectUser(selected);
                }}
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role === 'admin' ? 'Admin' : u.role === 'supervisor' ? `Şef - ${u.department}` : `Çalışan - ${u.department}`})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onResetData}
              disabled={isResetting}
              title="Test verilerini başlangıç durumuna döndür"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">Verileri Sıfırla</span>
            </button>
          </div>
        </div>

        <div className="py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Aktif Oturum:</span>
            <span className="font-semibold text-slate-900">{currentUser.fullName}</span>
            {getRoleBadge(currentUser.role)}
            {currentUser.department && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                Birim: {currentUser.department}
              </span>
            )}
          </div>
          <div className="text-slate-500 text-[11px]">
            {currentUser.role === 'admin' && '👑 Tüm birimlerin vardiyalarını planlayabilir, onaylayabilir ve denetim kayıtlarını görebilirsiniz.'}
            {currentUser.role === 'supervisor' && `⚡ Yalnızca "${currentUser.department}" birimindeki çalışanların vardiyalarını gerekçe belirterek güncelleyebilirsiniz.`}
            {currentUser.role === 'employee' && '👁️ Yalnızca adınıza atanmış vardiyaları görebilir ve değişiklik talebi iletebilirsiniz.'}
          </div>
        </div>
      </div>
    </header>
  );
};
