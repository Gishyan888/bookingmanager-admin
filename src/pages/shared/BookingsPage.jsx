import {
  CheckCircle2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { bookings, customers, rooms } from '../../api/endpoints'
import { BookingForm } from '../../components/forms/BookingForm'
import { Badge, STATUS_TONE } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/ui/DataTable'
import { IconButton } from '../../components/ui/IconButton'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { phoneForSubmit } from '../../components/ui/PhoneInput'
import { useAuth } from '../../context/AuthContext'
import { computeNights, formatAMD, formatDateTime } from '../../utils/format'

const pad = (n) => String(n).padStart(2, '0')
const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

function emptyNewCustomer() {
  return { name: '', email: '', phone: '', idDocument: '', address: '' }
}

export function BookingsPage() {
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
  const [roomList, setRoomList] = useState([])
  const [customerList, setCustomerList] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await bookings.list({ page, limit: 20, search })
      setData(res)
    } finally {
      setLoading(false)
    }
  }
  const loadOptions = async () => {
    const [r, c] = await Promise.all([
      rooms.list({ page: 1, limit: 100 }),
      customers.list({ page: 1, limit: 100 }),
    ])
    setRoomList(r.data)
    setCustomerList(c.data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])
  useEffect(() => {
    loadOptions()
  }, [])

  const openCreate = () => {
    // Hotel-style defaults: arrive today at 14:00, depart tomorrow at 12:00.
    const ci = new Date()
    ci.setHours(14, 0, 0, 0)
    const co = new Date(ci)
    co.setDate(co.getDate() + 1)
    co.setHours(12, 0, 0, 0)
    const useNewCustomer = customerList.length === 0
    setEditing({
      roomId: roomList[0]?.id ?? '',
      customerId: useNewCustomer ? '' : customerList[0]?.id ?? '',
      useNewCustomer,
      newCustomer: emptyNewCustomer(),
      checkIn: toLocalInput(ci),
      checkOut: toLocalInput(co),
      status: 'confirmed',
      notes: '',
    })
    setOpenForm(true)
  }
  const openEdit = (b) => {
    setEditing({
      id: b.id,
      roomId: b.roomId,
      customerId: b.customerId,
      useNewCustomer: false,
      newCustomer: emptyNewCustomer(),
      checkIn: toLocalInput(new Date(b.checkIn)),
      checkOut: toLocalInput(new Date(b.checkOut)),
      status: b.status,
      notes: b.notes ?? '',
    })
    setOpenForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (
      !editing.id &&
      editing.useNewCustomer &&
      (editing.newCustomer?.name?.trim().length ?? 0) < 2
    ) {
      toast.error(t('bookings.newGuestNameRequired'))
      return
    }
    setBusy(true)
    try {
      // Don't send totalAmount — backend auto-computes from room price * nights.
      let customerId = editing.customerId
      if (!editing.id && editing.useNewCustomer) {
        const nc = editing.newCustomer ?? emptyNewCustomer()
        const created = await customers.create({
          name: nc.name.trim(),
          email: nc.email?.trim() || undefined,
          phone: phoneForSubmit(nc.phone) || undefined,
          idDocument: nc.idDocument?.trim() || undefined,
          address: nc.address?.trim() || undefined,
        })
        customerId = created.id
      }
      const payload = {
        roomId: editing.roomId,
        customerId,
        checkIn: editing.checkIn,
        checkOut: editing.checkOut,
        status: editing.status,
        notes: editing.notes,
      }
      if (editing.id) {
        delete payload.roomId
        await bookings.update(editing.id, payload)
        toast.success(t('bookings.updatedToast'))
      } else {
        await bookings.create(payload)
        toast.success(t('bookings.createdToast'))
        loadOptions()
      }
      setOpenForm(false)
      load()
    } finally {
      setBusy(false)
    }
  }

  const setStatus = async (id, status) => {
    try {
      await bookings.setStatus(id, status)
      toast.success(
        t('bookings.statusToast', { status: t(`bookings.status.${status}`) }),
      )
      load()
    } catch {
      // toast handled
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await bookings.remove(confirmId)
      toast.success(t('bookings.deletedToast'))
      setConfirmId(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  const canDelete = user.role !== 'manager'

  const columns = [
    {
      key: 'customer',
      header: t('bookings.guest'),
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {r.customer?.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {r.customer?.email || r.customer?.phone || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'room',
      header: t('bookings.room'),
      render: (r) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800 dark:text-slate-100">
            {r.room?.hotel?.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            #{r.room?.roomNumber} · {t(`rooms.type_${r.room?.type ?? 'single'}`)}
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      header: t('bookings.dates'),
      render: (r) => (
        <div className="text-sm leading-snug text-slate-700 dark:text-slate-200">
          <div>{formatDateTime(r.checkIn)}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            → {formatDateTime(r.checkOut)} ·{' '}
            {t('bookings.nightCount', {
              n: computeNights(r.checkIn, r.checkOut),
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: t('bookings.amount'),
      render: (r) => formatAMD(r.totalAmount),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]}>
          {t(`bookings.status.${r.status}`)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClass: 'text-right',
      cellClass: 'text-right',
      render: (r) => (
        <div className="flex flex-wrap justify-end gap-1">
          {r.status === 'pending' && (
            <IconButton
              icon={CheckCircle2}
              label={t('bookings.actions.confirm')}
              tone="sky"
              onClick={() => setStatus(r.id, 'confirmed')}
            />
          )}
          {r.status === 'confirmed' && (
            <IconButton
              icon={LogIn}
              label={t('bookings.actions.checkIn')}
              tone="emerald"
              onClick={() => setStatus(r.id, 'checked_in')}
            />
          )}
          {r.status === 'checked_in' && (
            <IconButton
              icon={LogOut}
              label={t('bookings.actions.checkOut')}
              tone="violet"
              onClick={() => setStatus(r.id, 'checked_out')}
            />
          )}
          {!['cancelled', 'checked_out'].includes(r.status) && (
            <IconButton
              icon={XCircle}
              label={t('bookings.actions.cancel')}
              tone="rose"
              onClick={() => setStatus(r.id, 'cancelled')}
            />
          )}
          <IconButton
            icon={Pencil}
            label={t('common.edit')}
            tone="violet"
            onClick={() => openEdit(r)}
          />
          {canDelete && (
            <IconButton
              icon={Trash2}
              label={t('common.delete')}
              tone="rose"
              onClick={() => setConfirmId(r.id)}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('bookings.title')}
        description={t('bookings.subtitle')}
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            {t('bookings.newBooking')}
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
        searchPlaceholder={t('bookings.searchPh')}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing?.id ? t('bookings.editBooking') : t('bookings.newBooking')}
        size="lg"
      >
        {editing && (
          <BookingForm
            value={editing}
            rooms={roomList}
            customers={customerList}
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
        title={t('bookings.deleteTitle')}
        description={t('bookings.deleteDesc')}
        confirmText={t('common.delete')}
        loading={busy}
        onCancel={() => setConfirmId(null)}
        onConfirm={remove}
      />
    </>
  )
}
