import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Radio } from '../components/ui/Radio';
import { Textarea } from '../components/ui/Textarea';
import { DatePicker } from '../components/ui/DatePicker';
import { FileUpload } from '../components/ui/FileUpload';
import { Modal, ModalContent, ModalFooter } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { validateForm, validationRules } from '../utils/formValidation';

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

export default function FormComponentsExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    priority: 'medium',
    description: '',
    date: '',
    notifications: ['email'],
    notificationType: 'email',
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = validateForm(formData, {
      firstName: { required: true, minLength: 2 },
      lastName: { required: true, minLength: 2 },
      email: validationRules.email,
      password: validationRules.password,
      description: { required: true, minLength: 10 },
      date: { required: true },
      terms: { custom: (value) => !value ? 'You must accept the terms' : undefined },
    });

    setErrors(validationResult.errors);

    if (validationResult.isValid) {
      setIsModalOpen(true);
    }
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
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                error={errors.firstName}
              />

              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                error={errors.lastName}
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

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
                helperText="Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
              />

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                options={priorityOptions}
              />

              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notificationType: e.target.value,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <Textarea
              label="Description"
              placeholder="Enter a description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
                      onChange={(e) => {
                        const newNotifications = e.target.checked
                          ? [...formData.notifications, option.value]
                          : formData.notifications.filter(
                              (n) => n !== option.value
                            );
                        setFormData({
                          ...formData,
                          notifications: newNotifications,
                        });
                      }}
                    />
                  ))}
                </div>
              </div>

              <Checkbox
                label="I agree to the terms and conditions"
                checked={formData.terms}
                onChange={(e) =>
                  setFormData({ ...formData, terms: e.target.checked })
                }
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
                <span className="font-medium">Date:</span> {formData.date}
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