-- Create import/export history table
CREATE TABLE contact_import_export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('import', 'export')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    record_count INTEGER,
    success_count INTEGER,
    error_count INTEGER,
    error_details JSONB,
    template_id UUID REFERENCES contact_import_export_templates(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create import/export templates table
CREATE TABLE contact_import_export_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('import', 'export')),
    field_mappings JSONB NOT NULL,
    filters JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_contact_import_export_history_user_id ON contact_import_export_history(userId);
CREATE INDEX idx_contact_import_export_history_type ON contact_import_export_history(type);
CREATE INDEX idx_contact_import_export_history_status ON contact_import_export_history(status);
CREATE INDEX idx_contact_import_export_history_created_at ON contact_import_export_history(created_at);

CREATE INDEX idx_contact_import_export_templates_user_id ON contact_import_export_templates(userId);
CREATE INDEX idx_contact_import_export_templates_type ON contact_import_export_templates(type);

-- Enable Row Level Security
ALTER TABLE contact_import_export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_import_export_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own import/export history"
    ON contact_import_export_history
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own import/export history"
    ON contact_import_export_history
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own import/export history"
    ON contact_import_export_history
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own import/export history"
    ON contact_import_export_history
    FOR DELETE
    USING (auth.uid() = userId);

CREATE POLICY "Users can view their own templates"
    ON contact_import_export_templates
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own templates"
    ON contact_import_export_templates
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own templates"
    ON contact_import_export_templates
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own templates"
    ON contact_import_export_templates
    FOR DELETE
    USING (auth.uid() = userId);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contact_import_export_history_updated_at
    BEFORE UPDATE ON contact_import_export_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_import_export_templates_updated_at
    BEFORE UPDATE ON contact_import_export_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 