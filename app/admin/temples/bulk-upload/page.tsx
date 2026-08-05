"use client";

import React, { useState } from "react";
import Link from "next/link";
import { parseTempleCsv, ParsedTempleRow } from "@/lib/utils/csvParser";
import { bulkImportTemplesAction, BulkImportResult } from "@/app/admin/temples/bulk-upload/actions";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Download,
  Loader2,
  Church,
  RefreshCw,
} from "lucide-react";

export default function BulkUploadTemplesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{
    rows: ParsedTempleRow[];
    validRows: ParsedTempleRow[];
    invalidRows: ParsedTempleRow[];
  } | null>(null);

  const [importing, setImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    if (!selectedFile.name.endsWith(".csv")) {
      alert("Please select a valid .csv file");
      return;
    }

    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const csvText = evt.target?.result as string;
      const parsed = parseTempleCsv(csvText);
      setParsedData(parsed);
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (!parsedData || parsedData.validRows.length === 0) return;

    setImporting(true);

    try {
      const res = await bulkImportTemplesAction(parsedData.validRows);
      setImportResult(res);
    } catch (err: any) {
      alert(err.message || "Failed to execute bulk import");
    } finally {
      setImporting(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedData(null);
    setImportResult(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/temples"
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary-500" />
              Bulk Import Temples from CSV
            </h1>
            <p className="text-xs text-slate-500">
              Import Puja Udjapan Parishad 2025 official temple list directly into the database.
            </p>
          </div>
        </div>

        <a
          href="/data/temples_import_template.csv"
          download="temples_import_template.csv"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Download className="h-4 w-4 text-primary-500" />
          Download Sample CSV
        </a>
      </div>

      {/* POST-IMPORT AUDIT RESULTS SCREEN */}
      {importResult ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Bulk Import Execution Summary
              </h2>
              <p className="text-xs text-slate-500">
                Audit trail for file: <strong className="text-slate-700 dark:text-slate-300">{file?.name}</strong>
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 p-4 border border-emerald-200 dark:border-emerald-900/50">
              <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
                Successfully Imported
              </span>
              <span className="font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {importResult.successCount}
              </span>
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/60 p-4 border border-amber-200 dark:border-amber-900/50">
              <span className="block text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase">
                Skipped Duplicates
              </span>
              <span className="font-display text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {importResult.skippedDuplicates}
              </span>
            </div>

            <div className="rounded-2xl bg-red-50 dark:bg-red-950/60 p-4 border border-red-200 dark:border-red-900/50">
              <span className="block text-xs font-semibold text-red-700 dark:text-red-300 uppercase">
                Failed / Invalid Rows
              </span>
              <span className="font-display text-3xl font-extrabold text-red-600 dark:text-red-400">
                {importResult.errors.length}
              </span>
            </div>
          </div>

          {/* Error Log Breakdown */}
          {importResult.errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-display text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Import Error Log ({importResult.errors.length})
              </h3>
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-red-300 space-y-1.5 max-h-48 overflow-y-auto border border-slate-800">
                {importResult.errors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">Row #{err.rowNumber}:</span>
                    <span>
                      <strong className="text-amber-400">{err.templeName}</strong> — {err.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/admin/temples"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
            >
              <Church className="h-4 w-4" />
              View All Temples
            </Link>

            <button
              onClick={resetUpload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Upload Another CSV
            </button>
          </div>
        </div>
      ) : (
        /* STEP 1 & STEP 2: FILE SELECTION & PREVIEW STAGE */
        <div className="space-y-6">
          {/* File Upload Dropzone */}
          {!parsedData && (
            <label className="flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center hover:border-primary-500 hover:bg-primary-500/5 transition-all cursor-pointer">
              <UploadCloud className="h-12 w-12 text-primary-500 mb-3 animate-bounce" />
              <span className="font-display text-base font-bold text-slate-900 dark:text-white">
                Click or Drag CSV File Here
              </span>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                CSV headers must include: <code className="text-primary-500">temple_name</code>, <code className="text-primary-500">district_name_en</code>, <code className="text-primary-500">address_text</code>
              </p>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          )}

          {/* Parsed Data Preview & Validation Summary */}
          {parsedData && (
            <div className="space-y-6 animate-in fade-in">
              {/* Validation Summary Bar */}
              <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    CSV File: {file?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total parsed rows: <strong>{parsedData.rows.length}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4" /> {parsedData.validRows.length} Valid Rows
                  </span>

                  {parsedData.invalidRows.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-950/80 px-3 py-1 font-semibold text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4" /> {parsedData.invalidRows.length} Invalid Rows
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetUpload}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleConfirmImport}
                    disabled={importing || parsedData.validRows.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 disabled:opacity-50 transition-all"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Importing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Confirm & Import {parsedData.validRows.length} Rows
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 10-Row Data Preview Table */}
              <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    First 10 Rows Data Preview
                  </span>
                  <span className="text-slate-500">Showing 1 to {Math.min(10, parsedData.rows.length)} of {parsedData.rows.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Row #</th>
                        <th className="px-3 py-2.5">Temple Name</th>
                        <th className="px-3 py-2.5">District</th>
                        <th className="px-3 py-2.5">Address</th>
                        <th className="px-3 py-2.5">Coordinates</th>
                        <th className="px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {parsedData.rows.slice(0, 10).map((r) => (
                        <tr key={r.rowNumber} className={r.isValid ? "" : "bg-red-50/40 dark:bg-red-950/30"}>
                          <td className="px-3 py-2 font-mono text-slate-400">#{r.rowNumber}</td>
                          <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">
                            {r.temple_name || "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                            {r.district_name_en || "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-500 truncate max-w-[160px]">
                            {r.address_text || "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">
                            {r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-[11px]" title={r.validationError}>
                                <XCircle className="h-3.5 w-3.5" /> Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
