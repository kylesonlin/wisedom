"use client";
import React, { useState, useRef } from 'react';
import MainLayout from '../../components/MainLayout';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface CsvRow {
  [key: string]: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const contactFields = [
  { label: 'Name (First + Last)', value: 'name' },
  { label: 'Email', value: 'email' },
  { label: 'Phone Number', value: 'phone' },
  { label: 'Company', value: 'company' },
  { label: 'Title', value: 'title' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Date of Connection', value: 'date_of_connection' },
  { label: 'Secondary Phone Number', value: 'secondary_phone' },
];

export default function ImportContactsClient() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<'upload' | 'map' | 'import' | 'done'>('upload');
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastProgressTime, setLastProgressTime] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const progressRef = useRef(0);
  const router = useRouter();

  // Magic mapping: try to auto-map known fields
  React.useEffect(() => {
    if (step === 'map' && headers.length > 0) {
      const autoMapping: { [key: string]: string } = {};
      contactFields.forEach(field => {
        const match = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.label.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (match) autoMapping[field.value] = match;
      });
      setMapping(autoMapping);
    }
    // eslint-disable-next-line
  }, [step, headers]);

  // Timeout checker
  React.useEffect(() => {
    if (step === 'import') {
      setStartTime(Date.now());
      setLastProgressTime(Date.now());
      setTimedOut(false);
      const interval = setInterval(() => {
        if (progressRef.current < 100 && lastProgressTime && Date.now() - lastProgressTime > 30000) {
          setTimedOut(true);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [step, lastProgressTime]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<CsvRow>) => {
        if (results.errors.length) {
          setError('Error parsing CSV: ' + results.errors[0].message);
          setCsvData([]);
          setHeaders([]);
        } else {
          setCsvData(results.data as CsvRow[]);
          setHeaders(results.meta.fields || []);
          setStep('map');
        }
      },
    });
  };

  const handleMappingChange = (field: string, csvCol: string) => {
    setMapping((prev) => ({ ...prev, [field]: csvCol }));
  };

  const handleImport = async () => {
    setStep('import');
    setProgress(0);
    setStartTime(Date.now());
    setLastProgressTime(Date.now());
    setTimedOut(false);
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const total = csvData.length;
    for (let i = 0; i < total; i++) {
      const row = csvData[i];
      try {
        // Build contact object
        const contact: any = {
          additionalFields: {},
        };
        // Magic mapping for known fields
        contactFields.forEach(field => {
          const csvCol = mapping[field.value] || headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.label.toLowerCase().replace(/[^a-z0-9]/g, ''));
          if (csvCol && row[csvCol]) {
            if (field.value === 'name' && (csvCol.includes('First') && csvCol.includes('Last'))) {
              contact.name = `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim();
            } else if (['email', 'phone', 'company', 'title'].includes(field.value)) {
              contact[field.value] = row[csvCol];
            } else {
              contact.additionalFields[field.value] = row[csvCol];
            }
          }
        });
        // Store all unmapped columns in additionalFields
        headers.forEach(header => {
          const isMapped = Object.values(mapping).includes(header) || contactFields.some(f => header.toLowerCase().replace(/[^a-z0-9]/g, '') === f.label.toLowerCase().replace(/[^a-z0-9]/g, ''));
          if (!isMapped && row[header]) {
            contact.additionalFields[header] = row[header];
          }
        });
        contact.createdAt = new Date().toISOString();
        contact.updatedAt = new Date().toISOString();
        const { error } = await supabase.from('contacts').insert([contact]);
        if (error) {
          failed++;
          errors.push(`Row: ${JSON.stringify(row)} | Error: ${error.message}`);
          console.error('Supabase insert error:', error, 'Row:', row);
        } else {
          success++;
        }
      } catch (e: any) {
        failed++;
        errors.push(`Row: ${JSON.stringify(row)} | Exception: ${e.message}`);
        console.error('Exception during import:', e, 'Row:', row);
      }
      // Update progress
      const percent = Math.round(((i + 1) / total) * 100);
      setProgress(percent);
      progressRef.current = percent;
      setLastProgressTime(Date.now());
    }
    setImportResult({ success, failed, errors });
    setStep('done');
    if (failed === 0) {
      router.push('/rolodex');
    }
  };

  // Estimate time remaining
  let estTime = null;
  if (step === 'import' && startTime && progress > 0 && progress < 100) {
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    const estTotal = elapsed / (progress / 100);
    const estLeft = estTotal - elapsed;
    estTime = estLeft > 0 ? `${Math.round(estLeft)}s remaining` : null;
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Import Contacts (CSV)</h1>
        {step === 'upload' && (
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mb-4"
          />
        )}
        {fileName && <div className="mb-2 text-sm text-gray-500">Selected file: {fileName}</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {step === 'map' && csvData.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Map CSV Columns to Contact Fields</h2>
            <button
              className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setShowAdvanced(v => !v)}
            >
              {showAdvanced ? 'Hide Advanced Import Settings' : 'Show Advanced Import Settings'}
            </button>
            {showAdvanced && (
              <div className="space-y-4">
                {contactFields.map((field) => (
                  <div key={field.value} className="flex items-center space-x-4">
                    <label className="w-48 font-medium">{field.label}</label>
                    <select
                      className="border rounded px-2 py-1"
                      value={mapping[field.value] || ''}
                      onChange={(e) => handleMappingChange(field.value, e.target.value)}
                    >
                      <option value="">None</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
            <button
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleImport}
            >
              Import to Supabase
            </button>
          </div>
        )}
        {step === 'import' && (
          <div className="mt-6 flex flex-col items-center">
            <div className="mb-2">Importing contacts...</div>
            <div className="w-full bg-gray-200 rounded h-4 mb-2">
              <div
                className="bg-blue-500 h-4 rounded"
                style={{ width: `${progress}%`, transition: 'width 0.3s' }}
              />
            </div>
            <div className="mb-2 text-sm text-gray-600">{progress}% {estTime && `- ${estTime}`}</div>
            <div className="flex items-center justify-center mt-2">
              <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            {timedOut && (
              <div className="mt-4 text-red-600 text-sm">This is taking longer than expected. Please check your connection or try a smaller file.</div>
            )}
          </div>
        )}
        {step === 'done' && (
          <div className="mt-6">
            <div className="text-green-600 font-semibold mb-2">Import complete!</div>
            <div>Success: {importResult.success}</div>
            <div>Failed: {importResult.failed}</div>
            {importResult.errors.length > 0 && (
              <div className="mt-2 text-red-600">
                <div>Errors:</div>
                <ul className="list-disc ml-6">
                  {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 