"use client";

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabase';
import { Contact } from '../../types/contact';

interface BirthdaysProps {
  userId: string;
}

interface BirthdayContact extends Contact {
  daysUntilBirthday: number;
}

export default function Birthdays({ userId }: BirthdaysProps) {
  const [birthdayContacts, setBirthdayContacts] = useState<BirthdayContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBirthdays();
  }, [userId]);

  const loadBirthdays = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      
      // Load contacts with birthdays
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .not('birthday', 'is', null);
      
      if (contactsError) throw contactsError;

      // Calculate days until birthday for each contact
      const today = new Date();
      const contactsWithBirthdays: BirthdayContact[] = [];

      for (const contact of contacts || []) {
        if (!contact.birthday) continue;

        const birthday = new Date(contact.birthday);
        const nextBirthday = new Date(
          today.getFullYear(),
          birthday.getMonth(),
          birthday.getDate()
        );

        // If birthday has passed this year, calculate for next year
        if (nextBirthday < today) {
          nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const daysUntilBirthday = Math.floor(
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only include birthdays within the next 30 days
        if (daysUntilBirthday <= 30) {
          contactsWithBirthdays.push({
            ...contact,
            daysUntilBirthday
          });
        }
      }

      // Sort by days until birthday
      contactsWithBirthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
      setBirthdayContacts(contactsWithBirthdays);
    } catch (err) {
      console.error('Failed to load birthdays:', err);
      setError(err instanceof Error ? err.message : 'Failed to load birthdays');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading birthdays...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Today's Birthdays</h2>
      {birthdayContacts.length === 0 ? (
        <div className="text-gray-500">No upcoming birthdays in the next 30 days</div>
      ) : (
        <div className="space-y-3">
          {birthdayContacts.map(contact => (
            <div
              key={contact.id}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-gray-600">
                    {contact.daysUntilBirthday === 0
                      ? "Today!"
                      : contact.daysUntilBirthday === 1
                      ? "Tomorrow"
                      : `In ${contact.daysUntilBirthday} days`}
                  </p>
                  {contact.company && (
                    <p className="text-sm text-gray-500 mt-1">
                      {contact.company}
                    </p>
                  )}
                </div>
                <div className="text-sm">
                  <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-800">
                    {contact.daysUntilBirthday === 0
                      ? "🎂 Today"
                      : contact.daysUntilBirthday === 1
                      ? "🎉 Tomorrow"
                      : "🎁 Upcoming"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 