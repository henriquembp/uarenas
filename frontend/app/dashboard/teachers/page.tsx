'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { GraduationCap, Plus, Edit2, Trash2, Loader2, X, Mail, Phone, User } from 'lucide-react'
import api from '@/lib/api'

interface Teacher {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  createdAt: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchTeachers()
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filtra apenas usuários que não são professores
      const nonTeachers = (response.data as any[]).filter((user: any) => user.role !== 'TEACHER')
      setAllUsers(nonTeachers)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await api.get<Teacher[]>(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filtra apenas professores (role TEACHER)
      const teachersData = response.data.filter((user) => user.role === 'TEACHER')
      setTeachers(teachersData)
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
      alert('Erro ao carregar professores')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await api.post(
        `${apiUrl}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          role: 'TEACHER',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowCreateModal(false)
      setFormData({ name: '', email: '', phone: '', password: '' })
      fetchTeachers()
      alert('Professor criado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar professor:', error)
      alert(error.response?.data?.message || 'Erro ao criar professor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      password: '', // Não preenche senha ao editar
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingTeacher) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
      }
      // Só atualiza senha se foi preenchida
      if (formData.password) {
        updateData.password = formData.password
      }

      await api.patch(
        `${apiUrl}/users/${editingTeacher.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowEditModal(false)
      setEditingTeacher(null)
      setFormData({ name: '', email: '', phone: '', password: '' })
      fetchTeachers()
      alert('Professor atualizado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar professor:', error)
      alert(error.response?.data?.message || 'Erro ao atualizar professor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return

    try {
      const token = localStorage.getItem('token')
      await api.delete(`${apiUrl}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      fetchTeachers()
      fetchAllUsers()
      alert('Professor excluído com sucesso!')
    } catch (error: any) {
      console.error('Erro ao excluir professor:', error)
      alert(error.response?.data?.message || 'Erro ao excluir professor')
    }
  }

  const handlePromoteUser = async () => {
    if (!selectedUserId) {
      alert('Selecione um usuário')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await api.patch(
        `${apiUrl}/users/${selectedUserId}`,
        { role: 'TEACHER' },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowPromoteModal(false)
      setSelectedUserId('')
      setUserSearchTerm('')
      setShowUserDropdown(false)
      fetchTeachers()
      fetchAllUsers()
      alert('Usuário promovido a professor com sucesso!')
    } catch (error: any) {
      console.error('Erro ao promover usuário:', error)
      alert(error.response?.data?.message || 'Erro ao promover usuário')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const filteredUsers = allUsers.filter((user: any) => {
    const searchLower = userSearchTerm.toLowerCase()
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Professores</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setSelectedUserId('')
              setUserSearchTerm('')
              setShowUserDropdown(false)
              setShowPromoteModal(true)
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            <span className="whitespace-nowrap">Promover Usuário</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            <span className="whitespace-nowrap">Novo Professor</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-indigo-600 mt-2">Carregando professores...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Nenhum professor cadastrado.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastrado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {teacher.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {teacher.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(teacher.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
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
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{teacher.name}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{teacher.phone || '-'}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Cadastrado em: {formatDate(teacher.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Criar Professor */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Novo Professor</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ name: '', email: '', phone: '', password: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ name: '', email: '', phone: '', password: '' })
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
                  'Criar Professor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Professor */}
      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Editar Professor</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTeacher(null)
                  setFormData({ name: '', email: '', phone: '', password: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTeacher(null)
                  setFormData({ name: '', email: '', phone: '', password: '' })
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
                  'Atualizar Professor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Promover Usuário */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Promover Usuário a Professor</h3>
              <button
                onClick={() => {
                  setShowPromoteModal(false)
                  setSelectedUserId('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar usuário <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value)
                    setShowUserDropdown(true)
                    if (!e.target.value) {
                      setSelectedUserId('')
                    }
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  onBlur={() => {
                    // Delay para permitir clique no item da lista
                    setTimeout(() => setShowUserDropdown(false), 200)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite o nome ou email do usuário..."
                />
                
                {showUserDropdown && userSearchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Nenhum usuário encontrado
                      </div>
                    ) : (
                      filteredUsers.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setUserSearchTerm(`${user.name} (${user.email}) - ${user.role}`)
                            setShowUserDropdown(false)
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            selectedUserId === user.id ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email} - {user.role}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {selectedUserId && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-sm font-medium text-green-900">
                      Usuário selecionado: {allUsers.find((u: any) => u.id === selectedUserId)?.name}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUserId('')
                        setUserSearchTerm('')
                      }}
                      className="text-xs text-green-600 hover:text-green-800 mt-1"
                    >
                      Limpar seleção
                    </button>
                  </div>
                )}
                
                {allUsers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Não há usuários disponíveis para promover. Todos os usuários já são professores ou não existem outros usuários no sistema.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowPromoteModal(false)
                  setSelectedUserId('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handlePromoteUser}
                disabled={submitting || !selectedUserId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Promovendo...
                  </span>
                ) : (
                  'Promover a Professor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
