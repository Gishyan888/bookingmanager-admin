import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { hotels, users } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/ui/DataTable'
import { IconButton } from '../../components/ui/IconButton'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'

export function AdminHotelsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [data, setData] = useState({ data: [], totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [ownersList, setOwnersList] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await hotels.list({ page, limit: 20, search })
      setData(res)
    } finally {
      setLoading(false)
    }
  }
  const loadOwners = async () => {
    const res = await users.listOwners({ page: 1, limit: 100 })
    setOwnersList(res.data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])
  useEffect(() => {
    loadOwners()
  }, [])

  const openCreate = () => {
    setEditing({
      name: '',
      location: '',
      description: '',
      ownerId: ownersList[0]?.id ?? '',
    })
    setOpenForm(true)
  }
  const openEdit = (h) => {
    setEditing({
      id: h.id,
      name: h.name,
      location: h.location,
      description: h.description ?? '',
      ownerId: h.ownerId ?? '',
    })
    setOpenForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        name: editing.name,
        location: editing.location,
        description: editing.description,
        ownerId: editing.ownerId || undefined,
      }
      if (editing.id) {
        await hotels.update(editing.id, payload)
        toast.success(t('hotels.updatedToast'))
      } else {
        await hotels.create(payload)
        toast.success(t('hotels.createdToast'))
      }
      setOpenForm(false)
      load()
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await hotels.remove(confirmId)
      toast.success(t('hotels.deletedToast'))
      setConfirmId(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('hotels.hotel'),
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {r.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {r.location}
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: t('owners.owner'),
      render: (r) =>
        r.owner ? (
          <div className="text-sm">
            <div className="font-medium text-slate-800 dark:text-slate-100">
              {r.owner.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {r.owner.email}
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {t('common.unassigned')}
          </span>
        ),
    },
    {
      key: 'rooms',
      header: t('hotels.rooms'),
      render: (r) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800 dark:text-slate-100">
            {r.totalRooms}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">
            {t('dashboard.available', { n: r.availableRooms })}
          </div>
        </div>
      ),
    },
    {
      key: 'bookedRooms',
      header: t('hotels.occupied'),
      render: (r) => `${r.bookedRooms}`,
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

  return (
    <>
      <PageHeader
        title={t('hotels.title')}
        description={t('hotels.subtitle')}
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            {t('hotels.newHotel')}
          </Button>
        }
      />

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
        searchPlaceholder={t('hotels.searchPh')}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing?.id ? t('hotels.editHotel') : t('hotels.newHotel')}
      >
        {editing && (
          <form className="space-y-4" onSubmit={submit}>
            <Input
              label={t('hotels.name')}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
            <Input
              label={t('hotels.location')}
              value={editing.location}
              onChange={(e) =>
                setEditing({ ...editing, location: e.target.value })
              }
              required
            />
            <Select
              label={t('owners.owner')}
              value={editing.ownerId}
              onChange={(e) =>
                setEditing({ ...editing, ownerId: e.target.value })
              }
              required
            >
              <option value="" disabled>
                {t('hotels.selectOwner')}
              </option>
              {ownersList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </Select>
            <Textarea
              label={t('hotels.description')}
              rows={3}
              value={editing.description}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
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
                {editing.id ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        title={t('hotels.deleteTitle')}
        description={t('hotels.deleteDesc')}
        confirmText={t('common.delete')}
        loading={busy}
        onCancel={() => setConfirmId(null)}
        onConfirm={remove}
      />
    </>
  )
}
