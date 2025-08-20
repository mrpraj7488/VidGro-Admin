import React, { useState } from 'react';
import { Upload, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getSupabaseAdminClient } from '../../lib/supabase';

interface RestoreResult {
  success: boolean;
  message: string;
  tablesRestored?: number;
  policiesRestored?: number;
  functionsRestored?: number;
  error?: string;
}

export const DatabaseRestoreScreen: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.sql')) {
      setSelectedFile(file);
      setRestoreResult(null);
      setConfirmRestore(false);
    } else {
      alert('Please select a valid SQL backup file');
    }
  };

  const executeRestore = async () => {
    if (!selectedFile) return;

    setIsRestoring(true);
    setRestoreResult(null);

    try {
      const sqlContent = await selectedFile.text();
      
      // Send to restore endpoint
      const response = await fetch('/api/admin/database-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlContent })
      });

      const result = await response.json();
      
      if (result.success) {
        setRestoreResult({
          success: true,
          message: 'Database restored successfully!',
          tablesRestored: result.tablesRestored || 0,
          policiesRestored: result.policiesRestored || 0,
          functionsRestored: result.functionsRestored || 0
        });
      } else {
        setRestoreResult({
          success: false,
          message: 'Restore failed',
          error: result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      setRestoreResult({
        success: false,
        message: 'Restore failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRestoring(false);
      setConfirmRestore(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Database Restore</h2>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">⚠️ DANGER ZONE</h3>
              <p className="text-red-700 text-sm mt-1">
                This will completely replace your current database with the backup file. 
                All existing data will be lost. Make sure you have a recent backup before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select SQL Backup File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".sql"
              onChange={handleFileSelect}
              className="hidden"
              id="backup-file"
            />
            <label
              htmlFor="backup-file"
              className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
            >
              Choose SQL backup file
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Only .sql files are supported
            </p>
          </div>
          
          {selectedFile && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
        </div>

        {/* Confirmation */}
        {selectedFile && !isRestoring && (
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confirmRestore}
                onChange={(e) => setConfirmRestore(e.target.checked)}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm text-gray-700">
                I understand this will replace all existing data and cannot be undone
              </span>
            </label>
          </div>
        )}

        {/* Restore Button */}
        <div className="flex gap-3">
          <button
            onClick={executeRestore}
            disabled={!selectedFile || !confirmRestore || isRestoring}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
              !selectedFile || !confirmRestore || isRestoring
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isRestoring ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Restoring Database...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Restore Database
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {restoreResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            restoreResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {restoreResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  restoreResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {restoreResult.message}
                </h3>
                
                {restoreResult.success && (
                  <div className="text-green-700 text-sm mt-2">
                    <p>✅ Tables restored: {restoreResult.tablesRestored}</p>
                    <p>✅ Policies restored: {restoreResult.policiesRestored}</p>
                    <p>✅ Functions restored: {restoreResult.functionsRestored}</p>
                  </div>
                )}
                
                {restoreResult.error && (
                  <p className="text-red-700 text-sm mt-1">
                    Error: {restoreResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Upload a complete SQL backup file generated by the backup system</li>
            <li>• The restore process will recreate all tables, policies, triggers, and functions</li>
            <li>• All existing data will be replaced with the backup data</li>
            <li>• This operation cannot be undone - make sure you have a current backup</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
