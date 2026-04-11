import { useState, useCallback } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Button } from '@/components/ui/button'
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
import { Plus } from '@phosphor-icons/react'

export function WorkstationPage() {
  const { cards, moveCard, createCard, completeCard, reopenCard } = useWorkstationMutations()
  const [selectedCard, setSelectedCard] = useState<WorkstationCard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [queueFilter, setQueueFilter] = useState<QueueType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<CardPriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleMoveCard = useCallback((cardId: string, toCol: WorkstationColumnId) => {
    moveCard(cardId, toCol)
    if (selectedCard?.id === cardId) {
      setSelectedCard(prev => prev ? { ...prev, columnId: toCol, status: toCol === 'done' ? 'completed' : prev.status === 'completed' ? 'reopened' : prev.status ?? 'active' } : null)
    }
  }, [selectedCard])

  const reorderCards = useCallback((draggedCardId: string, targetCardId: string, columnId: WorkstationColumnId) => {
    setCards(prev => {
      const draggedCard = prev.find(c => c.id === draggedCardId)
      if (!draggedCard) return prev

      const otherCards = prev.filter(c => c.id !== draggedCardId)
      const columnCards = otherCards.filter(c => c.columnId === columnId)
      const targetIndex = columnCards.findIndex(c => c.id === targetCardId)

      if (targetIndex === -1) return prev

      const updatedCard = { ...draggedCard, columnId, updatedAt: new Date().toISOString() }
      const beforeTarget = columnCards.slice(0, targetIndex + 1)
      const afterTarget = columnCards.slice(targetIndex + 1)

      const reorderedColumnCards = [...beforeTarget, updatedCard, ...afterTarget]
      const otherColumnCards = otherCards.filter(c => c.columnId !== columnId)

      return [...otherColumnCards, ...reorderedColumnCards]
    })
  }, [])

  const handleCreate = useCallback((partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const card: WorkstationCard = {
      ...partial,
      id: `wc-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    setCards(prev => [card, ...prev])
  }, [])

  const filtered = cards.filter(c => {
    if (queueFilter !== 'all' && c.queueType !== queueFilter) return false
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

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
