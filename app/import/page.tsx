import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

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

export default function ImportContacts() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<'upload' | 'map' | 'import' | 'done'>('upload');
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });

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
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    for (const row of csvData) {
      try {
        // Build contact object
        const contact: any = {
          additionalFields: {},
        };
        // Name: combine first and last if mapped
        if (mapping['name']) {
          if (mapping['name'].includes('First') && mapping['name'].includes('Last')) {
            contact.name = `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim();
          } else {
            contact.name = row[mapping['name']];
          }
        }
        if (mapping['email']) contact.email = row[mapping['email']];
        if (mapping['phone']) contact.phone = row[mapping['phone']];
        if (mapping['company']) contact.company = row[mapping['company']];
        if (mapping['title']) contact.title = row[mapping['title']];
        // Additional fields
        if (mapping['linkedin']) contact.additionalFields.linkedin = row[mapping['linkedin']];
        if (mapping['date_of_connection']) contact.additionalFields.date_of_connection = row[mapping['date_of_connection']];
        if (mapping['secondary_phone']) contact.additionalFields.secondary_phone = row[mapping['secondary_phone']];
        // Required fields
        contact.createdAt = new Date().toISOString();
        contact.updatedAt = new Date().toISOString();
        // Insert into Supabase
        const { error } = await supabase.from('contacts').insert([contact]);
        if (error) {
          failed++;
          errors.push(error.message);
        } else {
          success++;
        }
      } catch (e: any) {
        failed++;
        errors.push(e.message);
      }
    }
    setImportResult({ success, failed, errors });
    setStep('done');
  };

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
            <button
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleImport}
            >
              Import to Supabase
            </button>
          </div>
        )}
        {step === 'import' && (
          <div className="mt-6 text-gray-500">Importing contacts...</div>
        )}
        {step === 'done' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Import Complete</h2>
            <div className="mb-2 text-green-700">Successfully imported: {importResult.success}</div>
            {importResult.failed > 0 && (
              <div className="mb-2 text-red-700">Failed: {importResult.failed}</div>
            )}
            {importResult.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600">Show Errors</summary>
                <ul className="text-xs text-red-600 list-disc ml-6">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 