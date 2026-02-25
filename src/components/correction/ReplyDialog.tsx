'use client'

import { useState, useRef } from 'react'
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
    const fileInputRef = useRef<HTMLInputElement>(null)

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
            await onConfirm(text, photos)
            // Reset state on success
            setText('')
            setPhotos([])
            setPreviews([])
            onClose()
        } catch (error) {
            console.error('Error in ReplyDialog:', error)
        } finally {
            setIsSubmitting(false)
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

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Готово'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
