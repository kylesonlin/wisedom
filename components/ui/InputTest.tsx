import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'
import { cn } from '@/lib/utils'

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}))

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex h-10 w-full rounded-md border border-input bg-background')
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