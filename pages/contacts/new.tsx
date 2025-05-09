import React from 'react';
import { NextPage } from 'next';
import { Container } from '@mui/material';
import { ContactForm } from '@/components/contacts/ContactForm';
import MainLayout from '@/components/MainLayout';

const NewContactPage: NextPage = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ContactForm />
      </Container>
    </MainLayout>
  );
};

export default NewContactPage; 