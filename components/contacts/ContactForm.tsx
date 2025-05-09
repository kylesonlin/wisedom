import React, { useState } from 'react';
import { Box, Button, TextField, Grid, Typography, Snackbar, Alert } from '@mui/material';
import { ContactsService, Contact, CreateContactInput } from '@/services/contacts';

interface ContactFormProps {
  onSubmit?: (contact: Contact) => void;
  initialData?: Contact;
  mode?: 'create' | 'edit';
}

export const ContactForm: React.FC<ContactFormProps> = ({ 
  onSubmit,
  initialData,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<CreateContactInput>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    title: initialData?.title || '',
    notes: initialData?.notes || '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let contact: Contact;
      
      if (mode === 'create') {
        contact = await ContactsService.createContact(formData);
      } else {
        contact = await ContactsService.updateContact({
          id: initialData!.id,
          ...formData
        });
      }

      setSuccess(true);
      if (onSubmit) onSubmit(contact);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid sx={{ width: '100%' }}>
          <Typography variant="h6">
            {mode === 'create' ? 'Create New Contact' : 'Edit Contact'}
          </Typography>
        </Grid>

        <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </Grid>

        <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </Grid>

        <Grid sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Grid>

        <Grid sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>

        <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
          <TextField
            fullWidth
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </Grid>

        <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </Grid>

        <Grid sx={{ width: '100%' }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>

        <Grid sx={{ width: '100%' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            {mode === 'create' ? 'Create Contact' : 'Save Changes'}
          </Button>
        </Grid>
      </Grid>

      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Contact successfully {mode === 'create' ? 'created' : 'updated'}!
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 