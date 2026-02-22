'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import Image from 'next/image'

interface CorrectionOrderLightboxProps {
    isOpen: boolean
    onClose: () => void
    urls: string[]
    initialIndex: number
}

export function CorrectionOrderLightbox({
    isOpen,
    onClose,
    urls,
    initialIndex
}: CorrectionOrderLightboxProps) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [api, setApi] = useState<CarouselApi>()
    const containerRef = useRef<HTMLDivElement>(null)

    // Sync currentIndex when initialIndex changes (lightbox opens)
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex)
            setScale(1)
            setPosition({ x: 0, y: 0 })
        }
    }, [isOpen, initialIndex])

    useEffect(() => {
        if (!api) return

        const onSelect = () => {
            const nextIndex = api.selectedScrollSnap()
            setCurrentIndex(nextIndex)
            setScale(1)
            setPosition({ x: 0, y: 0 })
        }

        api.on("select", onSelect)
        return () => {
            api.off("select", onSelect)
        }
    }, [api])

    // Stable options to prevent carousel jitter during swipes and smooth zoom transitions
    const carouselOpts = useMemo(() => ({
        startIndex: currentIndex,
        loop: true,
        watchDrag: scale === 1,
    }), [scale === 1])

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) return
        e.preventDefault()

        const delta = e.deltaY > 0 ? -0.1 : 0.1
        const newScale = Math.min(Math.max(scale + delta, 0.5), 5)
        setScale(newScale)

        // Reset position if zoomed out to 1
        if (newScale <= 1) setPosition({ x: 0, y: 0 })
    }

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5))
    const handleZoomOut = () => {
        const newScale = Math.max(scale - 0.5, 0.5)
        setScale(newScale)
        if (newScale <= 1) setPosition({ x: 0, y: 0 })
    }
    const handleReset = () => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }

    // Panning logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return

        e.preventDefault()   // ← ВАЖНО
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return
        e.preventDefault()
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        })
    }

    const handleMouseUp = () => setIsDragging(false)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="max-w-[95vw] sm:max-w-[90vw] h-[90vh] p-0 overflow-hidden border-none bg-black/90 flex flex-col"
                onPointerLeave={handleMouseUp}
            >
                <DialogHeader className="hidden"><DialogTitle>Просмотр фото</DialogTitle></DialogHeader>

                {/* Toolbar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 rounded-full" onClick={handleZoomOut} title="Уменьшить">
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div className="text-white text-[10px] font-mono w-12 text-center">
                        {Math.round(scale * 100)}%
                    </div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 rounded-full" onClick={handleZoomIn} title="Увеличить">
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 rounded-full" onClick={handleReset} title="Сбросить">
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>

                <div
                    className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    ref={containerRef}
                >
                    {urls.length > 0 && (
                        <Carousel
                            className="w-full h-full"
                            setApi={setApi}
                            opts={carouselOpts}
                        >
                            <CarouselContent className="h-[80vh]">
                                {urls.map((url, index) => (
                                    <CarouselItem key={index} className="flex items-center justify-center pointer-events-none">
                                        <div
                                            className={`relative w-full h-full ${!isDragging ? 'transition-transform duration-200' : ''} ease-out pointer-events-auto`}
                                            style={{
                                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                            }}
                                        >
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                                                alt={`Photo ${index + 1}`}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                                draggable={false}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {urls.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-4 bg-black/40 hover:bg-black/60 border-white/10 text-white z-[60]" />
                                    <CarouselNext className="right-4 bg-black/40 hover:bg-black/60 border-white/10 text-white z-[60]" />
                                </>
                            )}
                        </Carousel>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
