"use client"

import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>[0]

interface CarouselProps {
  opts?: UseCarouselParameters
  plugins?: UseEmblaCarouselType[2]
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
        align: "start",
      },
      plugins
    )

    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      emblaApi?.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
      emblaApi?.scrollNext()
    }, [emblaApi])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!emblaApi) return

      onSelect(emblaApi)
      emblaApi.on("select", () => onSelect(emblaApi))
      emblaApi.on("reInit", () => onSelect(emblaApi))
    }, [emblaApi, onSelect])

    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        role="region"
        aria-roledescription="carousel"
        onKeyDownCapture={handleKeyDown}
        {...props}
      >
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {children}
          </div>
        </div>
        {canScrollPrev && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 absolute -left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white/90 hover:border-purple-300"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4 text-purple-700" />
            <span className="sr-only">Previous slide</span>
          </Button>
        )}
        {canScrollNext && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 absolute -right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white/90 hover:border-purple-300"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4 text-purple-700" />
            <span className="sr-only">Next slide</span>
          </Button>
        )}
      </div>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-roledescription="slide"
    className={cn("min-w-0 flex-shrink-0", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

export { Carousel, CarouselContent, CarouselItem }