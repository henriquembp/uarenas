'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Plus, Edit2, Trash2, UserPlus, UserMinus, Loader2, X, Calendar, Clock, GraduationCap, Home } from 'lucide-react'
import api from '@/lib/api'

interface Class {
  id: string
  name: string
  description?: string | null
  courtId: string
  teacherId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  startDate: string
  endDate?: string | null
  isActive: boolean
  court: {
    id: string
    name: string
  }
  teacher: {
    id: string
    name: string
    email: string
  }
  students: Array<{
    id: string
    studentId: string
    joinedAt: string
    student: {
      id: string
      name: string
      email: string
    }
  }>
}

interface Court {
  id: string
  name: string
  isActive: boolean
}

interface Teacher {
  id: string
  name: string
  email: string
}

interface User {
  id: string
  name: string
  email: string
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courtId: '',
    teacherId: '',
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    isActive: true,
  })
  const [studentFormData, setStudentFormData] = useState({
    studentId: '',
    monthlyPrice: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchClasses()
    fetchCourts()
    fetchTeachers()
    fetchUsers()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await api.get<Class[]>(`${apiUrl}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setClasses(response.data)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
      alert('Erro ao carregar turmas')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`${apiUrl}/courts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filtra apenas quadras ativas e mapeia para o tipo Court
      const activeCourts: Court[] = (response.data as any[])
        .filter((court: any) => court.isActive === true)
        .map((court: any) => ({
          id: court.id,
          name: court.name,
          isActive: Boolean(court.isActive),
        }))
      setCourts(activeCourts)
    } catch (error) {
      console.error('Erro ao carregar quadras:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get<Teacher[]>(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTeachers(response.data.filter((user) => user.role === 'TEACHER'))
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get<User[]>(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.courtId || !formData.teacherId || !formData.startTime || !formData.endTime || !formData.startDate) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await api.post(
        `${apiUrl}/classes`,
        {
          ...formData,
          endDate: formData.endDate || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowCreateModal(false)
      resetForm()
      fetchClasses()
      alert('Turma criada com sucesso! As reservas recorrentes foram geradas automaticamente.')
    } catch (error: any) {
      console.error('Erro ao criar turma:', error)
      alert(error.response?.data?.message || 'Erro ao criar turma')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      courtId: classItem.courtId,
      teacherId: classItem.teacherId,
      dayOfWeek: classItem.dayOfWeek,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      startDate: classItem.startDate.split('T')[0],
      endDate: classItem.endDate ? classItem.endDate.split('T')[0] : '',
      isActive: classItem.isActive,
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingClass) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await api.patch(
        `${apiUrl}/classes/${editingClass.id}`,
        {
          ...formData,
          endDate: formData.endDate || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowEditModal(false)
      setEditingClass(null)
      resetForm()
      fetchClasses()
      alert('Turma atualizada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar turma:', error)
      alert(error.response?.data?.message || 'Erro ao atualizar turma')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta turma?')) return

    try {
      const token = localStorage.getItem('token')
      await api.delete(`${apiUrl}/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      fetchClasses()
      alert('Turma desativada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao desativar turma:', error)
      alert(error.response?.data?.message || 'Erro ao desativar turma')
    }
  }

  const handleAddStudent = (classItem: Class) => {
    setSelectedClass(classItem)
    setStudentFormData({ studentId: '', monthlyPrice: '' })
    setShowAddStudentModal(true)
  }

  const handleAddStudentSubmit = async () => {
    if (!selectedClass || !studentFormData.studentId) {
      alert('Selecione um aluno')
      return
    }

    if (!studentFormData.monthlyPrice || parseFloat(studentFormData.monthlyPrice) < 0) {
      alert('Informe o valor da mensalidade')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await api.post(
        `${apiUrl}/classes/${selectedClass.id}/students`,
        {
          studentId: studentFormData.studentId,
          monthlyPrice: parseFloat(studentFormData.monthlyPrice),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowAddStudentModal(false)
      setSelectedClass(null)
      setStudentFormData({ studentId: '', monthlyPrice: '' })
      fetchClasses()
      alert('Aluno adicionado com sucesso! A fatura mensal foi gerada automaticamente.')
    } catch (error: any) {
      console.error('Erro ao adicionar aluno:', error)
      alert(error.response?.data?.message || 'Erro ao adicionar aluno')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    if (!confirm('Tem certeza que deseja remover este aluno da turma?')) return

    try {
      const token = localStorage.getItem('token')
      await api.delete(`${apiUrl}/classes/${classId}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      fetchClasses()
      alert('Aluno removido com sucesso!')
    } catch (error: any) {
      console.error('Erro ao remover aluno:', error)
      alert(error.response?.data?.message || 'Erro ao remover aluno')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      courtId: '',
      teacherId: '',
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      startDate: '',
      endDate: '',
      isActive: true,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
        <button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nova Turma
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-indigo-600 mt-2">Carregando turmas...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Nenhuma turma cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{classItem.name}</h3>
                  {classItem.description && (
                    <p className="text-sm text-gray-600 mt-1">{classItem.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Editar"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Desativar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Quadra:</span> {classItem.court.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span className="font-medium">Professor:</span> {classItem.teacher.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Dia:</span> {DAYS_OF_WEEK[classItem.dayOfWeek]}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Horário:</span> {classItem.startTime} - {classItem.endTime}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Início:</span> {formatDate(classItem.startDate)}
                </div>
                {classItem.endDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Fim:</span> {formatDate(classItem.endDate)}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Alunos ({classItem.students.length})
                  </h4>
                  <button
                    onClick={() => handleAddStudent(classItem)}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    Adicionar Aluno
                  </button>
                </div>
                {classItem.students.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum aluno matriculado</p>
                ) : (
                  <div className="space-y-2">
                    {classItem.students.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {enrollment.student.name}
                          </p>
                          <p className="text-xs text-gray-500">{enrollment.student.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(classItem.id, enrollment.studentId)}
                          className="text-red-600 hover:text-red-900"
                          title="Remover"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criar Turma */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nova Turma</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Turma <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Turma de Beach Tennis - Iniciantes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Descrição opcional da turma"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quadra <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.courtId}
                    onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione uma quadra</option>
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione um professor</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia da Semana <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Fim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Término (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
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
                  'Criar Turma'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Turma */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Editar Turma</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingClass(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Turma <span className="text-red-500">*</span>
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
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quadra <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.courtId}
                    onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia da Semana <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Fim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Término (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingClass(null)
                  resetForm()
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
                  'Atualizar Turma'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Aluno */}
      {showAddStudentModal && selectedClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Aluno</h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false)
                  setSelectedClass(null)
                  setStudentFormData({ studentId: '', monthlyPrice: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aluno <span className="text-red-500">*</span>
                </label>
                <select
                  value={studentFormData.studentId}
                  onChange={(e) => setStudentFormData({ ...studentFormData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um aluno</option>
                  {users
                    .filter(
                      (user) =>
                        !selectedClass.students.some((enrollment) => enrollment.studentId === user.id),
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Mensalidade (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={studentFormData.monthlyPrice}
                  onChange={(e) => setStudentFormData({ ...studentFormData, monthlyPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Uma fatura mensal será gerada automaticamente para este aluno
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowAddStudentModal(false)
                  setSelectedClass(null)
                  setStudentFormData({ studentId: '', monthlyPrice: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStudentSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...
                  </span>
                ) : (
                  'Adicionar Aluno'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
