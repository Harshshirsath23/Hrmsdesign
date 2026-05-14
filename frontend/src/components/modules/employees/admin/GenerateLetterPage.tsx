import React, { useState, useMemo } from 'react';
import { Search, Download, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@components/ui';
import { MOCK_LETTER_RECORDS, LETTER_TEMPLATES } from './constants';
import type { LetterRecord } from '@types/admin';

interface GenerateLetterPageProps {
  onBack?: () => void;
}

export function GenerateLetterPage({ onBack }: GenerateLetterPageProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'completed'>('progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Mock data - in progress and completed
  const inProgressLetters: LetterRecord[] = MOCK_LETTER_RECORDS.filter(
    (l) => l.approvalStatus === 'Pending'
  );

  const completedLetters: LetterRecord[] = MOCK_LETTER_RECORDS.filter(
    (l) => l.approvalStatus === 'Approved' || l.approvalStatus === 'Rejected'
  ).map((l) => ({
    ...l,
    signatoryRemarks: 'Approved as per policy',
    employeeStatus: 'Active',
    employeeRemarks: 'Document received',
  }));

  const currentLetters = activeTab === 'progress' ? inProgressLetters : completedLetters;

  const filteredLetters = useMemo(() => {
    return currentLetters.filter((letter) => {
      const query = searchQuery.toLowerCase();
      return (
        letter.employee.toLowerCase().includes(query) ||
        letter.letterTemplate.toLowerCase().includes(query) ||
        letter.serialNo.toLowerCase().includes(query)
      );
    });
  }, [currentLetters, searchQuery]);

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredLetters.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredLetters.map((l) => l.id)));
    }
  };

  const handleDownload = (letter: LetterRecord) => {
    const filename = `${letter.letterTemplate.replace(/\s+/g, '_')}_${letter.employeeId}.pdf`;
    alert(`Downloading: ${filename}`);
  };

  const handleEdit = (letter: LetterRecord) => {
    alert(`Edit modal for: ${letter.letterTemplate} - ${letter.employee}`);
  };

  const handleDelete = (id: string) => {
    alert(`Delete letter with ID: ${id}`);
  };

  const handleView = (letter: LetterRecord) => {
    alert(`View letter: ${letter.letterTemplate} for ${letter.employee}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Generate Letter</h2>
          <p className="text-xs text-text-tertiary">
            Create, manage, and track official employee letters
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by employee, letter type, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 dark:border-white/10 bg-surface-0 dark:bg-white/3 text-text-primary placeholder-text-tertiary outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Download button */}
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Download className="h-4 w-4" />}
            onClick={() => alert('Export as PDF/Excel')}
          >
            Download
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-white/10">
        {[
          { id: 'progress', label: `In Progress (${inProgressLetters.length})` },
          { id: 'completed', label: `Completed (${completedLetters.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'progress' | 'completed')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-surface-200 dark:border-white/8 bg-surface-0 dark:bg-white/3 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-white/10 bg-surface-50 dark:bg-white/5">
                {activeTab === 'completed' && (
                  <th className="w-8 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredLetters.length && filteredLetters.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded border-surface-300 dark:border-white/20 cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Letter Template
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Employee</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  {activeTab === 'progress' ? 'Prepared On' : 'Prepared On'}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Prepared By
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Authorised Signatory
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Letter Approval Status
                </th>
                {activeTab === 'completed' && (
                  <>
                    <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                      Signatory Remarks
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                      Employee Status
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Serial No</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Remarks</th>
                {activeTab === 'completed' && (
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                    Employee Remarks
                  </th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLetters.length > 0 ? (
                filteredLetters.map((letter) => (
                  <tr
                    key={letter.id}
                    className="border-b border-surface-200 dark:border-white/5 hover:bg-surface-50 dark:hover:bg-white/3 transition-colors"
                  >
                    {activeTab === 'completed' && (
                      <td className="w-8 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(letter.id)}
                          onChange={() => toggleRowSelection(letter.id)}
                          className="rounded border-surface-300 dark:border-white/20 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-text-primary font-medium">{letter.letterTemplate}</td>
                    <td className="px-4 py-3 text-text-secondary">{letter.employee}</td>
                    <td className="px-4 py-3 text-text-secondary">{letter.preparedOn}</td>
                    <td className="px-4 py-3 text-text-secondary">{letter.preparedBy}</td>
                    <td className="px-4 py-3 text-text-secondary">{letter.authorisedSignatory}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          letter.approvalStatus === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : letter.approvalStatus === 'Approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {letter.approvalStatus}
                      </span>
                    </td>
                    {activeTab === 'completed' && (
                      <>
                        <td className="px-4 py-3 text-text-secondary text-xs">
                          {letter.signatoryRemarks}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{letter.employeeStatus}</td>
                      </>
                    )}
                    <td className="px-4 py-3 text-text-primary font-medium">{letter.serialNo}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs max-w-xs truncate">
                      {letter.remarks}
                    </td>
                    {activeTab === 'completed' && (
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        {letter.employeeRemarks}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(letter)}
                          className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4 text-text-secondary hover:text-brand-600" />
                        </button>
                        <button
                          onClick={() => handleDownload(letter)}
                          className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-text-secondary hover:text-brand-600" />
                        </button>
                        {activeTab === 'progress' && (
                          <button
                            onClick={() => handleEdit(letter)}
                            className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-text-secondary hover:text-brand-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(letter.id)}
                          className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-text-secondary hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={activeTab === 'completed' ? 12 : 11}
                    className="px-4 py-8 text-center text-text-tertiary"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="font-medium">No letters found</p>
                      <p className="text-xs mt-1">
                        {searchQuery
                          ? 'Try adjusting your search criteria'
                          : `No ${activeTab === 'progress' ? 'in-progress' : 'completed'} letters yet`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
