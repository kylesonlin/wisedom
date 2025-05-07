import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./Ubutton"
import { cn } from "@/lib/utils"

const CarouselContext = React.createContext<{
  currentSlide: number
  setCurrentSlide: (slide: number) => void
  totalSlides: number
}>({
  currentSlide: 0,
  setCurrentSlide: () => {},
  totalSlides: 0,
})

export function Carousel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const slides = React.Children.toArray(children)
  const totalSlides = slides.length

  return (
    <CarouselContext.Provider
      value={{
        currentSlide,
        setCurrentSlide,
        totalSlides,
      }}
    >
      <div
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { currentSlide } = React.useContext(CarouselContext)
  const slides = React.Children.toArray(children)

  return (
    <div
      className={cn(
        "flex transition-transform duration-500 ease-in-out",
        className
      )}
      style={{
        transform: `translateX(-${currentSlide * 100}%)`,
      }}
      {...props}
    >
      {slides}
    </div>
  )
}

export function CarouselItem({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-w-full flex-shrink-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { currentSlide, setCurrentSlide, totalSlides } = React.useContext(CarouselContext)

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute left-2 top-1/2 -translate-y-1/2",
        className
      )}
      onClick={() => setCurrentSlide((currentSlide - 1 + totalSlides) % totalSlides)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

export function CarouselNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { currentSlide, setCurrentSlide, totalSlides } = React.useContext(CarouselContext)

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2",
        className
      )}
      onClick={() => setCurrentSlide((currentSlide + 1) % totalSlides)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}
 