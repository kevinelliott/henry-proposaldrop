'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { business_name: businessName } }
    })
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-gray-400 mt-1">Start sending professional proposals in 60 seconds</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Business Name</label>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required placeholder="e.g. Thompson Contracting"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account — It\'s Free'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Log in</Link>
        </p>
      </div>
    </div>
  )
}
