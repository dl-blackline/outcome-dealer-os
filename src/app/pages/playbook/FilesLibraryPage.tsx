import { useMemo, useState } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { EntryAttachment } from '@/domains/playbook'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/core/EmptyState'
import { Files, MagnifyingGlass, PaperclipHorizontal, DownloadSimple } from '@phosphor-icons/react'
import { formatDate } from './playbook.ui'

interface FileEntry {
  attachment: EntryAttachment
  entryTitle: string
  playbookTitle: string
}

export function FilesLibraryPage() {
  const rt = usePlaybookRuntime()
  const [search, setSearch] = useState('')

  const entries = useMemo(() => rt.listEntries(), [rt.version])
  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])
  const pbMap = Object.fromEntries(playbooks.map((p) => [p.id, p.title]))

  // Collect all attachments across entries
  const allFiles = useMemo(() => {
    const files: FileEntry[] = []
    for (const entry of entries) {
      for (const att of entry.attachments) {
        files.push({
          attachment: att,
          entryTitle: entry.title,
          playbookTitle: pbMap[entry.playbookId] ?? 'Unknown',
        })
      }
    }
    return files.sort((a, b) => b.attachment.uploadedAt.localeCompare(a.attachment.uploadedAt))
  }, [entries, pbMap])

  const filtered = useMemo(() => {
    if (!search.trim()) return allFiles
    const q = search.toLowerCase()
    return allFiles.filter(
      (f: FileEntry) =>
        f.attachment.name.toLowerCase().includes(q) ||
        f.entryTitle.toLowerCase().includes(q) ||
        f.playbookTitle.toLowerCase().includes(q),
    )
  }, [allFiles, search])

  function formatSize(bytes?: number): string {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Files & Library"
        description="All attached files and documents across playbooks and entries."
      />

      <div className="relative max-w-sm">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Files size={40} />}
          title="No files yet"
          description="Attach files to entries and they will appear here in the library."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ attachment, entryTitle, playbookTitle }: FileEntry) => (
            <Card key={attachment.id}>
              <CardContent className="pt-4 pb-3 space-y-2">
                <div className="flex items-start gap-3">
                  <PaperclipHorizontal className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    {attachment.mimeType && (
                      <p className="text-xs text-muted-foreground">{attachment.mimeType}</p>
                    )}
                  </div>
                  {attachment.url && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      aria-label="Download file"
                    >
                      <DownloadSimple className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Entry: {entryTitle}</p>
                  <p>Playbook: {playbookTitle}</p>
                  <p className="flex items-center justify-between">
                    <span>{formatDate(attachment.uploadedAt)}</span>
                    {attachment.sizeBytes && <span>{formatSize(attachment.sizeBytes)}</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed p-6 text-center">
        <Files className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          To attach files, open any entry in Notes and use the attachment feature.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supported: Documents, images, PDFs, and spreadsheets.
        </p>
      </div>
    </div>
  )
}
