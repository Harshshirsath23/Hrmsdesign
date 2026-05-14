import React, { useState, useMemo } from 'react';
import { Search, Download, Eye, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@components/ui';
import { MOCK_IMPORT_HISTORY, IMPORTER_TYPES } from './constants';
import { ImportModal } from './ImportModal';
import type { ImportHistory } from '@types/admin';

interface ExcelImportPageProps {
  onBack?: () => void;
}

export function ExcelImportPage({ onBack }: ExcelImportPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [importHistory, setImportHistory] = useState<ImportHistory[]>(MOCK_IMPORT_HISTORY);
  const [showImportModal, setShowImportModal] = useState(false);

  const allImporterTypes = IMPORTER_TYPES.flatMap((group) =>
    group.items.map((item) => ({ ...item, groupName: group.groupName }))
  );

  const getImporterTypeName = (typeId: string) => {
    return allImporterTypes.find((t) => t.id === typeId)?.name || typeId;
  };

  const filteredHistory = useMemo(() => {
    return importHistory.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedType || item.importerType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [importHistory, searchQuery, selectedType]);

  const handleImportSuccess = (data: any) => {
    const newImport: ImportHistory = {
      id: `import-${Date.now()}`,
      importerType: data.importerType,
      fileName: data.file.name,
      uploadedBy: 'Current User',
      uploadedOn: new Date().toISOString().split('T')[0],
      status: 'Processing',
      recordsProcessed: 0,
      recordsFailed: 0,
    };

    setImportHistory((prev) => [newImport, ...prev]);

    // Simulate completion
    setTimeout(() => {
      setImportHistory((prev) =>
        prev.map((imp) =>
          imp.id === newImport.id
            ? {
                ...imp,
                status: 'Success',
                recordsProcessed: Math.floor(Math.random() * 100) + 50,
                recordsFailed: 0,
              }
            : imp
        )
      );
    }, 2000);
  };

  const handleViewDetails = (history: ImportHistory) => {
    alert(`View details for: ${history.fileName}\n\nStatus: ${history.status}\nRecords Processed: ${history.recordsProcessed}`);
  };

  const handleDownloadFile = (history: ImportHistory) => {
    alert(`Downloading: ${history.fileName}`);
  };

  const handleRetry = (id: string) => {
    const item = importHistory.find((i) => i.id === id);
    if (item) {
      alert(`Retrying import: ${item.fileName}`);
      setImportHistory((prev) =>
        prev.map((imp) =>
          imp.id === id ? { ...imp, status: 'Processing' } : imp
        )
      );

      setTimeout(() => {
        setImportHistory((prev) =>
          prev.map((imp) =>
            imp.id === id
              ? { ...imp, status: 'Success', recordsProcessed: 50, recordsFailed: 0 }
              : imp
          )
        );
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Excel Import</h2>
          <p className="text-xs text-text-tertiary">
            Bulk upload and manage employee data from Excel files
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by file name or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 dark:border-white/10 bg-surface-0 dark:bg-white/3 text-text-primary placeholder-text-tertiary outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Importer Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-surface-200 dark:border-white/10 bg-surface-0 dark:bg-white/3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          >
            <option value="">All Importer Types</option>
            {allImporterTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.groupName})
              </option>
            ))}
          </select>

          {/* Import Button */}
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Plus className="h-4 w-4" />}
            onClick={() => setShowImportModal(true)}
          >
            Import from Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-surface-200 dark:border-white/8 bg-surface-50 dark:bg-white/3 p-4">
          <div className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-1">
            Total Imports
          </div>
          <div className="text-2xl font-bold text-text-primary">{importHistory.length}</div>
        </div>
        <div className="rounded-lg border border-surface-200 dark:border-white/8 bg-green-50 dark:bg-green-900/20 p-4">
          <div className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
            Successful
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {importHistory.filter((i) => i.status === 'Success').length}
          </div>
        </div>
        <div className="rounded-lg border border-surface-200 dark:border-white/8 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">
            Failed
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {importHistory.filter((i) => i.status === 'Failed').length}
          </div>
        </div>
        <div className="rounded-lg border border-surface-200 dark:border-white/8 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400 uppercase tracking-wide mb-1">
            Processing
          </div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {importHistory.filter((i) => i.status === 'Processing').length}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-surface-200 dark:border-white/8 bg-surface-0 dark:bg-white/3 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-white/10 bg-surface-50 dark:bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Importer Type</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">File Name</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Uploaded By</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Uploaded On</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Records Processed
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Records Failed
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((history) => (
                  <tr
                    key={history.id}
                    className="border-b border-surface-200 dark:border-white/5 hover:bg-surface-50 dark:hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {getImporterTypeName(history.importerType)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{history.fileName}</td>
                    <td className="px-4 py-3 text-text-secondary">{history.uploadedBy}</td>
                    <td className="px-4 py-3 text-text-secondary">{history.uploadedOn}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          history.status === 'Success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : history.status === 'Failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}
                      >
                        {history.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {history.recordsProcessed}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {history.recordsFailed}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetails(history)}
                          className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-text-secondary hover:text-brand-600" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(history)}
                          className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 rounded transition-colors"
                          title="Download File"
                        >
                          <Download className="h-4 w-4 text-text-secondary hover:text-brand-600" />
                        </button>
                        {history.status === 'Failed' && (
                          <button
                            onClick={() => handleRetry(history.id)}
                            className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 rounded transition-colors"
                            title="Retry Import"
                          >
                            <RotateCcw className="h-4 w-4 text-text-secondary hover:text-yellow-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-tertiary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="font-medium">No import history found</p>
                      <p className="text-xs mt-1">
                        {searchQuery || selectedType
                          ? 'Try adjusting your filters'
                          : 'Start by importing an Excel file'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
