import { useState, useCallback } from 'react'
import {
  DEFAULT_COLUMNS,
  type WorkstationCard,
  type WorkstationColumnId,
  type QueueType,
  type CardPriority,
} from '@/domains/workstation'
import { useWorkstationMutations } from '@/domains/workstation/workstation.hooks'
import {
  WorkstationBoard,
  WorkstationCardDrawer,
  WorkstationFilters,
  WorkstationQuickCreate,
} from '@/components/workstation/WorkstationComponents'
import { Plus, SpinnerGap } from '@phosphor-icons/react'

export function WorkstationPage() {
  const { cards, loading, moveCard, createCard, completeCard, reopenCard } = useWorkstationMutations()
  const [selectedCard, setSelectedCard] = useState<WorkstationCard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [queueFilter, setQueueFilter] = useState<QueueType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<CardPriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleMoveCard = useCallback((cardId: string, toCol: WorkstationColumnId) => {
    moveCard(cardId, toCol)
    if (selectedCard?.id === cardId) {
      setSelectedCard(prev => prev ? { ...prev, columnId: toCol } : null)
    }
  }, [selectedCard, moveCard])

  const reorderCards = useCallback((_draggedCardId: string, _targetCardId: string, _columnId: WorkstationColumnId) => {
    // Visual reorder is not persisted — the data model has no ordering field.
    // Drag-and-drop reordering will persist once an explicit sort_order column is added.
  }, [])

  const filtered = cards.filter(c => {
    if (queueFilter !== 'all' && c.queueType !== queueFilter) return false
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header — bold mockup-style */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-6" style={{
        background: 'linear-gradient(112deg, #0C0E13 0%, #0F1318 60%, #0A0C10 100%)',
        border: '1px solid rgba(251,191,36,0.18)',
        boxShadow: '0 0 60px rgba(251,191,36,0.04)',
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #f59e0b 0%, #E31B37 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #f59e0b 0%, rgba(251,191,36,0.3) 40%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(251,191,36,0.06) 0%, transparent 60%)' }} />
        <div className="relative flex items-start justify-between">
          <div className="pl-3">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: '#fbbf24' }}>National Car Mart · Dealer OS</div>
            <h1 className="text-3xl font-black uppercase text-white leading-none sm:text-4xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif', letterSpacing: '0.04em' }}>WORKSTATION</h1>
            <p className="text-[0.78rem] mt-1.5 font-medium" style={{ color: 'rgba(192,195,199,0.55)' }}>Your cross-department execution board · {cards.length} active cards</p>
          </div>
          <button
            onClick={() => setQuickCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] font-bold text-white transition-all hover:brightness-115 hover:scale-[1.02] shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 16px rgba(245,158,11,0.45)' }}
          >
            <Plus className="h-4 w-4" /> New Card
          </button>
        </div>
      </div>

      <WorkstationFilters
        queueFilter={queueFilter}
        priorityFilter={priorityFilter}
        searchTerm={searchTerm}
        onQueueChange={setQueueFilter}
        onPriorityChange={setPriorityFilter}
        onSearchChange={setSearchTerm}
      />

      <WorkstationBoard
        cards={filtered}
        columns={DEFAULT_COLUMNS}
        onMoveCard={moveCard}
        onReorderCards={reorderCards}
        onSelectCard={card => { setSelectedCard(card); setDrawerOpen(true) }}
      />

      <WorkstationCardDrawer
        card={selectedCard}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onMoveToColumn={handleMoveCard}
        onComplete={completeCard}
        onReopen={reopenCard}
      />

      <WorkstationQuickCreate
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        onCreate={createCard}
      />
    </div>
  )
}
