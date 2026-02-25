'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, ImagePlus, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ReplyDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (text: string, photos: File[]) => Promise<void>
    orderId: number
}

export function ReplyDialog({ isOpen, onClose, onConfirm, orderId }: ReplyDialogProps) {
    const [text, setText] = useState('')
    const [photos, setPhotos] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [compressionStatus, setCompressionStatus] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!isOpen) return

            // Check if user is typing in the textarea, we still want to allow pasting images
            const items = e.clipboardData?.items
            if (!items) return

            const imageFiles: File[] = []
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile()
                    if (file) {
                        // Create a more descriptive name if it's just 'image'
                        const fileName = file.name === 'image' ? `pasted-image-${Date.now()}-${i}.png` : file.name;
                        imageFiles.push(new File([file], fileName, { type: file.type }));
                    }
                }
            }

            if (imageFiles.length > 0) {
                if (photos.length + imageFiles.length > 7) {
                    alert('Можно прикрепить не более 7 фото')
                    return
                }

                setPhotos(prev => [...prev, ...imageFiles])
                const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
                setPreviews(prev => [...prev, ...newPreviews])
            }
        }

        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [isOpen, photos.length])

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(file);
                        return;
                    }
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length + photos.length > 7) {
            alert('Можно прикрепить не более 7 фото')
            return
        }

        const newPhotos = [...photos, ...files]
        setPhotos(newPhotos)

        const newPreviews = files.map(file => URL.createObjectURL(file))
        setPreviews(prev => [...prev, ...newPreviews])
    }

    const removePhoto = (index: number) => {
        const newPhotos = [...photos]
        newPhotos.splice(index, 1)
        setPhotos(newPhotos)

        const newPreviews = [...previews]
        URL.revokeObjectURL(newPreviews[index])
        newPreviews.splice(index, 1)
        setPreviews(newPreviews)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Сжатие перед отправкой
            const compressedPhotos: File[] = []
            if (photos.length > 0) {
                setCompressionStatus('Сжатие изображений...')
                for (let i = 0; i < photos.length; i++) {
                    setCompressionStatus(`Сжатие фото ${i + 1} из ${photos.length}...`)
                    const compressed = await compressImage(photos[i])
                    compressedPhotos.push(compressed)
                }
            }

            setCompressionStatus('Отправка данных...')
            await onConfirm(text, compressedPhotos)

            // Reset state on success
            setText('')
            setPhotos([])
            setPreviews([])
            onClose()
        } catch (error) {
            console.error('Error in ReplyDialog:', error)
        } finally {
            setIsSubmitting(false)
            setCompressionStatus(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Подтверждение заявки #{orderId}</DialogTitle>
                    <DialogDescription>
                        Вы можете добавить комментарий и фотографии, которые будут отправлены пользователю в Telegram.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reply-text">Ваш ответ (необязательно)</Label>
                        <Textarea
                            id="reply-text"
                            placeholder="Напишите пояснение для пользователя..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={512}
                            className="min-h-[100px]"
                        />
                        <div className="text-right text-[10px] text-muted-foreground">
                            {text.length}/512
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Фотографии (до 7 шт.)</Label>
                        <div className="flex flex-wrap gap-2">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-muted">
                                    <Image
                                        src={preview}
                                        alt={`Preview ${index}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {photos.length < 7 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-20 rounded-md border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                                >
                                    <ImagePlus className="w-6 h-6" />
                                    <span className="text-[10px]">Добавить</span>
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {compressionStatus && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {compressionStatus}
                        </div>
                    )}
                    <div className="flex gap-2 justify-end w-full sm:w-auto">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Отмена
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Готово'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
