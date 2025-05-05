import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
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
  initialView?: SavedView;
}

export default function ContactDashboard({ initialView }: ContactDashboardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [priorityScores, setPriorityScores] = useState<Record<string, PriorityScore>>({});
  const [interactionAnalyses, setInteractionAnalyses] = useState<Record<string, InteractionAnalysis>>({});
  const [followUpSuggestions, setFollowUpSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialView?.filterOptions || {});
  const [sortOptions, setSortOptions] = useState<SortOptions>(initialView?.sortOptions || { field: 'priority', direction: 'desc' });
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        
        // Load contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*');
        if (contactsError) throw contactsError;
        setContacts(contactsData || []);

        // Load interactions
        const { data: interactionsData, error: interactionsError } = await supabase
          .from('interactions')
          .select('*');
        if (interactionsError) throw interactionsError;
        setInteractions(interactionsData || []);

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
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Load saved views
  useEffect(() => {
    async function loadSavedViews() {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
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

  // Filter and sort contacts
  const filteredContacts = filterContacts(contacts, interactions, filterOptions, priorityScores, interactionAnalyses);
  const sortedContacts = sortContacts(filteredContacts, interactions, sortOptions, priorityScores, interactionAnalyses);
  const stats = getFilterStats(contacts, interactions, filterOptions, priorityScores, interactionAnalyses);

  // Save view
  const handleSaveView = async () => {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contact Dashboard</h1>
        <button
          onClick={() => setShowSaveViewModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Current View
        </button>
      </div>

      {/* Filter and Sort Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <FilterSortControls
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            onFilterChange={setFilterOptions}
            onSortChange={setSortOptions}
          />
        </div>
      </div>

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
                  onClick={() => handleApplyView(view)}
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

      {/* Contact List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Contacts ({sortedContacts.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedContacts.map(contact => (
            <div key={contact.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.company}</p>
                </div>
                <PriorityVisualization
                  priorityScore={priorityScores[contact.id!]}
                  interactionAnalysis={interactionAnalyses[contact.id!]}
                />
              </div>
              <div className="mt-4">
                <AIActionSuggestions
                  contact={contact}
                  interactions={interactions.filter(i => i.contact_id === contact.id)}
                  priorityScore={priorityScores[contact.id!]}
                  interactionAnalysis={interactionAnalyses[contact.id!]}
                  followUpSuggestions={followUpSuggestions.filter(s => s.contactId === contact.id)}
                />
              </div>
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