import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { users } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/ui/DataTable'
import { IconButton } from '../../components/ui/IconButton'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { NumberInput } from '../../components/ui/NumberInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { Switch } from '../../components/ui/Switch'
import { formatDate } from '../../utils/format'

const ROLE = 'owner'

export function OwnersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [data, setData] = useState({ data: [], totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20, search }
      if (filter !== 'all') params.status = filter
      setData(await users.listOwners(params))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, filter])

  const openCreate = () => {
    setEditing({ name: '', email: '', phone: '', password: '' })
    setOpenForm(true)
  }
  const openEdit = (u) => {
    setEditing({ ...u, password: '' })
    setOpenForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (editing.id) {
        const payload = { ...editing, role: ROLE }
        if (!payload.password) delete payload.password
        await users.update(editing.id, payload)
        toast.success(t('owners.updatedToast'))
      } else {
        await users.create({ ...editing, role: ROLE, isActive: true })
        toast.success(t('owners.createdToast'))
      }
      setOpenForm(false)
      load()
    } catch {
      // toast handled by axios interceptor
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await users.remove(confirmId)
      toast.success(t('owners.deletedToast'))
      setConfirmId(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  // Optimistic switch — flip locally, then call API.
  const toggleActive = async (u) => {
    const next = !u.isActive
    setData((d) => ({
      ...d,
      data: d.data.map((row) =>
        row.id === u.id ? { ...row, isActive: next } : row,
      ),
    }))
    try {
      if (next) {
        await users.activate(u.id)
        toast.success(t('owners.activatedToast'))
      } else {
        await users.deactivate(u.id)
        toast.success(t('owners.deactivatedToast'))
      }
    } catch {
      // revert on failure
      setData((d) => ({
        ...d,
        data: d.data.map((row) =>
          row.id === u.id ? { ...row, isActive: u.isActive } : row,
        ),
      }))
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('owners.owner'),
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {r.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {r.email}
          </div>
        </div>
      ),
    },
    { key: 'phone', header: t('auth.phone'), render: (r) => r.phone || '—' },
    {
      key: 'isActive',
      header: t('common.status'),
      render: (r) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={!!r.isActive}
            onChange={() => toggleActive(r)}
            srLabel={
              r.isActive ? t('owners.deactivate') : t('owners.activate')
            }
          />
          <span
            className={
              r.isActive
                ? 'text-xs font-medium text-emerald-600 dark:text-emerald-400'
                : 'text-xs font-medium text-slate-400 dark:text-slate-500'
            }
          >
            {r.isActive ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.joined'),
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: 'actions',
      header: '',
      headerClass: 'text-right',
      cellClass: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <IconButton
            icon={Pencil}
            label={t('common.edit')}
            tone="violet"
            onClick={() => openEdit(r)}
          />
          <IconButton
            icon={Trash2}
            label={t('common.delete')}
            tone="rose"
            onClick={() => setConfirmId(r.id)}
          />
        </div>
      ),
    },
  ]

  const filterPills = [
    { id: 'all', label: t('owners.filterAll') },
    { id: 'active', label: t('owners.filterActive') },
    { id: 'inactive', label: t('owners.filterInactive') },
  ]

  return (
    <>
      <PageHeader
        title={t('owners.title')}
        description={t('owners.subtitle')}
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            {t('owners.newOwner')}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {filterPills.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setFilter(p.id)
              setPage(1)
            }}
            className={
              filter === p.id
                ? 'rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm'
                : 'rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data.data}
        loading={loading}
        page={page}
        totalPages={data.totalPages}
        total={data.total}
        onPageChange={setPage}
        onSearch={(v) => {
          setPage(1)
          setSearch(v)
        }}
        searchPlaceholder={t('owners.searchPh')}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing?.id ? t('owners.editOwner') : t('owners.newOwner')}
      >
        {editing && (
          <form className="space-y-4" onSubmit={submit}>
            <Input
              label={t('auth.fullName')}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
            <Input
              label={t('auth.email')}
              type="email"
              value={editing.email}
              onChange={(e) =>
                setEditing({ ...editing, email: e.target.value })
              }
              required
            />
            <NumberInput
              label={t('auth.phone')}
              value={editing.phone || ''}
              onChange={(e) =>
                setEditing({ ...editing, phone: e.target.value })
              }
              placeholder="37499000000"
            />
            <Input
              label={editing.id ? t('auth.newPassword') : t('auth.password')}
              type="password"
              minLength={editing.id ? 0 : 6}
              value={editing.password}
              onChange={(e) =>
                setEditing({ ...editing, password: e.target.value })
              }
              required={!editing.id}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setOpenForm(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={busy}>
                {editing.id ? t('common.saveChanges') : t('owners.newOwner')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        title={t('owners.deleteTitle')}
        description={t('owners.deleteDesc')}
        confirmText={t('common.delete')}
        loading={busy}
        onCancel={() => setConfirmId(null)}
        onConfirm={remove}
      />
    </>
  )
}
