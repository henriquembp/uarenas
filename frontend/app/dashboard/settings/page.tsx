'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Upload, Palette, Save, Image as ImageIcon, X } from 'lucide-react'

interface Organization {
  id: string
  name: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  subdomain: string
  plan: string
}

export default function SettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#8B5CF6',
    accentColor: '#F59E0B',
  })

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      if (!token) {
        alert('Token não encontrado. Faça login novamente.')
        window.location.href = '/login'
        return
      }

      const response = await axios.get(`${apiUrl}/organizations/current`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.data) {
        throw new Error('Resposta vazia do servidor')
      }

      setOrganization(response.data)
      setFormData({
        name: response.data.name || '',
        logoUrl: response.data.logoUrl || '',
        primaryColor: response.data.primaryColor || '#4F46E5',
        secondaryColor: response.data.secondaryColor || '#8B5CF6',
        accentColor: response.data.accentColor || '#F59E0B',
      })
      setPreviewImage(response.data.logoUrl || null)
    } catch (error: any) {
      console.error('Erro ao carregar organização:', error)
      
      let errorMessage = 'Erro ao carregar dados da organização'
      
      if (error.response) {
        // Erro da API
        if (error.response.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.'
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return
        } else if (error.response.status === 404) {
          errorMessage = 'Organização não encontrada'
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message
        } else {
          errorMessage = `Erro ${error.response.status}: ${error.response.statusText}`
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique se o backend está rodando.'
      } else {
        // Outro erro
        errorMessage = error.message || 'Erro desconhecido'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
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
        setFormData((prev) => ({ ...prev, logoUrl: response.data.url }))
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

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }))
    setPreviewImage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      const response = await axios.patch(
        `${apiUrl}/organizations/${organization?.id}`,
        {
          name: formData.name,
          logoUrl: formData.logoUrl || null,
          primaryColor: formData.primaryColor || null,
          secondaryColor: formData.secondaryColor || null,
          accentColor: formData.accentColor || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setOrganization(response.data)
      alert('Personalização salva com sucesso!')
      
      // Recarrega a página para aplicar as mudanças
      window.location.reload()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      alert(error.response?.data?.message || 'Erro ao salvar personalização')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Personalização da Organização</h1>
        <p className="mt-2 text-gray-600">
          Personalize a aparência da sua organização com logo e cores personalizadas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Organização
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="mr-2 h-5 w-5" />
            Logo da Organização
          </h2>
          
          <div className="space-y-4">
            {previewImage ? (
              <div className="relative inline-block">
                <img
                  src={previewImage}
                  alt="Logo"
                  className="h-32 w-32 object-contain border-2 border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Nenhuma logo cadastrada</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {previewImage ? 'Alterar Logo' : 'Adicionar Logo'}
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Enviando...' : 'Selecionar Imagem'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {previewImage && (
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="Ou cole a URL da imagem"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, GIF, WEBP (máx. 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Cores */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Cores da Interface
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cor Primária */}
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#4F46E5"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              <div
                className="mt-2 h-8 rounded"
                style={{ backgroundColor: formData.primaryColor }}
              />
            </div>

            {/* Cor Secundária */}
            <div>
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#8B5CF6"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              <div
                className="mt-2 h-8 rounded"
                style={{ backgroundColor: formData.secondaryColor }}
              />
            </div>

            {/* Cor de Destaque */}
            <div>
              <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Destaque
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="accentColor"
                  value={formData.accentColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
                  placeholder="#F59E0B"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              <div
                className="mt-2 h-8 rounded"
                style={{ backgroundColor: formData.accentColor }}
              />
            </div>
          </div>

          {/* Preview das Cores */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview das Cores:</p>
            <div className="flex space-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded text-white text-sm"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Botão Primário
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded text-white text-sm"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                Botão Secundário
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded text-white text-sm"
                style={{ backgroundColor: formData.accentColor }}
              >
                Botão Destaque
              </button>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Personalização
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
