import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import { ContactForm } from '@/components/contacts/ContactForm';
import { ContactsService, Contact } from '@/services/contacts';

const ContactPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      const data = await ContactsService.getContactById(id as string);
      setContact(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/contacts');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmit = () => {
    setIsEditing(false);
    fetchContact();
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error">{error}</Typography>
        </Container>
      </MainLayout>
    );
  }

  if (!contact) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Contact not found</Typography>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4">
              {contact.first_name} {contact.last_name}
            </Typography>
          </Box>
          {!isEditing && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Contact
            </Button>
          )}
        </Box>

        {isEditing ? (
          <ContactForm
            mode="edit"
            initialData={contact}
            onSubmit={handleSubmit}
          />
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {contact.email}
            </Typography>
            {contact.phone && (
              <Typography variant="body1" gutterBottom>
                <strong>Phone:</strong> {contact.phone}
              </Typography>
            )}
            {contact.company && (
              <Typography variant="body1" gutterBottom>
                <strong>Company:</strong> {contact.company}
                {contact.title && ` - ${contact.title}`}
              </Typography>
            )}
            {contact.notes && (
              <Typography variant="body1" gutterBottom>
                <strong>Notes:</strong><br />
                {contact.notes}
              </Typography>
            )}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Created: {new Date(contact.created_at).toLocaleDateString()}
              <br />
              Last updated: {new Date(contact.updated_at).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default ContactPage; 