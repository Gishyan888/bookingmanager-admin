import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { customers } from '../../api/endpoints'
import { CustomerForm } from '../../components/forms/CustomerForm'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/ui/DataTable'
import { IconButton } from '../../components/ui/IconButton'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/format'

export function CustomersPage() {
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

  const load = async () => {
    setLoading(true)
    try {
      const res = await customers.list({ page, limit: 20, search })
      setData(res)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  const openCreate = () => {
    setEditing({ name: '', email: '', phone: '', idDocument: '', address: '' })
    setOpenForm(true)
  }
  const openEdit = (c) => {
    setEditing({ ...c })
    setOpenForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (editing.id) {
        await customers.update(editing.id, editing)
        toast.success(t('customers.updatedToast'))
      } else {
        await customers.create(editing)
        toast.success(t('customers.createdToast'))
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
      await customers.remove(confirmId)
      toast.success(t('customers.deletedToast'))
      setConfirmId(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  const canWrite =
    user.role === 'admin' ||
    user.role === 'owner' ||
    user.role === 'manager'

  const columns = [
    {
      key: 'name',
      header: t('customers.customer'),
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {r.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {r.email || '—'}
          </div>
        </div>
      ),
    },
    { key: 'phone', header: t('auth.phone'), render: (r) => r.phone || '—' },
    {
      key: 'idDocument',
      header: t('customers.idDocument'),
      render: (r) => r.idDocument || '—',
    },
    {
      key: 'createdAt',
      header: t('common.created'),
      render: (r) => formatDate(r.createdAt),
    },
  ]

  if (canWrite) {
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
          <IconButton
            icon={Trash2}
            label={t('common.delete')}
            tone="rose"
            onClick={() => setConfirmId(r.id)}
          />
        </div>
      ),
    })
  }

  return (
    <>
      <PageHeader
        title={t('customers.title')}
        description={
          user?.role === 'manager'
            ? t('customers.subtitleManager')
            : t('customers.subtitle')
        }
        actions={
          canWrite && (
            <Button onClick={openCreate}>
              <Plus size={16} />
              {t('customers.newCustomer')}
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
        searchPlaceholder={t('customers.searchPh')}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={
          editing?.id ? t('customers.editCustomer') : t('customers.newCustomer')
        }
        size="lg"
      >
        {editing && (
          <CustomerForm
            value={editing}
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
        title={t('customers.deleteTitle')}
        description={t('customers.deleteDesc')}
        confirmText={t('common.delete')}
        loading={busy}
        onCancel={() => setConfirmId(null)}
        onConfirm={remove}
      />
    </>
  )
}
