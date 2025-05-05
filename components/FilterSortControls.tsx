import React from 'react';
import { FilterOptions, SortOptions } from '../utils/contactFiltering';

interface FilterSortControlsProps {
  filterOptions: FilterOptions;
  sortOptions: SortOptions;
  onFilterChange: (options: FilterOptions) => void;
  onSortChange: (options: SortOptions) => void;
}

export default function FilterSortControls({
  filterOptions,
  sortOptions,
  onFilterChange,
  onSortChange
}: FilterSortControlsProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          value={filterOptions.searchTerm || ''}
          onChange={(e) => onFilterChange({ ...filterOptions, searchTerm: e.target.value })}
          placeholder="Search contacts..."
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Timeframe Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeframe
        </label>
        <div className="flex flex-wrap gap-2">
          {(['day', 'week', 'month'] as const).map((timeframe) => (
            <label key={timeframe} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterOptions.timeframes?.includes(timeframe)}
                onChange={(e) => {
                  const timeframes = filterOptions.timeframes || [];
                  const newTimeframes = e.target.checked
                    ? [...timeframes, timeframe]
                    : timeframes.filter(t => t !== timeframe);
                  onFilterChange({ ...filterOptions, timeframes: newTimeframes });
                }}
                className="rounded"
              />
              <span className="text-sm">{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority Level
        </label>
        <div className="flex flex-wrap gap-2">
          {(['high', 'medium', 'low'] as const).map((level) => (
            <label key={level} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterOptions.priorityLevels?.includes(level)}
                onChange={(e) => {
                  const levels = filterOptions.priorityLevels || [];
                  const newLevels = e.target.checked
                    ? [...levels, level]
                    : levels.filter(l => l !== level);
                  onFilterChange({ ...filterOptions, priorityLevels: newLevels });
                }}
                className="rounded"
              />
              <span className="text-sm">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Interaction Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Interaction Type
        </label>
        <div className="flex flex-wrap gap-2">
          {(['email', 'call', 'meeting', 'note'] as const).map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterOptions.interactionTypes?.includes(type)}
                onChange={(e) => {
                  const types = filterOptions.interactionTypes || [];
                  const newTypes = e.target.checked
                    ? [...types, type]
                    : types.filter(t => t !== type);
                  onFilterChange({ ...filterOptions, interactionTypes: newTypes });
                }}
                className="rounded"
              />
              <span className="text-sm">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sentiment Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sentiment Range
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={filterOptions.sentimentRange?.min || -1}
            onChange={(e) => onFilterChange({
              ...filterOptions,
              sentimentRange: {
                min: parseFloat(e.target.value),
                max: filterOptions.sentimentRange?.max || 1
              }
            })}
            className="w-full"
          />
          <span className="text-sm">{filterOptions.sentimentRange?.min || -1}</span>
          <span className="text-sm">to</span>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={filterOptions.sentimentRange?.max || 1}
            onChange={(e) => onFilterChange({
              ...filterOptions,
              sentimentRange: {
                min: filterOptions.sentimentRange?.min || -1,
                max: parseFloat(e.target.value)
              }
            })}
            className="w-full"
          />
          <span className="text-sm">{filterOptions.sentimentRange?.max || 1}</span>
        </div>
      </div>

      {/* Relationship Strength Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationship Strength
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filterOptions.relationshipStrength?.min || 0}
            onChange={(e) => onFilterChange({
              ...filterOptions,
              relationshipStrength: {
                min: parseFloat(e.target.value),
                max: filterOptions.relationshipStrength?.max || 1
              }
            })}
            className="w-full"
          />
          <span className="text-sm">{filterOptions.relationshipStrength?.min || 0}</span>
          <span className="text-sm">to</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filterOptions.relationshipStrength?.max || 1}
            onChange={(e) => onFilterChange({
              ...filterOptions,
              relationshipStrength: {
                min: filterOptions.relationshipStrength?.min || 0,
                max: parseFloat(e.target.value)
              }
            })}
            className="w-full"
          />
          <span className="text-sm">{filterOptions.relationshipStrength?.max || 1}</span>
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterOptions.hasPendingActions || false}
              onChange={(e) => onFilterChange({
                ...filterOptions,
                hasPendingActions: e.target.checked
              })}
              className="rounded"
            />
            <span className="text-sm">Has Pending Actions</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterOptions.hasScheduledFollowUps || false}
              onChange={(e) => onFilterChange({
                ...filterOptions,
                hasScheduledFollowUps: e.target.checked
              })}
              className="rounded"
            />
            <span className="text-sm">Has Scheduled Follow-ups</span>
          </label>
        </div>
      </div>

      {/* Sort Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <div className="flex flex-col space-y-2">
          <select
            value={sortOptions.field}
            onChange={(e) => onSortChange({
              ...sortOptions,
              field: e.target.value as any
            })}
            className="w-full p-2 border rounded"
          >
            <option value="priority">Priority</option>
            <option value="lastInteraction">Last Interaction</option>
            <option value="name">Name</option>
            <option value="company">Company</option>
            <option value="relationshipStrength">Relationship Strength</option>
          </select>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={sortOptions.direction === 'asc'}
                onChange={() => onSortChange({
                  ...sortOptions,
                  direction: 'asc'
                })}
                className="rounded"
              />
              <span className="text-sm">Ascending</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={sortOptions.direction === 'desc'}
                onChange={() => onSortChange({
                  ...sortOptions,
                  direction: 'desc'
                })}
                className="rounded"
              />
              <span className="text-sm">Descending</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 