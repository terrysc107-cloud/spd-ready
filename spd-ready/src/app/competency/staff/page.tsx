import Link from 'next/link'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getOrgStaff, getDepartments } from '@/lib/dal/org'
import { getStaffCompetencyRollup, type StaffRollup } from '@/lib/dal/competency-overview'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { toneClasses, type Tone } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import { UsersIcon, ChevronRightIcon } from 'lucide-react'

function Chip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', toneClasses[tone])}>
      {children}
    </span>
  )
}

function Rollup({ r }: { r?: StaffRollup }) {
  if (!r || r.total === 0) return <span className="text-xs text-muted-foreground">No competencies</span>
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:justify-start">
      {r.validated > 0 && <Chip tone="green">{r.validated} validated</Chip>}
      {r.ready > 0 && <Chip tone="accent">{r.ready} ready</Chip>}
      {r.inTraining > 0 && <Chip tone="gold">{r.inTraining} training</Chip>}
      {r.overdue > 0 && <Chip tone="red">{r.overdue} overdue</Chip>}
    </div>
  )
}

type StaffRow = { id: string; name: string; role: string; dept: string }

export default async function StaffPage() {
  await requireAppRole(MANAGER_ROLES)
  const [staff, departments, rollups] = await Promise.all([
    getOrgStaff(),
    getDepartments(),
    getStaffCompetencyRollup(),
  ])
  const deptName = new Map(departments.map((d) => [d.id, d.name]))

  const rows: StaffRow[] = staff.map((s) => ({
    id: s.id,
    name: s.name ?? '—',
    role: s.role,
    dept: deptName.get(s.department_id ?? '') ?? 'No department',
  }))

  const columns: Column<StaffRow>[] = [
    {
      key: 'name',
      header: 'Staff',
      cell: (r) => (
        <Link href={`/competency/staff/${r.id}`} className="font-medium hover:text-primary hover:underline">
          {r.name}
        </Link>
      ),
    },
    { key: 'dept', header: 'Department', cell: (r) => <span className="text-muted-foreground">{r.dept}</span> },
    {
      key: 'role',
      header: 'Role',
      cell: (r) => <Badge variant="secondary" className="capitalize">{r.role}</Badge>,
      hideOnMobile: true,
    },
    { key: 'readiness', header: 'Readiness', cell: (r) => <Rollup r={rollups.get(r.id)} /> },
    {
      key: 'go',
      header: '',
      className: 'text-right',
      hideOnMobile: true,
      cell: (r) => (
        <Link href={`/competency/staff/${r.id}`} className="inline-flex text-muted-foreground hover:text-foreground">
          <ChevronRightIcon className="size-4" />
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Everyone in your department. Track competency readiness and validate sign-offs."
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        empty={
          <EmptyState
            icon={UsersIcon}
            title="No staff yet"
            description="Seed a demo org or invite staff to start tracking competency."
          />
        }
      />
    </div>
  )
}
