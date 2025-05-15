import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Container, Typography, Button, Box, Card, CardContent } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import MainLayout from '@/components/MainLayout';
import { ContactsService, Contact } from '@/services/contacts';

const ContactsPage: NextPage = () => {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await ContactsService.getContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    router.push('/contacts/new');
  };

  const handleContactClick = (id: string) => {
    router.push(`/contacts/${id}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Loading contacts...</Typography>
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

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">Contacts</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddContact}
          >
            Add Contact
          </Button>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 3
        }}>
          {contacts.map((contact) => (
            <Card 
              key={contact.id}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => handleContactClick(contact.id)}
            >
              <CardContent>
                <Typography variant="h6">
                  {contact.first_name} {contact.last_name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {contact.email}
                </Typography>
                {contact.company && (
                  <Typography color="textSecondary">
                    {contact.company}
                    {contact.title && ` - ${contact.title}`}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </MainLayout>
  );
};

export default ContactsPage; 