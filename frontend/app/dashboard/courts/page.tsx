'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Image as ImageIcon, Clock, Star } from 'lucide-react'

interface Court {
  id: string
  name: string
  description?: string
  sportType: string
  isActive: boolean
  imageUrl?: string
  defaultPrice?: number | string
  premiumPrice?: number | string
  createdAt: string
  updatedAt: string
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportType: 'esportes_areia',
    imageUrl: '',
    isActive: true,
    defaultPrice: '',
    premiumPrice: '',
  })
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [selectedCourtForAvailability, setSelectedCourtForAvailability] = useState<Court | null>(null)
  const [availability, setAvailability] = useState<Record<number, string[]>>({})
  const [premiumSlots, setPremiumSlots] = useState<Record<number, string[]>>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [showReplicateModal, setShowReplicateModal] = useState(false)
  const [showSpecificDateModal, setShowSpecificDateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [specificDateSlots, setSpecificDateSlots] = useState<string[]>([])
  const [specificDatePremiumSlots, setSpecificDatePremiumSlots] = useState<string[]>([])
  const [configuredSpecificDates, setConfiguredSpecificDates] = useState<string[]>([])
  const [weekdaySlots, setWeekdaySlots] = useState<string[]>([])
  const [weekendSlots, setWeekendSlots] = useState<string[]>([])
  const [weekdayPremiumSlots, setWeekdayPremiumSlots] = useState<string[]>([])
  const [weekendPremiumSlots, setWeekendPremiumSlots] = useState<string[]>([])
  const [showCopyModal, setShowCopyModal] = useState(false)

  useEffect(() => {
    // Busca o usuário do localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchCourts()
  }, [])

  const fetchCourts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      const response = await axios.get(`${apiUrl}/courts`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setCourts(response.data)
    } catch (error) {
      console.error('Erro ao carregar quadras:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      if (editingCourt) {
        await axios.patch(
          `${apiUrl}/courts/${editingCourt.id}`,
          {
            name: formData.name,
            description: formData.description || undefined,
            sportType: formData.sportType,
            imageUrl: formData.imageUrl || undefined,
            isActive: formData.isActive,
            defaultPrice: formData.defaultPrice && formData.defaultPrice.trim() !== '' 
              ? parseFloat(formData.defaultPrice) 
              : null,
            premiumPrice: formData.premiumPrice && formData.premiumPrice.trim() !== '' 
              ? parseFloat(formData.premiumPrice) 
              : null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      } else {
        await axios.post(
          `${apiUrl}/courts`,
          {
            name: formData.name,
            description: formData.description || undefined,
            sportType: formData.sportType,
            imageUrl: formData.imageUrl || undefined,
            isActive: formData.isActive,
            defaultPrice: formData.defaultPrice && formData.defaultPrice.trim() !== '' 
              ? parseFloat(formData.defaultPrice) 
              : null,
            premiumPrice: formData.premiumPrice && formData.premiumPrice.trim() !== '' 
              ? parseFloat(formData.premiumPrice) 
              : null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      }

      setShowModal(false)
      resetForm()
      fetchCourts()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar quadra')
    }
  }

  const handleEdit = (court: Court) => {
    setEditingCourt(court)
    setFormData({
      name: court.name,
      description: court.description || '',
      sportType: court.sportType,
      imageUrl: court.imageUrl || '',
      isActive: court.isActive,
      defaultPrice: court.defaultPrice ? String(court.defaultPrice) : '',
      premiumPrice: court.premiumPrice ? String(court.premiumPrice) : '',
    })
    setPreviewImage(court.imageUrl || null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta quadra?')) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      await axios.delete(`${apiUrl}/courts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      fetchCourts()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao excluir quadra')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sportType: 'esportes_areia',
      imageUrl: '',
      isActive: true,
      defaultPrice: '',
      premiumPrice: '',
    })
    setEditingCourt(null)
    setPreviewImage(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validação de tipo
    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      alert('Apenas imagens são permitidas (JPG, PNG, GIF, WEBP)')
      return
    }

    // Validação de tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 10MB')
      return
    }

    setUploading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post(`${apiUrl}/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success && response.data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: response.data.url }))
        setPreviewImage(response.data.url)
        alert('Imagem enviada com sucesso!')
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      alert(error.response?.data?.message || 'Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openAvailabilityModal = async (court: Court) => {
    setSelectedCourtForAvailability(court)
    setLoadingAvailability(true)
    setShowAvailabilityModal(true)
    setSelectedDate('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      const response = await axios.get(`${apiUrl}/courts/${court.id}/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Carrega apenas horários semanais (padrão)
      setAvailability(response.data.weekly || response.data || {})
      // Carrega horários nobres
      setPremiumSlots(response.data.premium || {})
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error)
      setAvailability({})
      setPremiumSlots({})
    } finally {
      setLoadingAvailability(false)
    }
  }

  const openSpecificDateModal = async (court: Court, date?: string) => {
    setSelectedCourtForAvailability(court)
    setLoadingAvailability(true)
    setShowSpecificDateModal(true)
    
    // Define a data (usa a data passada ou hoje como padrão)
    const dateToUse = date || new Date().toISOString().split('T')[0]
    setSelectedDate(dateToUse)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      // Carrega lista de datas configuradas
      const datesResponse = await axios.get(
        `${apiUrl}/courts/${court.id}/availability/specific-dates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setConfiguredSpecificDates(datesResponse.data || [])

      // Carrega horários específicos da data selecionada
      // Usa a data diretamente, sem conversão de timezone
      const response = await axios.get(
        `${apiUrl}/courts/${court.id}/availability?date=${dateToUse}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // A resposta pode vir com a data em diferentes formatos, verifica todos
      if (response.data.specificDates) {
        // Tenta encontrar a data na resposta (pode estar em diferentes formatos)
        const foundDate = Object.keys(response.data.specificDates).find(
          (key) => key === dateToUse || key.startsWith(dateToUse)
        )
        
        if (foundDate && response.data.specificDates[foundDate]) {
          setSpecificDateSlots(response.data.specificDates[foundDate])
        } else {
          // Se não encontrou, tenta pegar a primeira data disponível (caso haja problema de formato)
          const firstDate = Object.keys(response.data.specificDates)[0]
          if (firstDate && response.data.specificDates[firstDate]) {
            setSpecificDateSlots(response.data.specificDates[firstDate])
          } else {
            setSpecificDateSlots([])
          }
        }
      } else {
        setSpecificDateSlots([])
      }

      // Carrega horários nobres da data específica
      if (response.data.premiumSpecificDates) {
        const foundDate = Object.keys(response.data.premiumSpecificDates).find(
          (key) => key === dateToUse || key.startsWith(dateToUse)
        )
        
        if (foundDate && response.data.premiumSpecificDates[foundDate]) {
          setSpecificDatePremiumSlots(response.data.premiumSpecificDates[foundDate])
        } else {
          const firstDate = Object.keys(response.data.premiumSpecificDates)[0]
          if (firstDate && response.data.premiumSpecificDates[firstDate]) {
            setSpecificDatePremiumSlots(response.data.premiumSpecificDates[firstDate])
          } else {
            setSpecificDatePremiumSlots([])
          }
        }
      } else {
        setSpecificDatePremiumSlots([])
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidade da data:', error)
      setSpecificDateSlots([])
      setConfiguredSpecificDates([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  const saveAvailability = async () => {
    if (!selectedCourtForAvailability) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      // Converte o objeto de disponibilidade para array (apenas horários semanais)
      // Agrupa horários normais e nobres separadamente
      const availabilityArray = Object.entries(availability).map(([dayOfWeek, timeSlots]) => {
        const dayPremiumSlots = premiumSlots[parseInt(dayOfWeek)] || []
        const normalSlots = (timeSlots as string[]).filter((slot) => !dayPremiumSlots.includes(slot))
        const premiumTimeSlots = (timeSlots as string[]).filter((slot) => dayPremiumSlots.includes(slot))
        
        // Retorna dois objetos: um para horários normais e outro para nobres
        return [
          {
            dayOfWeek: parseInt(dayOfWeek),
            timeSlots: normalSlots,
            isPremium: false,
          },
          {
            dayOfWeek: parseInt(dayOfWeek),
            timeSlots: premiumTimeSlots,
            isPremium: true,
          },
        ].filter((item) => item.timeSlots.length > 0) // Remove itens vazios
      }).flat()

      await axios.post(
        `${apiUrl}/courts/${selectedCourtForAvailability.id}/availability`,
        {
          availability: availabilityArray,
          // Não envia specificDate para horários semanais
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      alert('Horários semanais salvos com sucesso!')
      setShowAvailabilityModal(false)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar disponibilidade')
    }
  }

  const saveSpecificDateAvailability = async () => {
    if (!selectedCourtForAvailability || !selectedDate) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      // Para data específica, separa horários normais e nobres
      const normalSlots = specificDateSlots.filter((slot) => !specificDatePremiumSlots.includes(slot))
      const premiumTimeSlots = specificDateSlots.filter((slot) => specificDatePremiumSlots.includes(slot))
      
      const availabilityArray = [
        {
          dayOfWeek: new Date(selectedDate).getDay(),
          timeSlots: normalSlots,
          isPremium: false,
        },
        {
          dayOfWeek: new Date(selectedDate).getDay(),
          timeSlots: premiumTimeSlots,
          isPremium: true,
        },
      ].filter((item) => item.timeSlots.length > 0) // Remove itens vazios

      await axios.post(
        `${apiUrl}/courts/${selectedCourtForAvailability.id}/availability`,
        {
          availability: availabilityArray,
          specificDate: selectedDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      alert(`Horários para ${new Date(selectedDate).toLocaleDateString('pt-BR')} salvos com sucesso!`)
      
      // Recarrega a lista de datas configuradas
      if (selectedCourtForAvailability) {
        const datesResponse = await axios.get(
          `${apiUrl}/courts/${selectedCourtForAvailability.id}/availability/specific-dates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setConfiguredSpecificDates(datesResponse.data || [])
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar disponibilidade da data')
    }
  }

  const replicateAvailability = async (
    weekdaySlots: string[],
    weekendSlots: string[],
    weekdayPremiumSlots: string[],
    weekendPremiumSlots: string[]
  ) => {
    if (!selectedCourtForAvailability) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      await axios.post(
        `${apiUrl}/courts/${selectedCourtForAvailability.id}/availability/replicate`,
        {
          weekdaySlots,
          weekendSlots,
          weekdayPremiumSlots,
          weekendPremiumSlots,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      alert('Horários replicados com sucesso!')
      // Recarrega a disponibilidade semanal
      if (selectedCourtForAvailability) {
        await openAvailabilityModal(selectedCourtForAvailability)
      }
      setShowReplicateModal(false)
      setWeekdaySlots([])
      setWeekendSlots([])
      setWeekdayPremiumSlots([])
      setWeekendPremiumSlots([])
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao replicar horários')
    }
  }

  // Converte horário HH:mm para minutos desde meia-noite
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Verifica se dois horários conflitam (cada reserva dura 1 hora)
  const hasTimeConflict = (time1: string, time2: string): boolean => {
    const start1 = timeToMinutes(time1)
    const end1 = start1 + 60 // 1 hora depois
    const start2 = timeToMinutes(time2)
    const end2 = start2 + 60

    // Conflita se os intervalos se sobrepõem
    // time1: [start1, end1), time2: [start2, end2)
    // Conflita se: start1 < end2 && start2 < end1
    return start1 < end2 && start2 < end1
  }

  // Verifica se um horário conflita com algum dos horários selecionados
  const hasConflictWithSelected = (dayOfWeek: number, timeSlot: string): boolean => {
    const daySlots = availability[dayOfWeek] || []
    return daySlots.some((selectedSlot) => hasTimeConflict(selectedSlot, timeSlot))
  }

  const toggleTimeSlot = (dayOfWeek: number, timeSlot: string) => {
    setAvailability((prev) => {
      const daySlots = prev[dayOfWeek] || []
      const isSelected = daySlots.includes(timeSlot)

      // Se está desmarcando, remove normalmente (e também remove dos premium se estiver)
      if (isSelected) {
        setPremiumSlots((prevPremium) => ({
          ...prevPremium,
          [dayOfWeek]: (prevPremium[dayOfWeek] || []).filter((slot) => slot !== timeSlot),
        }))
        return {
          ...prev,
          [dayOfWeek]: daySlots.filter((slot) => slot !== timeSlot),
        }
      }

      // Se está marcando, verifica conflitos
      const conflicts = daySlots.filter((slot) => hasTimeConflict(slot, timeSlot))
      if (conflicts.length > 0) {
        const conflictTimes = conflicts.join(', ')
        alert(
          `Não é possível selecionar ${timeSlot} pois conflita com os horários: ${conflictTimes}\n\nCada reserva dura 1 hora. Desmarque os horários conflitantes primeiro.`
        )
        return prev // Não altera nada
      }

      // Sem conflitos, adiciona o horário
      return {
        ...prev,
        [dayOfWeek]: [...daySlots, timeSlot].sort(),
      }
    })
  }

  const togglePremiumSlot = (dayOfWeek: number, timeSlot: string) => {
    setPremiumSlots((prev) => {
      const dayPremiumSlots = prev[dayOfWeek] || []
      const isPremium = dayPremiumSlots.includes(timeSlot)

      if (isPremium) {
        // Remove dos premium
        return {
          ...prev,
          [dayOfWeek]: dayPremiumSlots.filter((slot) => slot !== timeSlot),
        }
      } else {
        // Adiciona aos premium (só se o horário estiver selecionado)
        const daySlots = availability[dayOfWeek] || []
        if (!daySlots.includes(timeSlot)) {
          alert('Selecione o horário primeiro antes de marcá-lo como nobre')
          return prev
        }
        return {
          ...prev,
          [dayOfWeek]: [...dayPremiumSlots, timeSlot].sort(),
        }
      }
    })
  }

  const getSportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      esportes_areia: 'Esportes de Areia (Beach Tennis, Vôlei, Futevôlei)',
    }
    return labels[type] || type
  }

  // Converte links do Google Drive para formato direto de imagem
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url || !url.trim()) return url
    
    const trimmedUrl = url.trim()
    
    // Verifica se é um link do Google Drive (formato de visualização)
    const driveViewRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    const viewMatch = trimmedUrl.match(driveViewRegex)
    
    if (viewMatch) {
      const fileId = viewMatch[1]
      // Tenta múltiplos formatos do Google Drive
      // Formato 1: uc?export=view (mais comum)
      // Formato 2: thumbnail (para previews)
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
    
    // Verifica se já é um link direto do Google Drive (uc?export=view)
    const driveDirectRegex = /drive\.google\.com\/uc\?export=view&id=([a-zA-Z0-9_-]+)/
    const directMatch = trimmedUrl.match(driveDirectRegex)
    
    if (directMatch) {
      // Já está no formato correto
      return trimmedUrl
    }
    
    // Se não for Google Drive, retorna como está
    return trimmedUrl
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quadras</h1>
        {/* Mostra botão apenas para ADMIN */}
        {user?.role === 'ADMIN' && (
          <button
            onClick={openNewModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nova Quadra
          </button>
        )}
      </div>

      {courts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">Nenhuma quadra cadastrada ainda.</p>
          {user?.role === 'ADMIN' && (
            <button
              onClick={openNewModal}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Cadastrar primeira quadra
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => (
            <div
              key={court.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {court.imageUrl ? (
                <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                  <img
                    src={convertGoogleDriveUrl(court.imageUrl)}
                    alt={court.name}
                    className="w-full h-48 object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', {
                        original: court.imageUrl,
                        converted: court.imageUrl ? convertGoogleDriveUrl(court.imageUrl) : '',
                      })
                      // Esconde a imagem e mostra placeholder
                      const img = e.currentTarget
                      img.style.display = 'none'
                      const placeholder = img.nextElementSibling as HTMLElement
                      if (placeholder) {
                        placeholder.style.display = 'flex'
                      }
                    }}
                    onLoad={() => {
                      console.log('✅ Imagem carregada com sucesso:', court.imageUrl ? convertGoogleDriveUrl(court.imageUrl) : '')
                    }}
                  />
                  {/* Placeholder que aparece quando imagem falha */}
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500 text-xs p-2 text-center"
                    style={{ display: 'none' }}
                  >
                    <ImageIcon className="h-8 w-8 mb-1" />
                    <span>Imagem não disponível</span>
                    <span className="text-xs mt-1">Use Imgur para melhor compatibilidade</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      court.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {court.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <p className="text-sm text-indigo-600 mb-2">
                  {getSportTypeLabel(court.sportType)}
                </p>
                {court.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {court.description}
                  </p>
                )}
                {/* Mostra botões de ação apenas para ADMIN */}
                {user?.role === 'ADMIN' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAvailabilityModal(court)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-100 flex items-center justify-center gap-2 text-sm"
                      >
                        <Clock className="h-4 w-4" />
                        Horários Semanais
                      </button>
                      <button
                        onClick={() => openSpecificDateModal(court)}
                        className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-md hover:bg-purple-100 flex items-center justify-center gap-2 text-sm"
                        title="Configurar horários para uma data específica (feriados, manutenção, etc.)"
                      >
                        <Clock className="h-4 w-4" />
                        Data Específica
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(court)}
                        className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-100 flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCourt ? 'Editar Quadra' : 'Nova Quadra'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Quadra *
                  </label>
                  <select
                    required
                    value={formData.sportType}
                    onChange={(e) =>
                      setFormData({ ...formData, sportType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="esportes_areia">
                      Esportes de Areia (Beach Tennis, Vôlei, Futevôlei)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem da Quadra
                  </label>
                  
                  {/* Upload de arquivo */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-2">
                      Ou selecione uma imagem do seu computador:
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer disabled:opacity-50"
                    />
                    {uploading && (
                      <p className="mt-1 text-xs text-indigo-600">Enviando imagem...</p>
                    )}
                  </div>

                  {/* Preview da imagem */}
                  {previewImage && (
                    <div className="mb-3">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md border border-gray-300"
                      />
                    </div>
                  )}

                  {/* Campo de URL (alternativa) */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Ou cole a URL de uma imagem:
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value })
                        setPreviewImage(e.target.value || null)
                      }}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Você pode fazer upload de um arquivo ou colar uma URL
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Padrão (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.defaultPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultPrice: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Valor do horário de locação padrão
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Horário Nobre (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.premiumPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, premiumPrice: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Valor para horários marcados como nobres
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Quadra ativa
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {editingCourt ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Disponibilidade */}
      {showAvailabilityModal && selectedCourtForAvailability && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Configurar Horários - {selectedCourtForAvailability.name}
                </h3>
                <button
                  onClick={() => {
                    setShowAvailabilityModal(false)
                    setSelectedCourtForAvailability(null)
                    setAvailability({})
                    setPremiumSlots({})
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {loadingAvailability ? (
                <div className="text-center py-12">Carregando...</div>
              ) : (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      ⏰ Horários Padrão Semanais
                    </p>
                    <p className="text-xs text-blue-600">
                      Configure os horários disponíveis para cada dia da semana. Estes horários serão aplicados
                      automaticamente, exceto quando houver uma configuração específica para uma data.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowCopyModal(true)}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                    >
                      📋 Copiar de Outra Quadra
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplicateModal(true)}
                      className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                    >
                      Replicar Horários
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-50 text-left">
                            Dia da Semana
                          </th>
                          <th className="border border-gray-300 p-2 bg-gray-50 text-center">
                            Horários Disponíveis
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { day: 0, label: 'Domingo' },
                          { day: 1, label: 'Segunda-feira' },
                          { day: 2, label: 'Terça-feira' },
                          { day: 3, label: 'Quarta-feira' },
                          { day: 4, label: 'Quinta-feira' },
                          { day: 5, label: 'Sexta-feira' },
                          { day: 6, label: 'Sábado' },
                        ].map(({ day, label }) => {
                          // Gera horários de 6:00 às 23:00 (a cada 30 minutos)
                          const timeSlots: string[] = []
                          for (let hour = 6; hour < 24; hour++) {
                            timeSlots.push(`${String(hour).padStart(2, '0')}:00`)
                            timeSlots.push(`${String(hour).padStart(2, '0')}:30`)
                          }

                          const selectedSlots = availability[day] || []
                          const dayPremiumSlots = premiumSlots[day] || []

                          return (
                            <tr key={day}>
                              <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                                {label}
                              </td>
                              <td className="border border-gray-300 p-3">
                                <div className="flex flex-wrap gap-2 items-center">
                                  {timeSlots.map((timeSlot) => {
                                    const isSelected = selectedSlots.includes(timeSlot)
                                    const isPremium = dayPremiumSlots.includes(timeSlot)
                                    const hasConflict = !isSelected && hasConflictWithSelected(day, timeSlot)
                                    
                                    return (
                                      <div key={timeSlot} className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => toggleTimeSlot(day, timeSlot)}
                                          disabled={hasConflict}
                                          title={
                                            hasConflict
                                              ? 'Este horário conflita com outro horário já selecionado. Cada reserva dura 1 hora.'
                                              : isSelected
                                              ? 'Clique para desmarcar'
                                              : 'Clique para marcar como disponível'
                                          }
                                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                            isSelected
                                              ? isPremium
                                                ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                                              : hasConflict
                                              ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-50'
                                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                                          }`}
                                        >
                                          {timeSlot}
                                        </button>
                                        {isSelected && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              togglePremiumSlot(day, timeSlot)
                                            }}
                                            title={
                                              isPremium
                                                ? 'Horário nobre - Clique para remover'
                                                : 'Clique para marcar como horário nobre'
                                            }
                                            className={`p-1 rounded transition-colors ${
                                              isPremium
                                                ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                                                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                            }`}
                                          >
                                            <Star
                                              size={16}
                                              className={isPremium ? 'fill-current' : ''}
                                            />
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                                {selectedSlots.length > 0 && (
                                  <p className="mt-2 text-xs text-gray-500">
                                    💡 Dica: Clique na estrela ao lado dos horários selecionados para marcá-los como nobres
                                  </p>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3 pt-6 mt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvailabilityModal(false)
                        setSelectedCourtForAvailability(null)
                        setAvailability({})
                        setPremiumSlots({})
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={saveAvailability}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Salvar Horários
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Data Específica */}
      {showSpecificDateModal && selectedCourtForAvailability && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Horários para Data Específica - {selectedCourtForAvailability.name}
                </h3>
                <button
                  onClick={() => {
                    setShowSpecificDateModal(false)
                    setSelectedCourtForAvailability(null)
                    setSelectedDate('')
                    setSpecificDateSlots([])
                    setSpecificDatePremiumSlots([])
                    setConfiguredSpecificDates([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {loadingAvailability ? (
                <div className="text-center py-12">Carregando...</div>
              ) : (
                <div>
                  <div className="mb-4 p-4 bg-purple-50 rounded-md border border-purple-200">
                    <p className="text-sm text-purple-800 font-medium mb-1">
                      📅 Configuração de Data Específica
                    </p>
                    <p className="text-xs text-purple-600">
                      Configure horários específicos para uma data (feriados, manutenção, etc.). Estes horários
                      substituirão os horários padrão semanais apenas para esta data.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Data
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={async (e) => {
                          const date = e.target.value
                          setSelectedDate(date)
                          if (date && selectedCourtForAvailability) {
                            await openSpecificDateModal(selectedCourtForAvailability, date)
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {selectedDate && (
                        <span className="text-sm text-gray-600">
                          {(() => {
                            // Converte YYYY-MM-DD para Date sem problemas de timezone
                            const [year, month, day] = selectedDate.split('-').map(Number)
                            const date = new Date(year, month - 1, day)
                            return date.toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          })()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lista de datas já configuradas */}
                  {configuredSpecificDates.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm font-medium text-blue-800 mb-3">
                        📅 Datas com Horários Específicos Configurados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {configuredSpecificDates.map((dateStr) => {
                          // Converte YYYY-MM-DD para formato brasileiro sem problemas de timezone
                          const [year, month, day] = dateStr.split('-').map(Number)
                          const date = new Date(year, month - 1, day)
                          const isSelected = selectedDate === dateStr
                          return (
                            <button
                              key={dateStr}
                              type="button"
                              onClick={async () => {
                                if (selectedCourtForAvailability) {
                                  await openSpecificDateModal(selectedCourtForAvailability, dateStr)
                                }
                              }}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                                  : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                              }`}
                            >
                              {date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </button>
                          )
                        })}
                      </div>
                      <p className="mt-2 text-xs text-blue-600">
                        Clique em uma data para editar seus horários
                      </p>
                    </div>
                  )}

                  {selectedDate && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Horários Disponíveis para{' '}
                          {(() => {
                            // Converte YYYY-MM-DD para Date sem problemas de timezone
                            const [year, month, day] = selectedDate.split('-').map(Number)
                            const date = new Date(year, month - 1, day)
                            return date.toLocaleDateString('pt-BR')
                          })()}
                        </label>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const timeSlots: string[] = []
                              for (let hour = 6; hour < 24; hour++) {
                                timeSlots.push(`${String(hour).padStart(2, '0')}:00`)
                                timeSlots.push(`${String(hour).padStart(2, '0')}:30`)
                              }
                              return timeSlots.map((timeSlot) => {
                                const isSelected = specificDateSlots.includes(timeSlot)
                                const isPremium = specificDatePremiumSlots.includes(timeSlot)
                                const hasConflict =
                                  !isSelected &&
                                  specificDateSlots.some((slot) => hasTimeConflict(slot, timeSlot))

                                return (
                                  <div key={timeSlot} className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          setSpecificDateSlots(
                                            specificDateSlots.filter((s) => s !== timeSlot)
                                          )
                                          setSpecificDatePremiumSlots(
                                            specificDatePremiumSlots.filter((s) => s !== timeSlot)
                                          )
                                        } else {
                                          // Verifica conflitos antes de adicionar
                                          const conflicts = specificDateSlots.filter((slot) =>
                                            hasTimeConflict(slot, timeSlot)
                                          )
                                          if (conflicts.length > 0) {
                                            alert(
                                              `Não é possível selecionar ${timeSlot} pois conflita com: ${conflicts.join(', ')}`
                                            )
                                            return
                                          }
                                          setSpecificDateSlots([...specificDateSlots, timeSlot].sort())
                                        }
                                      }}
                                      disabled={hasConflict}
                                      title={
                                        hasConflict
                                          ? 'Este horário conflita com outro horário selecionado'
                                          : isSelected
                                          ? 'Clique para desmarcar'
                                          : 'Clique para marcar'
                                      }
                                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        isSelected
                                          ? isPremium
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                                            : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                                          : hasConflict
                                          ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-50'
                                          : 'bg-white text-gray-700 hover:bg-gray-200 cursor-pointer border border-gray-300'
                                      }`}
                                    >
                                      {timeSlot}
                                    </button>
                                    {isSelected && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (isPremium) {
                                            setSpecificDatePremiumSlots(
                                              specificDatePremiumSlots.filter((s) => s !== timeSlot)
                                            )
                                          } else {
                                            setSpecificDatePremiumSlots([...specificDatePremiumSlots, timeSlot].sort())
                                          }
                                        }}
                                        title={
                                          isPremium
                                            ? 'Horário nobre - Clique para remover'
                                            : 'Clique para marcar como horário nobre'
                                        }
                                        className={`p-1 rounded transition-colors ${
                                          isPremium
                                            ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                                            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                        }`}
                                      >
                                        <Star
                                          size={16}
                                          className={isPremium ? 'fill-current' : ''}
                                        />
                                      </button>
                                    )}
                                  </div>
                                )
                              })
                            })()}
                          </div>
                          {specificDateSlots.length > 0 && (
                            <p className="mt-3 text-xs text-gray-600">
                              {specificDateSlots.length} horário(s) selecionado(s):{' '}
                              {specificDateSlots.join(', ')}
                              {specificDatePremiumSlots.length > 0 && (
                                <span className="ml-2 text-yellow-600">
                                  ({specificDatePremiumSlots.length} horário(s) nobre(s): {specificDatePremiumSlots.join(', ')})
                                </span>
                              )}
                            </p>
                          )}
                          {specificDateSlots.length > 0 && (
                            <p className="mt-2 text-xs text-gray-500">
                              💡 Dica: Clique na estrela ao lado dos horários selecionados para marcá-los como nobres
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-6 mt-4 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSpecificDateModal(false)
                            setSelectedCourtForAvailability(null)
                            setSelectedDate('')
                            setSpecificDateSlots([])
                            setSpecificDatePremiumSlots([])
                            setConfiguredSpecificDates([])
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={saveSpecificDateAvailability}
                          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                          Salvar Horários da Data
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Copiar Configurações */}
      {showCopyModal && selectedCourtForAvailability && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Copiar Configurações
                </h3>
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Selecione a quadra de origem para copiar todas as configurações de disponibilidade
                (horários semanais e datas específicas) para <strong>{selectedCourtForAvailability.name}</strong>.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quadra de Origem
                </label>
                <select
                  id="sourceCourtSelect"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma quadra...</option>
                  {courts
                    .filter((court) => court.id !== selectedCourtForAvailability.id)
                    .map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Atenção:</strong> Esta ação irá substituir todas as configurações
                  atuais desta quadra pelas configurações da quadra selecionada.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const select = document.getElementById('sourceCourtSelect') as HTMLSelectElement
                    const sourceCourtId = select.value

                    if (!sourceCourtId) {
                      alert('Selecione uma quadra de origem')
                      return
                    }

                    if (
                      !confirm(
                        `Tem certeza que deseja copiar todas as configurações da quadra selecionada para ${selectedCourtForAvailability.name}? Esta ação não pode ser desfeita.`
                      )
                    ) {
                      return
                    }

                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
                      const token = localStorage.getItem('token')

                      const response = await axios.post(
                        `${apiUrl}/courts/${selectedCourtForAvailability.id}/availability/copy-from/${sourceCourtId}`,
                        {},
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      )

                      alert(
                        response.data.message ||
                          `Configurações copiadas com sucesso! ${response.data.copied || 0} configurações copiadas.`
                      )

                      // Recarrega a disponibilidade
                      if (selectedCourtForAvailability) {
                        await openAvailabilityModal(selectedCourtForAvailability)
                      }

                      setShowCopyModal(false)
                    } catch (error: any) {
                      alert(
                        error.response?.data?.message ||
                          error.message ||
                          'Erro ao copiar configurações'
                      )
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Copiar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Replicação */}
      {showReplicateModal && selectedCourtForAvailability && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Replicar Horários - {selectedCourtForAvailability.name}
                </h3>
                <button
                  onClick={() => {
                    setShowReplicateModal(false)
                    setWeekdaySlots([])
                    setWeekendSlots([])
                    setWeekdayPremiumSlots([])
                    setWeekendPremiumSlots([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Selecione os horários clicando nos botões. Os horários selecionados serão replicados para todos os dias de semana ou finais de semana.
              </p>

              <div className="space-y-6">
                {/* Horários para Dias de Semana */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Horários para Dias de Semana (Segunda a Sexta)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (weekdaySlots.length > 0) {
                          setWeekdaySlots([])
                        } else {
                          // Gera todos os horários de 6:00 às 23:00
                          const allSlots: string[] = []
                          for (let hour = 6; hour < 24; hour++) {
                            allSlots.push(`${String(hour).padStart(2, '0')}:00`)
                            allSlots.push(`${String(hour).padStart(2, '0')}:30`)
                          }
                          setWeekdaySlots(allSlots)
                        }
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      {weekdaySlots.length > 0 ? 'Limpar Todos' : 'Selecionar Todos'}
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const timeSlots: string[] = []
                        for (let hour = 6; hour < 24; hour++) {
                          timeSlots.push(`${String(hour).padStart(2, '0')}:00`)
                          timeSlots.push(`${String(hour).padStart(2, '0')}:30`)
                        }
                        return timeSlots.map((timeSlot) => {
                          const isSelected = weekdaySlots.includes(timeSlot)
                          const isPremium = weekdayPremiumSlots.includes(timeSlot)
                          const hasConflict = !isSelected && weekdaySlots.some((slot) => hasTimeConflict(slot, timeSlot))
                          
                          return (
                            <div key={timeSlot} className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setWeekdaySlots(weekdaySlots.filter((s) => s !== timeSlot))
                                    setWeekdayPremiumSlots(weekdayPremiumSlots.filter((s) => s !== timeSlot))
                                  } else {
                                    // Verifica conflitos antes de adicionar
                                    const conflicts = weekdaySlots.filter((slot) => hasTimeConflict(slot, timeSlot))
                                    if (conflicts.length > 0) {
                                      alert(
                                        `Não é possível selecionar ${timeSlot} pois conflita com: ${conflicts.join(', ')}`
                                      )
                                      return
                                    }
                                    setWeekdaySlots([...weekdaySlots, timeSlot].sort())
                                  }
                                }}
                                disabled={hasConflict}
                                title={
                                  hasConflict
                                    ? 'Este horário conflita com outro horário selecionado'
                                    : isSelected
                                    ? 'Clique para desmarcar'
                                    : 'Clique para marcar'
                                }
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  isSelected
                                    ? isPremium
                                      ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                                    : hasConflict
                                    ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-50'
                                    : 'bg-white text-gray-700 hover:bg-gray-200 cursor-pointer border border-gray-300'
                                }`}
                              >
                                {timeSlot}
                              </button>
                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (isPremium) {
                                      setWeekdayPremiumSlots(weekdayPremiumSlots.filter((s) => s !== timeSlot))
                                    } else {
                                      setWeekdayPremiumSlots([...weekdayPremiumSlots, timeSlot].sort())
                                    }
                                  }}
                                  title={
                                    isPremium
                                      ? 'Horário nobre - Clique para remover'
                                      : 'Clique para marcar como horário nobre'
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    isPremium
                                      ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                  }`}
                                >
                                  <Star
                                    size={16}
                                    className={isPremium ? 'fill-current' : ''}
                                  />
                                </button>
                              )}
                            </div>
                          )
                        })
                      })()}
                    </div>
                    {weekdaySlots.length > 0 && (
                      <p className="mt-3 text-xs text-gray-600">
                        {weekdaySlots.length} horário(s) selecionado(s): {weekdaySlots.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Horários para Finais de Semana */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Horários para Finais de Semana (Sábado e Domingo)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (weekendSlots.length > 0) {
                          setWeekendSlots([])
                        } else {
                          // Gera todos os horários de 6:00 às 23:00
                          const allSlots: string[] = []
                          for (let hour = 6; hour < 24; hour++) {
                            allSlots.push(`${String(hour).padStart(2, '0')}:00`)
                            allSlots.push(`${String(hour).padStart(2, '0')}:30`)
                          }
                          setWeekendSlots(allSlots)
                        }
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      {weekendSlots.length > 0 ? 'Limpar Todos' : 'Selecionar Todos'}
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const timeSlots: string[] = []
                        for (let hour = 6; hour < 24; hour++) {
                          timeSlots.push(`${String(hour).padStart(2, '0')}:00`)
                          timeSlots.push(`${String(hour).padStart(2, '0')}:30`)
                        }
                        return timeSlots.map((timeSlot) => {
                          const isSelected = weekendSlots.includes(timeSlot)
                          const isPremium = weekendPremiumSlots.includes(timeSlot)
                          const hasConflict = !isSelected && weekendSlots.some((slot) => hasTimeConflict(slot, timeSlot))
                          
                          return (
                            <div key={timeSlot} className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setWeekendSlots(weekendSlots.filter((s) => s !== timeSlot))
                                    setWeekendPremiumSlots(weekendPremiumSlots.filter((s) => s !== timeSlot))
                                  } else {
                                    // Verifica conflitos antes de adicionar
                                    const conflicts = weekendSlots.filter((slot) => hasTimeConflict(slot, timeSlot))
                                    if (conflicts.length > 0) {
                                      alert(
                                        `Não é possível selecionar ${timeSlot} pois conflita com: ${conflicts.join(', ')}`
                                      )
                                      return
                                    }
                                    setWeekendSlots([...weekendSlots, timeSlot].sort())
                                  }
                                }}
                                disabled={hasConflict}
                                title={
                                  hasConflict
                                    ? 'Este horário conflita com outro horário selecionado'
                                    : isSelected
                                    ? 'Clique para desmarcar'
                                    : 'Clique para marcar'
                                }
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  isSelected
                                    ? isPremium
                                      ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                                    : hasConflict
                                    ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-50'
                                    : 'bg-white text-gray-700 hover:bg-gray-200 cursor-pointer border border-gray-300'
                                }`}
                              >
                                {timeSlot}
                              </button>
                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (isPremium) {
                                      setWeekendPremiumSlots(weekendPremiumSlots.filter((s) => s !== timeSlot))
                                    } else {
                                      setWeekendPremiumSlots([...weekendPremiumSlots, timeSlot].sort())
                                    }
                                  }}
                                  title={
                                    isPremium
                                      ? 'Horário nobre - Clique para remover'
                                      : 'Clique para marcar como horário nobre'
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    isPremium
                                      ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                  }`}
                                >
                                  <Star
                                    size={16}
                                    className={isPremium ? 'fill-current' : ''}
                                  />
                                </button>
                              )}
                            </div>
                          )
                        })
                      })()}
                    </div>
                    {weekendSlots.length > 0 && (
                      <p className="mt-3 text-xs text-gray-600">
                        {weekendSlots.length} horário(s) selecionado(s): {weekendSlots.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplicateModal(false)
                    setWeekdaySlots([])
                    setWeekendSlots([])
                    setWeekdayPremiumSlots([])
                    setWeekendPremiumSlots([])
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (weekdaySlots.length === 0 && weekendSlots.length === 0) {
                      alert('Selecione pelo menos um horário para dias de semana ou finais de semana')
                      return
                    }

                    replicateAvailability(
                      weekdaySlots,
                      weekendSlots,
                      weekdayPremiumSlots,
                      weekendPremiumSlots
                    )
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Replicar Horários
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
