import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface TaskRow extends DbRow {
  title: string
  description?: string
  assigned_to: string
  assigned_to_user_id?: UUID
  assigned_by_user_id?: UUID
  linked_entity_type?: string
  linked_entity_id?: UUID
  due_date: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completed_at?: string
}

export interface Task {
  id: UUID
  title: string
  description?: string
  assignedTo: string
  assignedToUserId?: UUID
  assignedByUserId?: UUID
  linkedEntityType?: string
  linkedEntityId?: UUID
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  assignedTo: string
  assignedToUserId?: UUID
  assignedByUserId?: UUID
  linkedEntityType?: string
  linkedEntityId?: UUID
  dueDate: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  assignedTo?: string
  assignedToUserId?: UUID
  linkedEntityType?: string
  linkedEntityId?: UUID
  dueDate?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export function mapTaskRowToDomain(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assignedTo: row.assigned_to,
    assignedToUserId: row.assigned_to_user_id,
    assignedByUserId: row.assigned_by_user_id,
    linkedEntityType: row.linked_entity_type,
    linkedEntityId: row.linked_entity_id,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}
