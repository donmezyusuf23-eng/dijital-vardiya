'use client';

import React, { useState, useMemo } from 'react';
import { Shift, Staff, User, Department } from '@/types';
import {
  Calendar,
  Clock,
  Edit2,
  MessageSquarePlus,
  Filter,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Download,
  Plus,
  Lock
} from 'lucide-react';

interface ShiftTableProps {
  shifts: Shift[];
  staff: Staff[];
  currentUser: User;
  onEditShift: (shift: Shift) => void;
  onRequestFeedback: (shift: Shift) => void;
  onAddNewShift: () => void;
}

export const ShiftTable: React.FC<ShiftTableProps> = ({
  shifts,
  staff,
  currentUser,
  onEditShift,
  onRequestFeedback,
  onAddNewShift
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(
    currentUser.role === 'supervisor' && currentUser.department ? currentUser.department : 'ALL'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const weekDates = useMemo(() => {
    const dates: { dateStr: string; label: string; dayName: string }[] = [];
    const baseDate = new Date('2026-11-08');
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      const label = `${d.getDate()} Kasım`;
      dates.push({ dateStr, label, dayName });
    }
    return dates;
  }, []);

  const filteredStaff = useMemo(() => {
    let result = [...staff];

    if (currentUser.role === 'employee' && currentUser.staffId) {
      return result.filter(s => s.id === currentUser.staffId);
    }

    if (selectedDept !== 'ALL') {
      result = result.filter(s => s.department === selectedDept);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s => s.fullName.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
      );
    }

    return result;
  }, [staff, selectedDept, searchQuery, currentUser]);

  const shiftsMap = useMemo(() => {
    const map = new Map<string, Shift>();
    shifts.forEach(s => {
      map.set(`${s.staffId}_${s.date}`, s);
    });
    return map;
  }, [shifts]);

  const getShiftBadge = (type: Shift['type']) => {
    switch (type) {
      case 'Sabah':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Akşam':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Gece':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tarih', 'Personel', 'Birim', 'Başlangıç', 'Bitiş', 'Tür', 'Durum'];
    const rows = shifts.map(s => [
      s.date,
      `"${s.staffName}"`,
      s.department,
      s.startTime,
      s.endTime,
      s.type,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vardiya_Cizelgesi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Birim:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              disabled={currentUser.role === 'employee'}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60"
            >
              {currentUser.role !== 'supervisor' && <option value="ALL">Tüm Birimler (Mutfak & Servis)</option>}
              <option value="Mutfak">Mutfak Departmanı</option>
              <option value="Servis">Servis Departmanı</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Personel ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Haftalık Matris</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Liste Görünümü</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">CSV İndir</span>
          </button>

          {currentUser.role !== 'employee' && (
            <button
              onClick={onAddNewShift}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Vardiya Ekle</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-3 px-4 font-bold sticky left-0 bg-slate-50 z-10 w-56 border-r border-slate-200">
                    Personel & Görev
                  </th>
                  {weekDates.map(d => (
                    <th key={d.dateStr} className="py-2.5 px-3 font-semibold text-center border-r border-slate-200 min-w-[130px]">
                      <div className="text-[11px] text-slate-500 font-medium">{d.dayName}</div>
                      <div className="text-slate-800 font-bold">{d.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Arama kriterlerine uygun personel bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 sticky left-0 bg-white z-10 border-r border-slate-200">
                        <div className="font-semibold text-slate-900">{st.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className={`w-2 h-2 rounded-full ${st.department === 'Mutfak' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                          {st.title} ({st.department})
                        </div>
                      </td>

                      {weekDates.map(d => {
                        const shift = shiftsMap.get(`${st.id}_${d.dateStr}`);
                        const canEdit =
                          currentUser.role === 'admin' ||
                          (currentUser.role === 'supervisor' && currentUser.department === st.department);

                        return (
                          <td key={d.dateStr} className="p-2 border-r border-slate-100 align-top">
                            {shift ? (
                              <div
                                className={`group relative p-2 rounded-xl border text-xs transition shadow-2xs ${getShiftBadge(
                                  shift.type
                                )} hover:shadow-md`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-bold text-[11px] uppercase tracking-wide">
                                    {shift.type}
                                  </span>
                                  {currentUser.role === 'employee' ? (
                                    <button
                                      onClick={() => onRequestFeedback(shift)}
                                      title="Değişiklik veya Mazeret Talebi Gönder"
                                      className="p-1 rounded bg-white/80 hover:bg-white text-blue-700 transition cursor-pointer"
                                    >
                                      <MessageSquarePlus className="w-3.5 h-3.5" />
                                    </button>
                                  ) : canEdit ? (
                                    <button
                                      onClick={() => onEditShift(shift)}
                                      title="Vardiyayı Düzenle (Gerekçeli)"
                                      className="p-1 rounded bg-white/80 hover:bg-white text-slate-700 transition cursor-pointer opacity-70 group-hover:opacity-100"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <span title="Yetkiniz dışındaki birim" className="text-slate-400">
                                      <Lock className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 font-mono text-[11px] font-semibold">
                                  <Clock className="w-3 h-3 opacity-70" />
                                  <span>{shift.startTime} - {shift.endTime}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-14 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 bg-slate-50/50">
                                İzinli / Boş
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Personel</th>
                <th className="py-3 px-4">Birim</th>
                <th className="py-3 px-4">Saat Aralığı</th>
                <th className="py-3 px-4">Vardiya Türü</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts
                .filter(s => {
                  if (currentUser.role === 'employee' && currentUser.staffId) {
                    return s.staffId === currentUser.staffId;
                  }
                  if (selectedDept !== 'ALL') {
                    return s.department === selectedDept;
                  }
                  return true;
                })
                .slice(0, 50)
                .map(s => {
                  const canEdit =
                    currentUser.role === 'admin' ||
                    (currentUser.role === 'supervisor' && currentUser.department === s.department);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-medium text-slate-900">{s.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.staffName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          {s.department}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{s.startTime} - {s.endTime}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getShiftBadge(s.type)}`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                        <span className="capitalize text-slate-700">{s.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {currentUser.role === 'employee' ? (
                          <button
                            onClick={() => onRequestFeedback(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            Talep İlet
                          </button>
                        ) : canEdit ? (
                          <button
                            onClick={() => onEditShift(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Düzenle
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Yetki Dışı</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
