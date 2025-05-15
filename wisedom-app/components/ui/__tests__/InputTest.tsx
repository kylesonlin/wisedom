import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}))

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-base', 'ring-offset-background', 'file:border-0', 'file:bg-transparent', 'file:text-sm', 'file:font-medium', 'file:text-foreground', 'placeholder:text-muted-foreground', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:cursor-not-allowed', 'disabled:opacity-50', 'md:text-sm')
  })

  it('handles text input', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'Hello World' } })
    expect(input).toHaveValue('Hello World')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toHaveClass('custom-class')
  })

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeDisabled()
  })

  it('handles different input types', () => {
    render(<Input type="password" placeholder="Enter password" />)
    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toHaveAttribute('type', 'password')
  })
}) 