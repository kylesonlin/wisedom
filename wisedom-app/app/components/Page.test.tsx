import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, describe, it } from '@jest/globals';
import '@testing-library/jest-dom';
import PageContainer from './Page';

describe('PageContainer', () => {
  it('renders children correctly', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <PageContainer title="Test Title">
        <div>Test Content</div>
      </PageContainer>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('does not render title section when no title is provided', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    );
    const container = screen.getByText('Test Content').parentElement;
    expect(container).toHaveClass('container');
  });

  it('applies correct title styling', () => {
    render(
      <PageContainer title="Test Title">
        <div>Test Content</div>
      </PageContainer>
    );
    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-bold');
  });
}); 