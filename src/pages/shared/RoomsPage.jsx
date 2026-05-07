import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { hotels as hotelsApi, rooms } from '../../api/endpoints'
import { RoomForm } from '../../components/forms/RoomForm'
import { Badge, STATUS_TONE } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/ui/DataTable'
import { IconButton } from '../../components/ui/IconButton'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { formatAMD } from '../../utils/format'

export function RoomsPage({ readOnly = false }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [data, setData] = useState({ data: [], totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [hotels, setHotels] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await rooms.list({ page, limit: 20, search })
      setData(res)
    } finally {
      setLoading(false)
    }
  }
  const loadHotels = async () => {
    const res = await hotelsApi.list({ page: 1, limit: 100 })
    setHotels(res.data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])
  useEffect(() => {
    if (!readOnly) loadHotels()
  }, [readOnly])

  const openCreate = () => {
    setEditing({
      hotelId: hotels[0]?.id ?? '',
      roomNumber: '',
      type: 'single',
      price: '',
      capacity: '1',
      status: 'available',
      description: '',
    })
    setOpenForm(true)
  }
  const openEdit = (r) => {
    setEditing({
      id: r.id,
      hotelId: r.hotelId,
      roomNumber: r.roomNumber,
      type: r.type,
      price: String(Math.round(Number(r.price))),
      capacity: String(r.capacity),
      status: r.status,
      description: r.description ?? '',
    })
    setOpenForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        ...editing,
        price: Number(editing.price),
        capacity: Number(editing.capacity || 1),
      }
      if (editing.id) {
        delete payload.hotelId
        await rooms.update(editing.id, payload)
        toast.success(t('rooms.updatedToast'))
      } else {
        await rooms.create(payload)
        toast.success(t('rooms.createdToast'))
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
      await rooms.remove(confirmId)
      toast.success(t('rooms.deletedToast'))
      setConfirmId(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    {
      key: 'roomNumber',
      header: t('rooms.room'),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            #{r.roomNumber}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {r.hotel?.name ?? '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('rooms.type'),
      render: (r) => <Badge tone="violet">{t(`rooms.type_${r.type}`)}</Badge>,
    },
    { key: 'capacity', header: t('rooms.capacity') },
    {
      key: 'price',
      header: t('rooms.price'),
      render: (r) => formatAMD(r.price),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]}>
          {t(`rooms.status_${r.status}`)}
        </Badge>
      ),
    },
  ]

  if (!readOnly) {
    columns.push({
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
          {user.role !== 'manager' && (
            <IconButton
              icon={Trash2}
              label={t('common.delete')}
              tone="rose"
              onClick={() => setConfirmId(r.id)}
            />
          )}
        </div>
      ),
    })
  }

  return (
    <>
      <PageHeader
        title={t('rooms.title')}
        description={readOnly ? t('rooms.subtitleReadOnly') : t('rooms.subtitle')}
        actions={
          !readOnly && (
            <Button onClick={openCreate}>
              <Plus size={16} />
              {t('rooms.newRoom')}
            </Button>
          )
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
        searchPlaceholder={t('rooms.searchPh')}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing?.id ? t('rooms.editRoom') : t('rooms.newRoom')}
        size="lg"
      >
        {editing && (
          <RoomForm
            value={editing}
            hotels={hotels}
            isEdit={!!editing.id}
            busy={busy}
            onChange={setEditing}
            onSubmit={submit}
            onCancel={() => setOpenForm(false)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        title={t('rooms.deleteTitle')}
        description={t('rooms.deleteDesc')}
        confirmText={t('common.delete')}
        loading={busy}
        onCancel={() => setConfirmId(null)}
        onConfirm={remove}
      />
    </>
  )
}
