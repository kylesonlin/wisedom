import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { Contact, Interaction } from '../types/contact';
import { PriorityScore } from '../utils/contactPrioritization';
import { InteractionAnalysis } from '../utils/aiAnalysis';
import { FilterOptions, SortOptions, filterContacts, sortContacts, getFilterStats } from '../utils/contactFiltering';
import PriorityVisualization from './PriorityVisualization';
import FilterSortControls from './FilterSortControls';
import AIActionSuggestions from './AIActionSuggestions';
import { FollowUpSuggestion } from '../utils/aiAnalysis';

interface SavedView {
  id: string;
  name: string;
  filterOptions: FilterOptions;
  sortOptions: SortOptions;
  createdAt: Date;
}

interface ContactDashboardProps {
  initialView?: 'list' | 'grid' | 'timeline';
}

export default function ContactDashboard({ initialView = 'list' }: ContactDashboardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [priorityScores, setPriorityScores] = useState<Record<string, PriorityScore>>({});
  const [interactionAnalyses, setInteractionAnalyses] = useState<Record<string, InteractionAnalysis>>({});
  const [followUpSuggestions, setFollowUpSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'grid' | 'timeline'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'priority', direction: 'desc' });
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      
      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*');
      if (contactsError) throw contactsError;
      setContacts(
        (contactsData || []).map(c => ({
          ...c,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
          birthday: c.birthday ? new Date(c.birthday) : undefined
        }))
      );

      // Load interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select('*');
      if (interactionsError) throw interactionsError;
      setInteractions(
        (interactionsData || []).map(i => ({
          ...i,
          timestamp: new Date(i.timestamp),
          created_at: new Date(i.created_at),
          updated_at: new Date(i.updated_at)
        }))
      );

      // Calculate priority scores, interaction analyses, and follow-up suggestions
      const scores: Record<string, PriorityScore> = {};
      const analyses: Record<string, InteractionAnalysis> = {};
      const suggestions: FollowUpSuggestion[] = [];
      
      for (const contact of contactsData || []) {
        if (!contact.id) continue;
        const contactInteractions = interactionsData?.filter(i => i.contact_id === contact.id) || [];
        // Calculate priority score and interaction analysis here
        // This would use your existing AI analysis functions
        // Also generate follow-up suggestions
      }

      setPriorityScores(scores);
      setInteractionAnalyses(analyses);
      setFollowUpSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load saved views
  useEffect(() => {
    async function loadSavedViews() {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('saved_views')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSavedViews(data?.map(view => ({
          ...view,
          filterOptions: JSON.parse(view.filter_options),
          sortOptions: JSON.parse(view.sort_options),
          createdAt: new Date(view.created_at)
        })) || []);
      } catch (err) {
        console.error('Error loading saved views:', err);
      }
    }

    loadSavedViews();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.company?.toLowerCase().includes(searchLower) ?? false) ||
      (contact.phone?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Filter and sort contacts
  const filteredContactsList = filterContacts(contacts, interactions, filterOptions, priorityScores, interactionAnalyses);
  const sortedContacts = sortContacts(filteredContactsList, interactions, sortOptions, priorityScores, interactionAnalyses);
  const stats = getFilterStats(contacts, interactions, filterOptions, priorityScores, interactionAnalyses);

  // Save view
  const handleSaveView = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('saved_views')
        .insert({
          name: newViewName,
          filter_options: JSON.stringify(filterOptions),
          sort_options: JSON.stringify(sortOptions)
        })
        .select()
        .single();

      if (error) throw error;

      setSavedViews(prev => [{
        id: data.id,
        name: newViewName,
        filterOptions,
        sortOptions,
        createdAt: new Date()
      }, ...prev]);
      setShowSaveViewModal(false);
      setNewViewName('');
    } catch (err) {
      console.error('Error saving view:', err);
    }
  };

  // Apply saved view
  const handleApplyView = (view: SavedView) => {
    setFilterOptions(view.filterOptions);
    setSortOptions(view.sortOptions);
  };

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          <select
            value={view}
            onChange={(e) => setView(e.target.value as 'list' | 'grid' | 'timeline')}
            className="px-4 py-2 border rounded-md"
          >
            <option value="list">List View</option>
            <option value="grid">Grid View</option>
            <option value="timeline">Timeline View</option>
          </select>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No contacts found</p>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className={`p-4 bg-white rounded-lg shadow ${
                selectedContact?.id === contact.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {contact.company && (
                    <p className="text-sm text-gray-500">{contact.company}</p>
                  )}
                </div>
                {contact.importance && (
                  <div className="text-sm font-medium">
                    Priority: {contact.importance > 0.7 ? 'High' : contact.importance > 0.4 ? 'Medium' : 'Low'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedContact && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Name:</span> {selectedContact.name}</p>
              <p><span className="font-medium">Email:</span> {selectedContact.email}</p>
              {selectedContact.phone && (
                <p><span className="font-medium">Phone:</span> {selectedContact.phone}</p>
              )}
              {selectedContact.company && (
                <p><span className="font-medium">Company:</span> {selectedContact.company}</p>
              )}
              {selectedContact.title && (
                <p><span className="font-medium">Title:</span> {selectedContact.title}</p>
              )}
            </div>
            <div>
              {selectedContact.birthday && (
                <p><span className="font-medium">Birthday:</span> {selectedContact.birthday.toLocaleDateString()}</p>
              )}
              {selectedContact.notes && (
                <p><span className="font-medium">Notes:</span> {selectedContact.notes}</p>
              )}
              <p><span className="font-medium">Created:</span> {selectedContact.createdAt.toLocaleDateString()}</p>
              <p><span className="font-medium">Last Updated:</span> {selectedContact.updatedAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Priority Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>High</span>
              <span>{stats.priorityDistribution.high}</span>
            </div>
            <div className="flex justify-between">
              <span>Medium</span>
              <span>{stats.priorityDistribution.medium}</span>
            </div>
            <div className="flex justify-between">
              <span>Low</span>
              <span>{stats.priorityDistribution.low}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Average Sentiment</h3>
          <div className="text-2xl font-bold">
            {Math.round(stats.averageSentiment * 100)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Average Relationship Strength</h3>
          <div className="text-2xl font-bold">
            {Math.round(stats.averageRelationshipStrength * 100)}%
          </div>
        </div>
      </div>

      {/* Saved Views */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Saved Views</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savedViews.map(view => (
            <div key={view.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{view.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyView(view);
                  }}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Apply
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Created {view.createdAt.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Save View Modal */}
      {showSaveViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Save Current View</h2>
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="Enter view name"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSaveViewModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveView}
                disabled={!newViewName}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 