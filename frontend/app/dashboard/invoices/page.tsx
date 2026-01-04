'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DollarSign, Plus, Edit2, CheckCircle, XCircle, Calendar, User, FileText, Loader2, X } from 'lucide-react'
import api from '@/lib/api'

interface Invoice {
  id: string
  userId: string
  bookingId?: string
  classId?: string
  description: string
  amount: number
  dueDate: string
  paidDate?: string | null
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  user: {
    id: string
    name: string
    email: string
  }
  booking?: {
    id: string
    court: {
      id: string
      name: string
    }
    date: string
    startTime: string
  } | null
  class?: {
    id: string
    name: string
  } | null
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    userId: '',
    description: '',
    amount: '',
    dueDate: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchInvoices()
    fetchUsers()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await api.get<Invoice[]>(`${apiUrl}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setInvoices(response.data)
    } catch (error) {
      console.error('Erro ao carregar faturas:', error)
      alert('Erro ao carregar faturas')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.userId || !formData.description || !formData.amount || !formData.dueDate) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await api.post(
        `${apiUrl}/invoices`,
        {
          userId: formData.userId,
          description: formData.description,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowCreateModal(false)
      setFormData({ userId: '', description: '', amount: '', dueDate: '' })
      fetchInvoices()
      alert('Fatura criada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar fatura:', error)
      alert(error.response?.data?.message || 'Erro ao criar fatura')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setFormData({
      userId: invoice.userId,
      description: invoice.description,
      amount: invoice.amount.toString(),
      dueDate: invoice.dueDate.split('T')[0],
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingInvoice) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await api.patch(
        `${apiUrl}/invoices/${editingInvoice.id}`,
        {
          description: formData.description,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowEditModal(false)
      setEditingInvoice(null)
      setFormData({ userId: '', description: '', amount: '', dueDate: '' })
      fetchInvoices()
      alert('Fatura atualizada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar fatura:', error)
      alert(error.response?.data?.message || 'Erro ao atualizar fatura')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('Marcar esta fatura como paga?')) return

    try {
      const token = localStorage.getItem('token')
      await api.patch(
        `${apiUrl}/invoices/${id}/pay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      fetchInvoices()
      alert('Fatura marcada como paga!')
    } catch (error: any) {
      console.error('Erro ao marcar fatura como paga:', error)
      alert(error.response?.data?.message || 'Erro ao marcar fatura como paga')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Paga', color: 'bg-green-100 text-green-800' },
      OVERDUE: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
      CANCELLED: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Financeiro</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm md:text-base w-full md:w-auto"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5" />
          <span className="whitespace-nowrap">Nova Fatura</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-indigo-600 mt-2">Carregando faturas...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Nenhuma fatura encontrada.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.description}</div>
                      {invoice.booking && (
                        <div className="text-xs text-gray-500">
                          {invoice.booking.court.name} - {formatDate(invoice.booking.date)} {invoice.booking.startTime}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.user.name}</div>
                      <div className="text-xs text-gray-500">{invoice.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(invoice.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como paga"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">{invoice.description}</div>
                    {invoice.booking && (
                      <div className="text-xs text-gray-500 mb-2">
                        {invoice.booking.court.name} - {formatDate(invoice.booking.date)} {invoice.booking.startTime}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Marcar como paga"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      Cliente:
                    </span>
                    <span className="text-gray-900 font-medium">{invoice.user.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{invoice.user.email}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      Valor:
                    </span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(Number(invoice.amount))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Vencimento:
                    </span>
                    <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Criar Fatura */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nova Fatura</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ userId: '', description: '', amount: '', dueDate: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um cliente</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Reserva - Quadra 1 - 03/01/2026 15:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ userId: '', description: '', amount: '', dueDate: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...
                  </span>
                ) : (
                  'Criar Fatura'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Fatura */}
      {showEditModal && editingInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Editar Fatura</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingInvoice(null)
                  setFormData({ userId: '', description: '', amount: '', dueDate: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingInvoice(null)
                  setFormData({ userId: '', description: '', amount: '', dueDate: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
                  </span>
                ) : (
                  'Atualizar Fatura'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
