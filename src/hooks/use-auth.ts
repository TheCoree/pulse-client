import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface User {
    id: number
    username: string
    role: 'Admin' | 'User'
    is_items_corrector: boolean
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get<User>('/user/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const isCorrector = user?.is_items_corrector || user?.role === 'Admin'

    return { user, loading, isCorrector }
}
