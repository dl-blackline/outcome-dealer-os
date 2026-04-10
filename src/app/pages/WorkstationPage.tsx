import { useState, useCallback, useEffect } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_COLUMNS,
  type WorkstationCard,
  type WorkstationColumnId,
  type QueueType,
  type CardPriority,
  listWorkstationCards,
  createWorkstationCard,
  moveWorkstationCard,
} from '@/domains/workstation'
import {
  WorkstationBoard,
  WorkstationCardDrawer,
  WorkstationFilters,
  WorkstationQuickCreate,
} from '@/components/workstation/WorkstationComponents'
import { Plus } from '@phosphor-icons/react'

export function WorkstationPage() {
  const [cards, setCards] = useState<WorkstationCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<WorkstationCard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [queueFilter, setQueueFilter] = useState<QueueType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<CardPriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const loadCards = useCallback(async () => {
    const result = await listWorkstationCards()
    if (result.ok) setCards(result.value)
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  const handleMoveCard = useCallback(async (cardId: string, toCol: WorkstationColumnId) => {
    const result = await moveWorkstationCard(cardId, toCol)
    if (result.ok) {
      setCards(prev => prev.map(c => c.id === cardId ? result.value : c))
      if (selectedCard?.id === cardId) setSelectedCard(result.value)
    }
  }, [selectedCard])

  const handleCreate = useCallback(async (partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await createWorkstationCard(partial)
    if (result.ok) setCards(prev => [result.value, ...prev])
  }, [])

  const filtered = cards.filter(c => {
    if (queueFilter !== 'all' && c.queueType !== queueFilter) return false
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Workstation" description="Your cross-department execution board" />
        <div className="text-sm text-muted-foreground">Loading workstation…</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Workstation"
        description="Your cross-department execution board"
        action={<Button size="sm" className="gap-2" onClick={() => setQuickCreateOpen(true)}><Plus className="h-4 w-4" /> New Card</Button>}
      />

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
        onMoveCard={handleMoveCard}
        onSelectCard={card => { setSelectedCard(card); setDrawerOpen(true) }}
      />

      <WorkstationCardDrawer
        card={selectedCard}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onMoveToColumn={handleMoveCard}
      />

      <WorkstationQuickCreate
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  )
}
