import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { contactImportExportTemplateSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';

type ImportExportTemplate = z.infer<typeof contactImportExportTemplateSchema>;

interface ContactImportExportTemplateManagerProps {
  type: 'import' | 'export';
  onTemplateSelect?: (template: ImportExportTemplate) => void;
}

export function ContactImportExportTemplateManager({
  type,
  onTemplateSelect
}: ContactImportExportTemplateManagerProps) {
  const [templates, setTemplates] = useState<ImportExportTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ImportExportTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    field_mappings: {} as Record<string, string>,
    filters: {} as Record<string, any>
  });

  useEffect(() => {
    loadTemplates();
  }, [type]);

  const loadTemplates = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('contact_import_export_templates')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const templateData = {
        ...formData,
        type
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('contact_import_export_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Template updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('contact_import_export_templates')
          .insert(templateData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Template created successfully'
        });
      }

      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        field_mappings: {},
        filters: {}
      });
      loadTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: ImportExportTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      field_mappings: template.field_mappings,
      filters: template.filters || {}
    });
  };

  const handleDelete = async (template: ImportExportTemplate) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('contact_import_export_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      });
      loadTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Template Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter template description"
            />
          </div>

          <div className="flex justify-end gap-2">
            {editingTemplate && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingTemplate(null);
                  setFormData({
                    name: '',
                    description: '',
                    field_mappings: {},
                    filters: {}
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Templates</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map(template => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(template.field_mappings).map(field => (
                      <Badge key={field} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(template.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 