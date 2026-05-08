import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { hotels, users } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/ui/DataTable'
import { IconButton } from '../../components/ui/IconButton'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PhoneInput, phoneForSubmit } from '../../components/ui/PhoneInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { Switch } from '../../components/ui/Switch'
import { formatDate } from '../../utils/format'

export function OwnerManagersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [data, setData] = useState({ data: [], totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [hotelOptions, setHotelOptions] = useState([])

  const loadManagers = async () => {
    setLoading(true)
    try {
      setData(await users.myManagers({ page, limit: 20, search }))
    } finally {
      setLoading(false)
    }
  }

  const loadHotels = async () => {
    const res = await hotels.list({ page: 1, limit: 500 })
    setHotelOptions(
      (res?.data || []).map((h) => ({
        value: h.id,
        label: h.name,
      })),
    )
  }

  useEffect(() => {
    loadManagers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  useEffect(() => {
    loadHotels()
  }, [])

  const openCreate = () => {
    setEditing({
      name: '',
      email: '',
      phone: '',
      password: '',
      assignedHotelId: '',
      isActive: true,
    })
    setOpenForm(true)
  }

  const openEdit = (u) => {
    setEditing({
      ...u,
      password: '',
      assignedHotelId: u.assignedHotelId || '',
    })
    setOpenForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!editing.assignedHotelId) return
    setBusy(true)
    try {
      const payload = {
        ...editing,
        role: 'manager',
        phone: phoneForSubmit(editing.phone) || undefined,
      }
      if (editing.id) {
        if (!payload.password) delete payload.password
        await users.updateMyManager(editing.id, payload)
        toast.success(t('managers.updatedToast'))
      } else {
        await users.createMyManager(payload)
        toast.success(t('managers.createdToast'))
      }
      setOpenForm(false)
      loadManagers()
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await users.removeMyManager(confirmId)
      toast.success(t('managers.deletedToast'))
      setConfirmId(null)
      loadManagers()
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (u) => {
    const next = !u.isActive
    setData((d) => ({
      ...d,
      data: d.data.map((row) => (row.id === u.id ? { ...row, isActive: next } : row)),
    }))
    try {
      if (next) {
        await users.activateMyManager(u.id)
      } else {
        await users.deactivateMyManager(u.id)
      }
    } catch {
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
      header: t('managers.manager'),
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{r.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{r.email}</div>
        </div>
      ),
    },
    {
      key: 'hotel',
      header: t('hotels.hotel'),
      render: (r) =>
        hotelOptions.find((h) => h.value === r.assignedHotelId)?.label || '—',
    },
    { key: 'phone', header: t('auth.phone'), render: (r) => r.phone || '—' },
    {
      key: 'isActive',
      header: t('common.status'),
      render: (r) => (
        <div className="flex items-center gap-3">
          <Switch checked={!!r.isActive} onChange={() => toggleActive(r)} srLabel="status" />
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
          <IconButton icon={Pencil} label={t('common.edit')} tone="violet" onClick={() => openEdit(r)} />
          <IconButton icon={Trash2} label={t('common.delete')} tone="rose" onClick={() => setConfirmId(r.id)} />
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('managers.title')}
        description={t('managers.subtitle')}
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            {t('managers.newManager')}
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
        searchPlaceholder={t('managers.searchPh')}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing?.id ? t('managers.editManager') : t('managers.newManager')}
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
              onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              required
            />
            <PhoneInput
              label={t('auth.phone')}
              value={editing.phone || ''}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
            />
            <Select
              label={t('rooms.selectHotel')}
              value={editing.assignedHotelId}
              onChange={(e) =>
                setEditing({ ...editing, assignedHotelId: e.target.value })
              }
              required
            >
              <option value="">{t('rooms.selectHotel')}</option>
              {hotelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Input
              label={editing.id ? t('auth.newPassword') : t('auth.password')}
              type="password"
              minLength={editing.id ? 0 : 6}
              value={editing.password}
              onChange={(e) => setEditing({ ...editing, password: e.target.value })}
              required={!editing.id}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setOpenForm(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={busy}>
                {editing.id ? t('common.saveChanges') : t('managers.newManager')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        title={t('managers.deleteTitle')}
        description={t('managers.deleteDesc')}
        confirmText={t('common.delete')}
        loading={busy}
        onCancel={() => setConfirmId(null)}
        onConfirm={remove}
      />
    </>
  )
}
