'use client'

import { useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Type, ImagePlus, Trash2, ArrowUp, ArrowDown, File as FileIcon, Paperclip } from 'lucide-react'
import { toast } from 'sonner'

export type ContentBlock =
    | { tempId: string; type: 'text'; text: string; id?: number }
    | { tempId: string; type: 'image'; file?: File; file_url?: string; id?: number }
    | { tempId: string; type: 'file'; file?: File; file_url?: string; text?: string; id?: number }

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface Props {
    blocks: ContentBlock[]
    onChange: (updater: ContentBlock[] | ((prev: ContentBlock[]) => ContentBlock[])) => void
    onRemove?: (tempId: string) => void
    onLightboxOpen?: (urls: string[], index: number) => void
}

export default function EventContentEditor({ blocks, onChange, onRemove, onLightboxOpen }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addText = () => {
        onChange(prev => [
            ...prev,
            { tempId: crypto.randomUUID(), type: 'text', text: '' },
        ])
    }

    const openFilePicker = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (!files.length) return

        const validFiles = files.filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`Файл "${file.name}" слишком велик. Максимум 50MB`)
                return false
            }
            return true
        })

        if (!validFiles.length) return

        onChange(prev => [
            ...prev,
            ...validFiles.map(file => {
                const isImage = file.type.startsWith('image/')
                return {
                    tempId: crypto.randomUUID(),
                    type: isImage ? ('image' as const) : ('file' as const),
                    file,
                    text: !isImage ? file.name : undefined // Store filename for files
                }
            }),
        ])
        e.target.value = ''
    }

    const removeBlock = (tempId: string) => {
        if (onRemove) {
            onRemove(tempId)
        } else {
            onChange(prev => prev.filter(b => b.tempId !== tempId))
        }
    }

    const moveBlock = (tempId: string, dir: -1 | 1) => {
        onChange(prev => {
            const idx = prev.findIndex(b => b.tempId === tempId)
            if (idx < 0) return prev
            const target = idx + dir
            if (target < 0 || target >= prev.length) return prev
            const copy = [...prev]
                ;[copy[idx], copy[target]] = [copy[target], copy[idx]]
            return copy
        })
    }

    const updateText = (tempId: string, text: string) => {
        onChange(prev =>
            prev.map(b => (b.tempId === tempId && b.type === 'text' ? { ...b, text } : b))
        )
    }

    // All image preview URLs for lightbox
    const imageUrls = blocks
        .filter(b => b.type === 'image')
        .map(b => {
            if (b.type !== 'image') return ''
            if (b.file) return URL.createObjectURL(b.file)
            return b.file_url ? `${process.env.NEXT_PUBLIC_API_URL}${b.file_url}` : ''
        })
        .filter(Boolean)

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            {blocks.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                    Добавьте текст или прикрепите файлы (макс. 50MB)
                </p>
            )}

            {blocks.map((block, idx) => (
                <div key={block.tempId} className="group relative">
                    {/* Controls: shown on hover */}
                    <div className="absolute right-0 top-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 rounded-bl-md px-1 py-0.5">
                        <button
                            type="button"
                            onClick={() => moveBlock(block.tempId, -1)}
                            disabled={idx === 0}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                            <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => moveBlock(block.tempId, 1)}
                            disabled={idx === blocks.length - 1}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                            <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => removeBlock(block.tempId)}
                            className="p-1 text-destructive hover:text-destructive/80"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>

                    {block.type === 'text' && (
                        <Textarea
                            value={block.text}
                            onChange={e => updateText(block.tempId, e.target.value)}
                            placeholder="Введите текст…"
                            className="resize-none min-h-[68px] pr-20 text-sm"
                        />
                    )}

                    {block.type === 'image' && (() => {
                        const src = block.type === 'image'
                            ? block.file
                                ? URL.createObjectURL(block.file)
                                : block.file_url
                                    ? `${process.env.NEXT_PUBLIC_API_URL}${block.file_url}`
                                    : null
                            : null

                        const imgIdx = imageUrls.indexOf(src ?? '')

                        return src ? (
                            <div
                                className="relative h-36 rounded-lg overflow-hidden border border-border cursor-zoom-in"
                                onClick={() => onLightboxOpen?.(imageUrls, imgIdx)}
                            >
                                <Image src={src} alt="вложение" fill className="object-cover" unoptimized />
                            </div>
                        ) : null
                    })()}

                    {block.type === 'file' && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background border border-border">
                                <FileIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {block.file?.name || block.text || 'Документ'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {block.file ? `${(block.file.size / (1024 * 1024)).toFixed(1)} MB` : 'Файл прикреплён'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Add block buttons */}
            <div className="flex gap-2 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={addText}
                >
                    <Type className="w-3.5 h-3.5" />
                    Текст
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={openFilePicker}
                >
                    <Paperclip className="w-3.5 h-3.5" />
                    Файл / Фото
                </Button>
            </div>
        </div>
    )
}
