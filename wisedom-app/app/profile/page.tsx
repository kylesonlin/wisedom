'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui';
import { getProfile, updateProfile, uploadAvatar, Profile } from '@/utils/supabase';
import { validateForm } from '@/utils/formValidation';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await getProfile(user!.id);
      setProfile(data);
      setFormData({
        username: data.username,
        fullName: data.fullName,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(false);
    setSaving(true);

    try {
      const validationResult = validateForm(formData, {
        username: { required: true, minLength: 3 },
        fullName: { required: true },
      });

      if (!validationResult.isValid) {
        setError(Object.values(validationResult.errors)[0]);
        return;
      }

      await updateProfile(user!.id, formData);
      setSuccess(true);
      await loadProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const avatarUrl = await uploadAvatar(user!.id, file);
      await updateProfile(user!.id, { avatarUrl });
      await loadProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Profile Settings</h1>
        
        <div className="mb-6 flex items-center space-x-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-2xl">👤</span>
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              Change avatar
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            aria-label="Username"
            value={formData.username}
            onValueChange={(value: string) => setFormData({ ...formData, username: value })}
            data-error={error}
          />
          <Input
            aria-label="Full Name"
            value={formData.fullName}
            onValueChange={(value: string) => setFormData({ ...formData, fullName: value })}
          />
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          {success && (
            <p className="text-sm text-green-600">Profile updated successfully!</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
} 