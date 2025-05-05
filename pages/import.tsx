import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

interface CsvRow {
  [key: string]: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Enhanced mapping dictionary for common column names
const columnMap: Record<string, string[]> = {
  // Name fields
  firstName: [
    'first name', 'firstname', 'given name', 'first', 'fname',
    'first_name', 'first-name', 'first name*', 'first*'
  ],
  lastName: [
    'last name', 'lastname', 'surname', 'family name', 'last',
    'lname', 'last_name', 'last-name', 'last name*', 'last*'
  ],
  fullName: [
    'full name', 'fullname', 'name', 'contact name', 'contact',
    'full_name', 'full-name', 'full name*', 'name*'
  ],
  
  // Contact fields
  email: [
    'email', 'e-mail', 'email address', 'emailaddress', 'email*',
    'e-mail address', 'email_addr', 'email addr', 'primary email',
    'work email', 'personal email', 'email address*'
  ],
  phone: [
    'phone', 'phone number', 'mobile', 'cell', 'telephone',
    'tel', 'phone*', 'phone number*', 'mobile number', 'cell number',
    'work phone', 'business phone', 'office phone', 'primary phone'
  ],
  secondaryPhone: [
    'secondary phone', 'alt phone', 'alternate phone', 'other phone',
    'home phone', 'personal phone', 'mobile', 'cell', 'secondary*',
    'alt*', 'alternate*', 'other*'
  ],
  
  // Professional fields
  company: [
    'company', 'organization', 'employer', 'business', 'firm',
    'company name', 'organization name', 'employer name', 'company*',
    'organization*', 'employer*', 'business*'
  ],
  title: [
    'title', 'position', 'job title', 'role', 'job',
    'job position', 'job role', 'designation', 'title*',
    'position*', 'job title*', 'role*'
  ],
  department: [
    'department', 'dept', 'division', 'team', 'group',
    'department name', 'dept name', 'division name', 'department*',
    'dept*', 'division*', 'team*'
  ],
  
  // Social/Professional profiles
  linkedin: [
    'linkedin', 'linkedin url', 'linkedin profile', 'linkedin link',
    'linkedin*', 'linkedin url*', 'linkedin profile*', 'linkedin link*',
    'linkedin.com', 'linkedin profile url'
  ],
  twitter: [
    'twitter', 'twitter handle', 'twitter username', 'twitter profile',
    'twitter*', 'twitter handle*', 'twitter username*', 'twitter profile*',
    'twitter.com', 'twitter url'
  ],
  github: [
    'github', 'github username', 'github profile', 'github url',
    'github*', 'github username*', 'github profile*', 'github url*',
    'github.com'
  ],
  
  // Location fields
  address: [
    'address', 'street address', 'mailing address', 'physical address',
    'address*', 'street address*', 'mailing address*', 'physical address*',
    'street', 'street address line 1'
  ],
  city: [
    'city', 'town', 'locality', 'city name', 'town name',
    'city*', 'town*', 'locality*', 'city name*', 'town name*'
  ],
  state: [
    'state', 'province', 'region', 'state/province', 'state name',
    'state*', 'province*', 'region*', 'state/province*', 'state name*'
  ],
  country: [
    'country', 'nation', 'country name', 'country of residence',
    'country*', 'nation*', 'country name*', 'country of residence*'
  ],
  zipCode: [
    'zip', 'zip code', 'postal code', 'postcode', 'zip/postal',
    'zip*', 'zip code*', 'postal code*', 'postcode*', 'zip/postal*'
  ],
  
  // Additional fields
  birthday: [
    'birthday', 'birth date', 'date of birth', 'dob', 'birth',
    'birthday*', 'birth date*', 'date of birth*', 'dob*', 'birth*'
  ],
  anniversary: [
    'anniversary', 'work anniversary', 'company anniversary',
    'anniversary date', 'work anniversary date', 'anniversary*',
    'work anniversary*', 'company anniversary*'
  ],
  dateOfConnection: [
    'date of connection', 'connected on', 'connection date',
    'date connected', 'first contact', 'first contact date',
    'date of connection*', 'connected on*', 'connection date*'
  ],
  notes: [
    'notes', 'comments', 'description', 'bio', 'about',
    'notes*', 'comments*', 'description*', 'bio*', 'about*'
  ],
  tags: [
    'tags', 'categories', 'labels', 'groups', 'segments',
    'tags*', 'categories*', 'labels*', 'groups*', 'segments*'
  ]
};

function autoMapHeaders(headers: string[]) {
  const mapping: { [key: string]: string | null } = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Initialize all possible fields as null
  for (const field of Object.keys(columnMap)) {
    mapping[field] = null;
  }
  
  // Map headers to fields
  for (const [field, aliases] of Object.entries(columnMap)) {
    for (const alias of aliases) {
      const idx = lowerHeaders.indexOf(alias);
      if (idx !== -1) {
        mapping[field] = headers[idx];
        break;
      }
    }
  }
  
  return mapping;
}

const contactFields = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'name', label: 'Name' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'fullName', label: 'Full Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'secondaryPhone', label: 'Secondary Phone' },
  { value: 'company', label: 'Company' },
  { value: 'title', label: 'Title' },
  { value: 'department', label: 'Department' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'github', label: 'GitHub' },
  { value: 'address', label: 'Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'country', label: 'Country' },
  { value: 'zipCode', label: 'Zip Code' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'dateOfConnection', label: 'Date of Connection' },
  { value: 'notes', label: 'Notes' },
  { value: 'tags', label: 'Tags' },
];

export default function ImportContacts() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoMapping, setAutoMapping] = useState<{ [key: string]: string | null }>({});
  const [customMapping, setCustomMapping] = useState<{ [header: string]: string }>({});
  const [step, setStep] = useState<'upload' | 'preview' | 'import' | 'done'>('upload');
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
          setAutoMapping(autoMapHeaders(results.meta.fields || []));
          const initialCustom: { [header: string]: string } = {};
          const auto = autoMapHeaders(results.meta.fields || []);
          for (const header of results.meta.fields || []) {
            // Find which field this header is mapped to
            let mapped = Object.entries(auto).find(([field, h]) => h === header)?.[0];
            initialCustom[header] = mapped || 'ignore';
          }
          setCustomMapping(initialCustom);
          setStep('preview');
        }
      },
    });
  };

  const handleImport = async () => {
    setStep('import');
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const row of csvData) {
      try {
        const contact: any = { additionalFields: {} };
        // Name logic
        if (Object.values(customMapping).includes('firstName') && Object.values(customMapping).includes('lastName')) {
          const firstHeader = Object.entries(customMapping).find(([, v]) => v === 'firstName')?.[0];
          const lastHeader = Object.entries(customMapping).find(([, v]) => v === 'lastName')?.[0];
          contact.name = `${row[firstHeader!] || ''} ${row[lastHeader!] || ''}`.trim();
        } else if (Object.values(customMapping).includes('fullName')) {
          const fullHeader = Object.entries(customMapping).find(([, v]) => v === 'fullName')?.[0];
          contact.name = row[fullHeader!];
        } else if (Object.values(customMapping).includes('firstName')) {
          const firstHeader = Object.entries(customMapping).find(([, v]) => v === 'firstName')?.[0];
          contact.name = row[firstHeader!];
        } else if (Object.values(customMapping).includes('lastName')) {
          const lastHeader = Object.entries(customMapping).find(([, v]) => v === 'lastName')?.[0];
          contact.name = row[lastHeader!];
        }
        // Standard fields
        for (const field of contactFields.map(f => f.value)) {
          if (field === 'ignore' || field === 'name' || field === 'firstName' || field === 'lastName' || field === 'fullName') continue;
          const header = Object.entries(customMapping).find(([, v]) => v === field)?.[0];
          if (header) {
            contact[field] = row[header];
          }
        }
        // Additional fields
        for (const key of headers) {
          if (!customMapping[key] || customMapping[key] === 'ignore' || contactFields.some(f => f.value === customMapping[key])) continue;
          contact.additionalFields[key] = row[key];
        }
        contact.createdAt = new Date().toISOString();
        contact.updatedAt = new Date().toISOString();
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

  const handleMappingChange = (header: string, value: string) => {
    setCustomMapping((prev) => ({ ...prev, [header]: value }));
  };

  const getMappedFieldName = (header: string) => {
    for (const [field, aliases] of Object.entries(columnMap)) {
      if (aliases.includes(header.toLowerCase())) {
        return field;
      }
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Import Contacts (CSV)</h1>
        {step === 'upload' && (
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mb-4"
            />
            <p className="text-sm text-gray-500">
              Upload a CSV file with your contacts. We'll automatically map the columns to the right fields.
            </p>
          </div>
        )}
        {fileName && <div className="mb-2 text-sm text-gray-500">Selected file: {fileName}</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {step === 'preview' && csvData.length > 0 && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Column Mapping</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {headers.map((header) => (
                    <div key={header} className="flex items-center space-x-2">
                      <span className="text-gray-600 w-40">{header}</span>
                      <span className="text-gray-400">→</span>
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={customMapping[header] || 'ignore'}
                        onChange={e => handleMappingChange(header, e.target.value)}
                      >
                        {contactFields.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Data Preview (first 5 rows)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th key={header} className="border px-2 py-1 bg-gray-100">
                          <div className="font-medium">{header}</div>
                          <div className="text-xs text-gray-500">
                            {getMappedFieldName(header) || 'Additional Field'}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {headers.map((header) => (
                          <td key={header} className="border px-2 py-1">{row[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleImport}
            >
              Import {csvData.length} Contacts
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