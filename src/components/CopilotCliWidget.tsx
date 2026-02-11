import { useMemo, useState } from 'react';
import { ProcessedSeat } from '../types';
import { MaterialIcon } from './MaterialIcon';

interface CopilotCliWidgetProps {
  users: ProcessedSeat[];
}

const CLI_REGEX = /(copilot[-_ ]?cli|github[-_ ]?cli|gh[-_ ]?cli|\bcli\b|\bterminal\b|\bshell\b|\bbash\b|\bzsh\b|\bpowershell\b|\bpwsh\b)/i;

function isCliEditor(editor: string | null | undefined): boolean {
  if (!editor || editor === '-') return false;
  return CLI_REGEX.test(editor);
}

function safeDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === '-') return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDate(dateStr: string): string {
  const date = safeDate(dateStr);
  if (!date) return '-';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function getInitials(login: string): string {
  if (!login) return '?';
  return login.slice(0, 2).toUpperCase();
}

export function CopilotCliWidget({ users }: Readonly<CopilotCliWidgetProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyCli, setShowOnlyCli] = useState(false);
  const activeUsers = users.filter((u) => u.lastActivityAt !== '-');
  const cliUsers = activeUsers.filter((u) => isCliEditor(u.lastActivityEditor));

  const totalActive = activeUsers.length || 1;
  const cliCount = cliUsers.length;
  const cliPercent = Math.round((cliCount / totalActive) * 1000) / 10;

  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const active7d = activeUsers.filter((u) => {
    const date = safeDate(u.lastActivityAt);
    return date ? date >= last7d : false;
  }).length;

  // Get top editors
  const editorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeUsers.forEach((u) => {
      const editor = u.lastActivityEditor || '-';
      counts.set(editor, (counts.get(editor) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [activeUsers]);

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = showOnlyCli ? cliUsers : activeUsers;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.login.toLowerCase().includes(term) ||
          u.name?.toLowerCase().includes(term)
      );
    }
    
    return [...filtered].sort((a, b) => {
      const aDate = safeDate(a.lastActivityAt)?.getTime() || 0;
      const bDate = safeDate(b.lastActivityAt)?.getTime() || 0;
      return bDate - aDate;
    });
  }, [activeUsers, cliUsers, searchTerm, showOnlyCli]);

  return (
    <div className="stitch-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#001891] via-[#04E26A] to-[#001891]" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#001891]/10 flex items-center justify-center">
            <MaterialIcon icon="assignment_ind" size={20} className="text-[#001891]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#070E46]">Actividad Reciente</h3>
            <p className="text-xs text-gray-500">Usuarios y editores utilizados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOnlyCli(false)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              showOnlyCli
                ? 'bg-white text-[#001891] border-[#001891]/30 hover:border-[#001891]'
                : 'bg-[#001891] text-white border-[#001891]'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setShowOnlyCli(true)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              showOnlyCli
                ? 'bg-[#04E26A] text-[#004481] border-[#04E26A]'
                : 'bg-white text-[#04E26A] border-[#04E26A]/40 hover:border-[#04E26A]'
            }`}
          >
            Solo CLI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border border-[#001891]/15 bg-[#001891]/5 p-4">
          <p className="text-xs uppercase tracking-wider text-[#001891]/70 font-semibold">Total Activos</p>
          <p className="text-3xl font-extrabold text-[#001891] mt-1">{totalActive}</p>
        </div>
        <div className="rounded-xl border border-[#04E26A]/20 bg-[#04E26A]/10 p-4">
          <p className="text-xs uppercase tracking-wider text-[#078847] font-semibold">Con CLI</p>
          <p className="text-3xl font-extrabold text-[#078847] mt-1">{cliCount}</p>
          <p className="text-[10px] text-gray-500 mt-1">{cliPercent}% del total</p>
        </div>
        <div className="rounded-xl border border-[#5BBEFF]/30 bg-[#5BBEFF]/10 p-4">
          <p className="text-xs uppercase tracking-wider text-[#004481] font-semibold">Activos 7d</p>
          <p className="text-3xl font-extrabold text-[#004481] mt-1">{active7d}</p>
        </div>
      </div>

      {/* Top Editors */}
      {editorCounts.length > 0 && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Top Editores</p>
          <div className="flex flex-wrap gap-2">
            {editorCounts.map(([editor, count]) => {
              let displayName = editor;
              if (editor === '-') {
                displayName = 'Sin editor';
              } else if (editor.length > 25) {
                displayName = editor.substring(0, 22) + '...';
              }
              return (
                <span
                  key={editor}
                  className="text-[11px] px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-700 font-medium"
                >
                  {displayName} <span className="text-[#001891] font-bold">({count})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <MaterialIcon icon="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001891]/20 focus:border-[#001891]/40"
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            {showOnlyCli ? 'Usuarios CLI' : 'Usuarios activos'} ({filteredAndSortedUsers.length})
          </p>
          <span className="text-[10px] text-gray-400">Última actividad</span>
        </div>

        {filteredAndSortedUsers.length > 0 ? (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredAndSortedUsers.map((user) => (
              <li key={user.login} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.login}
                      className="w-8 h-8 rounded-full border border-white shadow"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#001891]/10 text-[#001891] flex items-center justify-center text-xs font-bold">
                      {getInitials(user.login)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name || 'Sin nombre'}
                      </p>
                      {isCliEditor(user.lastActivityEditor) && (
                        <span className="text-[10px] font-semibold text-[#04E26A] bg-[#04E26A]/10 border border-[#04E26A]/30 px-1.5 py-0.5 rounded-full">
                          CLI
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">@{user.login}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500">
                    {formatDate(user.lastActivityAt)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5" title={user.lastActivityEditor || '-'}>
                    {(() => {
                      const editor = user.lastActivityEditor;
                      if (!editor || editor === '-') return 'Sin editor';
                      if (editor.length > 20) return editor.substring(0, 17) + '...';
                      return editor;
                    })()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            {(() => {
              if (searchTerm.trim()) {
                return `No se encontraron usuarios que coincidan con "${searchTerm}"${showOnlyCli ? ' con CLI' : ''}`;
              }
              if (showOnlyCli) {
                return 'No hay actividad CLI registrada.';
              }
              return 'No hay actividad registrada.';
            })()}
          </p>
        )}
      </div>
    </div>
  );
}
