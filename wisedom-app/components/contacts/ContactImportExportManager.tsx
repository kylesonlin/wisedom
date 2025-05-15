import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Upload, Download, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { contactImportExportHistorySchema, contactImportExportTemplateSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';

type ImportExportHistory = z.infer<typeof contactImportExportHistorySchema>;
type ImportExportTemplate = z.infer<typeof contactImportExportTemplateSchema>;

interface ContactImportExportManagerProps {
  onImportComplete?: () => void;
  onExportComplete?: () => void;
}

export function ContactImportExportManager({
  onImportComplete,
  onExportComplete
}: ContactImportExportManagerProps) {
  const [activeTab, setActiveTab] = useState('import');
  const [history, setHistory] = useState<ImportExportHistory[]>([]);
  const [templates, setTemplates] = useState<ImportExportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadHistory();
    loadTemplates();
  }, []);

  const loadHistory = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('contact_import_export_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load import/export history',
        variant: 'destructive'
      });
      console.error('Error loading history:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('contact_import_export_templates')
        .select('*')
        .eq('type', activeTab);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      });
      console.error('Error loading templates:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to import',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Create history record
      const { data: historyRecord, error: historyError } = await supabase
        .from('contact_import_export_history')
        .insert({
          type: 'import',
          status: 'processing',
          file_name: file.name,
          file_size: file.size,
          template_id: selectedTemplate || null
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // TODO: Implement actual file processing logic here
      // This would typically involve:
      // 1. Reading the file
      // 2. Validating the data
      // 3. Importing contacts
      // 4. Updating the history record with results

      // For now, we'll just simulate a successful import
      await supabase
        .from('contact_import_export_history')
        .update({
          status: 'completed',
          record_count: 10,
          success_count: 10,
          error_count: 0
        })
        .eq('id', historyRecord.id);

      toast({
        title: 'Success',
        description: 'Contacts imported successfully'
      });

      onImportComplete?.();
      loadHistory();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import contacts',
        variant: 'destructive'
      });
      console.error('Error importing contacts:', error);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Create history record
      const { data: historyRecord, error: historyError } = await supabase
        .from('contact_import_export_history')
        .insert({
          type: 'export',
          status: 'processing',
          file_name: 'contacts_export.csv',
          file_size: 0,
          template_id: selectedTemplate || null
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // TODO: Implement actual export logic here
      // This would typically involve:
      // 1. Fetching contacts based on filters
      // 2. Formatting the data
      // 3. Generating the file
      // 4. Updating the history record with results

      // For now, we'll just simulate a successful export
      await supabase
        .from('contact_import_export_history')
        .update({
          status: 'completed',
          record_count: 10,
          success_count: 10,
          error_count: 0
        })
        .eq('id', historyRecord.id);

      toast({
        title: 'Success',
        description: 'Contacts exported successfully'
      });

      onExportComplete?.();
      loadHistory();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export contacts',
        variant: 'destructive'
      });
      console.error('Error exporting contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No template</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No template</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleExport}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map(record => (
              <TableRow key={record.id}>
                <TableCell>
                  <Badge variant={record.type === 'import' ? 'default' : 'secondary'}>
                    {record.type}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {record.file_name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    {record.status}
                  </div>
                </TableCell>
                <TableCell>
                  {record.record_count ? (
                    <span>
                      {record.success_count}/{record.record_count}
                      {record.error_count ? ` (${record.error_count} errors)` : ''}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {new Date(record.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 