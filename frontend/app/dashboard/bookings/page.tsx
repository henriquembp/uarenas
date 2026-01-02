'use client'

import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Calendar, Clock, User, MapPin, X, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface Court {
  id: string
  name: string
  description?: string
  isActive: boolean
}

interface Booking {
  id: string
  courtId: string
  date: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes?: string
  isPremium?: boolean
  price?: number | null
  user: {
    id: string
    name: string
    email: string
  }
  court: {
    id: string
    name: string
    defaultPrice?: number | string
    premiumPrice?: number | string
  }
}

interface Availability {
  court: {
    id: string
    name: string
    defaultPrice?: number
    premiumPrice?: number
  }
  date: string
  availableSlots: string[]
  bookedSlots: {
    timeSlot: string
    booking: {
      id: string
      userId: string
      userName: string
      userEmail: string
      status: string
      notes?: string
    }
  }[]
  premiumSlots: string[]
}

export default function BookingsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [createNotes, setCreateNotes] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')
  const [user, setUser] = useState<any>(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [registering, setRegistering] = useState(false)
  const bookingsListRef = useRef<HTMLDivElement>(null)
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      // Só busca reservas se o usuário estiver autenticado
      fetchMyBookings()
    }
    fetchCourts()
  }, [])

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchAvailability()
    }
  }, [selectedCourt, selectedDate])

  useEffect(() => {
    // Só busca reservas se o usuário estiver autenticado
    if (user) {
      if (activeTab === 'my') {
        fetchMyBookings()
      } else {
        fetchAllBookings()
      }
    } else {
      // Se não estiver autenticado, limpa a lista de reservas
      setBookings([])
    }
  }, [activeTab, user])

  const fetchCourts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiUrl}/courts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourts(response.data.filter((c: Court) => c.isActive))
      if (response.data.length > 0 && !selectedCourt) {
        setSelectedCourt(response.data[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar quadras:', error)
    }
  }

  const fetchAvailability = async () => {
    if (!selectedCourt || !selectedDate) return

    setLoadingAvailability(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiUrl}/bookings/availability`, {
        params: { courtId: selectedCourt, date: selectedDate },
        headers: { Authorization: `Bearer ${token}` },
      })
      // Atualiza o estado diretamente - React detectará a mudança
      setAvailability(response.data)
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error)
      alert('Erro ao carregar disponibilidade')
    } finally {
      setLoadingAvailability(false)
    }
  }

  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setBookings([])
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`${apiUrl}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBookings(response.data)
    } catch (error) {
      console.error('Erro ao carregar minhas reservas:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBookings = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setBookings([])
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`${apiUrl}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBookings(response.data)
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('Apenas administradores podem ver todas as reservas')
        setActiveTab('my')
      } else {
        console.error('Erro ao carregar reservas:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedTimeSlot) {
      alert('Selecione quadra, data e horário')
      return
    }

    // Verifica se o usuário está autenticado
    const token = localStorage.getItem('token')
    if (!token || !user) {
      // Se não estiver autenticado, mostra o modal de cadastro
      setShowRegisterModal(true)
      return
    }

    // Se estiver autenticado, cria a reserva normalmente
    await createBookingRequest()
  }

  const createBookingRequest = async () => {
    setCreating(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${apiUrl}/bookings`,
        {
          courtId: selectedCourt,
          date: selectedDate,
          startTime: selectedTimeSlot,
          notes: createNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Fecha o modal primeiro
      setShowCreateModal(false)
      setSelectedTimeSlot('')
      setCreateNotes('')

      // Atualiza a disponibilidade primeiro para garantir atualização imediata
      await fetchAvailability()
      
      // Depois atualiza as listas de reservas
      if (activeTab === 'my') {
        await fetchMyBookings()
      } else {
        await fetchAllBookings()
      }

      alert('Reserva criada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error)
      alert(error.response?.data?.message || 'Erro ao criar reserva')
    } finally {
      setCreating(false)
    }
  }

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (registerData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setRegistering(true)
    try {
      const response = await axios.post(`${apiUrl}/auth/register`, {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone || undefined,
        password: registerData.password,
      })

      // Salva o token e o usuário
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)

      // Fecha o modal de registro
      setShowRegisterModal(false)
      setRegisterData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      })

      // Cria a reserva automaticamente
      await createBookingRequest()
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error)
      alert(error.response?.data?.message || 'Erro ao cadastrar usuário')
    } finally {
      setRegistering(false)
    }
  }

  const handleCancelBooking = (id: string) => {
    // Abre o modal de confirmação em vez de usar confirm() (que pode não funcionar bem no iOS)
    setBookingToCancel(id)
    setShowCancelConfirmModal(true)
  }

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return

    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${apiUrl}/bookings/${bookingToCancel}`,
        { status: 'CANCELLED' },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowCancelConfirmModal(false)
      setBookingToCancel(null)
      alert('Reserva cancelada com sucesso!')
      fetchAvailability()
      if (activeTab === 'my') {
        fetchMyBookings()
      } else {
        fetchAllBookings()
      }
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error)
      alert('Erro ao cancelar reserva')
      setShowCancelConfirmModal(false)
      setBookingToCancel(null)
    }
  }

  const formatDate = (dateString: string | Date | null | undefined) => {
    // Trata valores nulos ou undefined
    if (!dateString) {
      return 'Data inválida'
    }
    
    // Aceita tanto string YYYY-MM-DD quanto ISO string ou objeto Date
    let date: Date
    
    if (typeof dateString === 'string') {
      // Se for formato YYYY-MM-DD
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number)
        date = new Date(year, month - 1, day)
      } else {
        // Se for ISO string, faz parse e extrai apenas a data (sem hora)
        const parsed = new Date(dateString)
        if (isNaN(parsed.getTime())) {
          return 'Data inválida'
        }
        date = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
      }
    } else {
      // Se for objeto Date
      if (isNaN(dateString.getTime())) {
        return 'Data inválida'
      }
      date = new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate())
    }
    
    return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Concluída', color: 'bg-blue-100 text-blue-800' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const isPremiumSlot = (timeSlot: string) => {
    return availability?.premiumSlots?.includes(timeSlot) || false
  }

  const isBooked = (timeSlot: string) => {
    if (!availability?.bookedSlots) return false
    // Normaliza o formato do horário para comparação (HH:mm)
    const normalizedTimeSlot = timeSlot.substring(0, 5)
    return availability.bookedSlots.some((slot) => {
      const normalizedSlot = slot.timeSlot.substring(0, 5)
      return normalizedSlot === normalizedTimeSlot
    })
  }

  const getBookedInfo = (timeSlot: string) => {
    if (!availability?.bookedSlots) return undefined
    // Normaliza o formato do horário para comparação (HH:mm)
    const normalizedTimeSlot = timeSlot.substring(0, 5)
    return availability.bookedSlots.find((slot) => {
      const normalizedSlot = slot.timeSlot.substring(0, 5)
      return normalizedSlot === normalizedTimeSlot
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('my')
                // Rola até a lista de reservas em mobile
                setTimeout(() => {
                  if (bookingsListRef.current && window.innerWidth < 1024) {
                    bookingsListRef.current.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    })
                  }
                }, 100)
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Minhas Reservas
            </button>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todas as Reservas
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Disponibilidade */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ver Horários Disponíveis</h2>

            {/* Seletores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quadra</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Horários Disponíveis */}
            {loadingAvailability ? (
              <div className="text-center py-8">Carregando disponibilidade...</div>
            ) : availability ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {availability.court.name} - {formatDate(availability.date)}
                </h3>

                {availability.availableSlots.length === 0 && availability.bookedSlots.length === 0 ? (
                  <p className="text-gray-500">Nenhum horário disponível para esta data.</p>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {/* Combina horários disponíveis e ocupados para exibir todos */}
                    {(() => {
                      // Cria um Set com todos os horários (disponíveis + ocupados)
                      const allSlots = new Set([
                        ...availability.availableSlots,
                        ...availability.bookedSlots.map((slot) => slot.timeSlot),
                      ])
                      // Ordena os horários
                      const sortedSlots = Array.from(allSlots).sort()
                      
                      return sortedSlots.map((timeSlot) => {
                        const booked = isBooked(timeSlot)
                        const bookedInfo = getBookedInfo(timeSlot)
                        const premium = isPremiumSlot(timeSlot)

                        return (
                          <button
                            key={timeSlot}
                            onClick={() => {
                              if (!booked) {
                                setSelectedTimeSlot(timeSlot)
                                setShowCreateModal(true)
                              }
                            }}
                            disabled={booked}
                            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                              booked
                                ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                : premium
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                            }`}
                            title={
                              booked
                                ? `Ocupado por: ${bookedInfo?.booking.userName}`
                                : premium
                                ? 'Horário Nobre'
                                : 'Disponível'
                            }
                          >
                            <div className="flex flex-col items-center">
                              <span>{formatTime(timeSlot)}</span>
                              {premium && <span className="text-xs">⭐</span>}
                              {booked && <span className="text-xs">🔒</span>}
                            </div>
                          </button>
                        )
                      })
                    })()}
                  </div>
                )}

                {/* Legenda */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Legenda:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-800 text-xs font-medium">✓</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Disponível</p>
                        <p className="text-xs text-gray-500">Horário livre para reserva</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-800 text-xs">⭐</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Horário Nobre</p>
                        <p className="text-xs text-gray-500">Preço diferenciado</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-800 text-xs">🔒</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Ocupado</p>
                        <p className="text-xs text-gray-500">Já reservado</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações de Preço */}
                {availability.court.defaultPrice && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Informações de Preço:</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        <strong>Preço padrão:</strong> R$ {Number(availability.court.defaultPrice).toFixed(2)}
                      </p>
                      {availability.court.premiumPrice && (
                        <p className="text-sm text-gray-700">
                          <strong className="text-yellow-700">Preço horário nobre:</strong>{' '}
                          <span className="text-yellow-700 font-semibold">
                            R$ {Number(availability.court.premiumPrice).toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Selecione uma quadra e data para ver os horários disponíveis.</p>
            )}
          </div>
        </div>

        {/* Lista de Reservas */}
        <div ref={bookingsListRef} className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {activeTab === 'my' ? 'Minhas Reservas' : 'Todas as Reservas'}
            </h2>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500">Nenhuma reserva encontrada.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.court.name}</h3>
                        <p className="text-sm text-gray-500">{formatDate(booking.date)}</p>
                        <p className="text-sm text-gray-700">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                        {booking.price !== null && booking.price !== undefined && (
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {booking.isPremium && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-1">
                                ⭐ Horário Nobre
                              </span>
                            )}
                            Valor: R$ {Number(booking.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {activeTab === 'all' && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <User className="inline h-3 w-3 mr-1" />
                          {booking.user.name} ({booking.user.email})
                        </p>
                      </div>
                    )}

                    {booking.notes && (
                      <p className="text-xs text-gray-600 mt-2">{booking.notes}</p>
                    )}

                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleCancelBooking(booking.id)
                          }}
                          className="flex-1 bg-red-50 text-red-700 py-1 px-2 rounded text-xs font-medium hover:bg-red-100 active:bg-red-200 touch-manipulation cursor-pointer"
                          style={{ 
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                            minHeight: '44px', // Tamanho mínimo recomendado para touch
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criar Reserva */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nova Reserva</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedTimeSlot('')
                  setCreateNotes('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quadra</label>
                <p className="text-gray-900">
                  {courts.find((c) => c.id === selectedCourt)?.name || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <p className="text-gray-900">{formatDate(selectedDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <p className="text-gray-900">{formatTime(selectedTimeSlot)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                <textarea
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Adicione observações sobre a reserva..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedTimeSlot('')
                    setCreateNotes('')
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={creating}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Criando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cadastro Necessário</h3>
              <button
                onClick={() => {
                  setShowRegisterModal(false)
                  setRegisterData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Para fazer uma reserva, é necessário criar uma conta. Preencha os dados abaixo:
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
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
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowRegisterModal(false)
                  setRegisterData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                  })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={registering}
              >
                Cancelar
              </button>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {registering ? 'Cadastrando...' : 'Cadastrar e Reservar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Cancelamento</h3>
            <p className="text-gray-700 mb-6">
              Deseja realmente cancelar esta reserva?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelConfirmModal(false)
                  setBookingToCancel(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                style={{ 
                  minHeight: '44px',
                  touchAction: 'manipulation',
                }}
              >
                Não, manter
              </button>
              <button
                onClick={confirmCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                style={{ 
                  minHeight: '44px',
                  touchAction: 'manipulation',
                }}
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
