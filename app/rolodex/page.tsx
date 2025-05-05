import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function RolodexPage() {
  // Fetch all contacts
  const { data: contacts, error } = await supabase.from('contacts').select('*');
  if (error) {
    return <div className="p-4 text-red-600">Error loading contacts: {error.message}</div>;
  }
  if (!contacts || contacts.length === 0) {
    return <div className="p-4">No contacts found.</div>;
  }

  // Collect all unique keys (including additionalFields)
  const allKeys = new Set<string>();
  contacts.forEach(contact => {
    Object.keys(contact).forEach(k => {
      if (k !== 'additionalFields') allKeys.add(k);
    });
    if (contact.additionalFields && typeof contact.additionalFields === 'object') {
      Object.keys(contact.additionalFields).forEach(k => allKeys.add(k));
    }
  });
  const columns = Array.from(allKeys);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rolodex</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} className="border px-2 py-1 bg-gray-100">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, i) => (
              <tr key={contact.id || i}>
                {columns.map(col => (
                  <td key={col} className="border px-2 py-1 text-xs">
                    {col in contact
                      ? String(contact[col] ?? '')
                      : contact.additionalFields && contact.additionalFields[col]
                        ? String(contact.additionalFields[col])
                        : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 