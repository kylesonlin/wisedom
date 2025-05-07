import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Layout } from '@/components/Ulayout';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Textarea,
  FormDatePicker,
  FileUpload,
  Modal,
  ModalContent,
  ModalFooter,
  Card
} from '@/components/ui';
import { validateForm, ValidationValue } from '../utils/formValidation';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Form Components',
    href: '/form-components',
  },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const notificationOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification' },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  priority: string;
  description: string;
  date: Date | null;
  notifications: string[];
  notificationType: string;
  terms: boolean;
  name: string;
  phone: string;
  role: string;
  department: string;
  bio: string;
  startDate: Date | null;
  resume: File | null;
}

const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    message: 'Password must be at least 8 characters and contain letters and numbers'
  }
};

export default function FormComponentsExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    priority: 'medium',
    description: '',
    date: null,
    notifications: ['email'],
    notificationType: 'email',
    terms: false,
    name: '',
    phone: '',
    role: '',
    department: '',
    bio: '',
    startDate: null,
    resume: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      resume: file,
    }));
  };

  const handleNotificationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      notifications: checked
        ? [...prev.notifications, value]
        : prev.notifications.filter((n) => n !== value),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationResult = validateForm({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      description: formData.description,
      date: formData.date,
      terms: formData.terms
    }, {
      firstName: { required: true, minLength: 2 },
      lastName: { required: true, minLength: 2 },
      email: validationRules.email,
      password: validationRules.password,
      confirmPassword: {
        required: true,
        custom: (value) => value === formData.password ? undefined : 'Passwords must match'
      },
      description: { required: true, minLength: 10 },
      date: { required: true },
      terms: { custom: (value) => !value ? 'You must accept the terms' : undefined }
    });

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setErrors({});
    setIsModalOpen(true);
  };

  return (
    <Layout
      navigationItems={navigationItems}
      activePath="/form-components"
      logo={<span className="text-xl font-bold">MyApp</span>}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Form Components Example</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates all form components with validation.
        </p>

        <Card className="mt-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                name="firstName"
                error={errors.firstName}
              />

              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                name="lastName"
                error={errors.lastName}
              />

              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                name="email"
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                name="password"
                error={errors.password}
                helperText="Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Enter your password again"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                name="confirmPassword"
                error={errors.confirmPassword}
              />

              <Select
                label="Priority"
                value={formData.priority}
                onChange={handleSelectChange}
                name="priority"
                options={priorityOptions}
              />

              <FormDatePicker
                label="Date"
                value={formData.date}
                onChange={handleDateChange}
                error={errors.date}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Type</label>
                <div className="space-y-2">
                  {notificationOptions.map((option) => (
                    <Radio
                      key={option.value}
                      label={option.label}
                      name="notificationType"
                      value={option.value}
                      checked={formData.notificationType === option.value}
                      onChange={handleInputChange}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Textarea
              label="Description"
              placeholder="Enter a description"
              value={formData.description}
              onChange={handleTextareaChange}
              name="description"
              error={errors.description}
            />

            <FileUpload
              label="Attachments"
              accept=".pdf,.doc,.docx"
              multiple
              maxSize={5}
              onFilesChange={setFiles}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notifications</label>
                <div className="space-y-2">
                  {notificationOptions.map((option) => (
                    <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={formData.notifications.includes(option.value)}
                      onChange={handleNotificationChange}
                      value={option.value}
                    />
                  ))}
                </div>
              </div>

              <Checkbox
                label="I agree to the terms and conditions"
                checked={formData.terms}
                onChange={handleInputChange}
                name="terms"
                error={errors.terms}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Form Submitted"
          variant="success"
        >
          <ModalContent>
            <p>Your form has been submitted successfully!</p>
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p>
                <span className="font-medium">Priority:</span>{' '}
                {formData.priority.charAt(0).toUpperCase() +
                  formData.priority.slice(1)}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formData.date ? formData.date.toISOString().split('T')[0] : ''}
              </p>
              <p>
                <span className="font-medium">Notification Type:</span>{' '}
                {formData.notificationType}
              </p>
              <p>
                <span className="font-medium">Notifications:</span>{' '}
                {formData.notifications.join(', ')}
              </p>
              <p>
                <span className="font-medium">Attachments:</span>{' '}
                {files.length} file(s)
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