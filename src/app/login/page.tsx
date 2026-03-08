'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">PD</div>
            <span className="text-xl font-bold">ProposalDrop</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-400 mt-1">Log in to manage your proposals</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account? <Link href="/signup" className="text-blue-400 hover:text-blue-300">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
