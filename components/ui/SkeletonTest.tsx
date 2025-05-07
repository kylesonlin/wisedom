import { render } from '@testing-library/react'
import { Skeleton } from "./Skeleton"
import { cn } from '@/lib/utils'

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}))

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('custom-class')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('passes through additional props', () => {
    const { container } = render(<Skeleton data-testid="test-skeleton" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveAttribute('data-testid', 'test-skeleton')
  })

  it('renders with custom dimensions', () => {
    const { container } = render(
      <Skeleton className="h-20 w-40" />
    )
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('h-20', 'w-40')
  })
}) 