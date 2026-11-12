import React from 'react';
import {
  Search,
  Filter,
  Layers,
  LayoutGrid,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { Course } from '../utils/classroom-logic';

interface TaskFiltersProps {
  courses: Course[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  sortBy: 'DUE_DATE_ASC' | 'DUE_DATE_DESC' | 'TITLE_ASC';
  onSortChange: (sort: 'DUE_DATE_ASC' | 'DUE_DATE_DESC' | 'TITLE_ASC') => void;
  groupByCourse: boolean;
  onToggleGroupByCourse: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  courses,
  searchQuery,
  onSearchChange,
  selectedCourseId,
  onSelectCourse,
  selectedStatus,
  onSelectStatus,
  sortBy,
  onSortChange,
  groupByCourse,
  onToggleGroupByCourse,
}) => {
  const statusOptions = [
    { id: 'ALL', label: 'Semua Status' },
    { id: 'CREATED', label: 'Belum Dikerjakan' },
    { id: 'TURNED_IN', label: 'Diserahkan' },
    { id: 'RETURNED', label: 'Dinilai' },
    { id: 'MISSING', label: 'Terlambat' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul tugas, mata pelajaran, atau deskripsi..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Course Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCourseId}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Mata Pelajaran ({courses.length})</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative min-w-[170px]">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="DUE_DATE_ASC">Tenggat Terdekat</option>
              <option value="DUE_DATE_DESC">Tenggat Terjauh</option>
              <option value="TITLE_ASC">Judul (A - Z)</option>
            </select>
          </div>

          {/* Group by course toggle button */}
          <button
            onClick={onToggleGroupByCourse}
            title={groupByCourse ? 'Beralih ke tampilan grid datar' : 'Kelompokkan berdasarkan mata pelajaran'}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              groupByCourse
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {groupByCourse ? (
              <>
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="hidden lg:inline">Per Mapel</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden lg:inline">Semua Grid</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
          Status:
        </span>
        {statusOptions.map((opt) => {
          const isActive = selectedStatus === opt.id;
          return (
            <button
              key={opt.id}
              id={`status-chip-${opt.id.toLowerCase()}`}
              onClick={() => onSelectStatus(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
