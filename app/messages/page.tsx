'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function MessagesContent() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [myId, setMyId] = useState('')
  const [threads, setThreads] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login?redirect=/messages'); return }
      setMyId(session.user.id)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*, sender:sender_id(name,avatar_url,username), receiver:receiver_id(name,avatar_url,username), listings(title)')
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false })

      // Group into threads by other person
      const seen = new Set<string>()
      const t: any[] = []
      for (const m of msgs ?? []) {
        const other = m.sender_id === session.user.id ? m.receiver : m.sender
        const otherId = m.sender_id === session.user.id ? m.receiver_id : m.sender_id
        if (!seen.has(otherId)) {
          seen.add(otherId)
          t.push({ other, otherId, lastMsg: m, listing: m.listings })
        }
      }
      setThreads(t)

      // Auto-select from URL param
      const withId = params.get('with')
      if (withId) {
        const found = t.find(th => th.otherId === withId)
        if (found) openThread(found, session.user.id)
        else {
          // New thread — fetch user
          const { data: u } = await supabase.from('users').select('name,avatar_url,username').eq('id', withId).single()
          setActiveThread({ other: u, otherId: withId, listing: null })
          setMessages([])
        }
      }
      setLoading(false)
    })
  }, [])

  const openThread = async (thread: any, uid?: string) => {
    setActiveThread(thread)
    const id = uid || myId
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(name,avatar_url,username)')
      .or(`and(sender_id.eq.${id},receiver_id.eq.${thread.otherId}),and(sender_id.eq.${thread.otherId},receiver_id.eq.${id})`)
      .order('created_at')
    setMessages(data ?? [])
    // Mark as read
    await supabase.from('messages').update({ read: true }).eq('receiver_id', id).eq('sender_id', thread.otherId)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !activeThread || sending) return
    setSending(true)
    const { data } = await supabase.from('messages').insert({
      sender_id: myId,
      receiver_id: activeThread.otherId,
      listing_id: activeThread.listing?.id ?? null,
      content: text.trim(),
    }).select('*, sender:sender_id(name,avatar_url,username)').single()
    if (data) setMessages(prev => [...prev, data])
    setText('')
    setSending(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-violet-300 animate-pulse pt-20">Loading messages...</div>

  return (
    <div className="min-h-screen pt-20 pb-4 px-4">
      <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex gap-4">

        {/* Thread list */}
        <div className="w-72 shrink-0 glass flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-black text-white text-sm">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No messages yet.<br/>Message a seller from their listing.</div>
            ) : threads.map(t => (
              <button key={t.otherId} onClick={() => openThread(t)}
                className={`w-full text-left p-4 flex items-center gap-3 transition border-b border-white/5 ${activeThread?.otherId === t.otherId ? 'bg-violet-900/30' : 'hover:bg-white/5'}`}>
                <span className="text-2xl shrink-0">{t.other?.avatar_url || '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-xs truncate">{t.other?.name}</div>
                  {t.other?.username && <div className="text-violet-400 text-[10px]">@{t.other.username}</div>}
                  <div className="text-slate-500 text-[10px] truncate mt-0.5">{t.lastMsg.content}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 glass flex flex-col overflow-hidden">
          {!activeThread ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center">
              <div><div className="text-4xl mb-3">💬</div>Select a conversation or<br/>message a seller from their listing.</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <span className="text-2xl">{activeThread.other?.avatar_url || '👤'}</span>
                <div>
                  <div className="font-bold text-white text-sm">{activeThread.other?.name}</div>
                  {activeThread.other?.username && <div className="text-violet-400 text-xs">@{activeThread.other.username}</div>}
                  {activeThread.listing && <div className="text-slate-500 text-[10px]">Re: {activeThread.listing.title}</div>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-slate-600 text-sm py-8">Start the conversation!</div>
                )}
                {messages.map(m => {
                  const mine = m.sender_id === myId
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${mine ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white/10 text-slate-200 rounded-bl-sm'}`}>
                        {m.content}
                        <div className={`text-[9px] mt-1 ${mine ? 'text-violet-300' : 'text-slate-600'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-3 border-t border-white/5 flex gap-2">
                <input
                  className="input-dark flex-1 py-2 text-sm"
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, 1000))}
                  maxLength={1000}
                />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4 py-2 text-xs disabled:opacity-50">
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-violet-300 animate-pulse">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
