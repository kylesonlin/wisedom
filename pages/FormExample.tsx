import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal, ModalContent, ModalFooter } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Forms',
    href: '/forms',
  },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function FormExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsModalOpen(true);
    }
  };

  return (
    <Layout
      navigationItems={navigationItems}
      activePath="/forms"
      logo={<span className="text-xl font-bold">MyApp</span>}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Form Example</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates the Input, Select, and Modal components.
        </p>

        <Card className="mt-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              options={priorityOptions}
            />

            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Form Submitted"
        >
          <ModalContent>
            <p>Your form has been submitted successfully!</p>
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-medium">Name:</span> {formData.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p>
                <span className="font-medium">Priority:</span>{' '}
                {formData.priority.charAt(0).toUpperCase() +
                  formData.priority.slice(1)}
              </p>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </Layout>
  );
} 