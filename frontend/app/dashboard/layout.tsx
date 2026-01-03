'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  Users, 
  GraduationCap, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Settings
} from 'lucide-react'

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { href: '/dashboard/courts', label: 'Quadras', icon: Home, roles: ['ADMIN', 'VISITOR'] },
  { href: '/dashboard/bookings', label: 'Reservas', icon: Calendar, roles: ['ADMIN', 'VISITOR'] },
  { href: '/dashboard/classes', label: 'Turmas', icon: Users, roles: ['ADMIN'] },
  { href: '/dashboard/teachers', label: 'Professores', icon: GraduationCap, roles: ['ADMIN'] },
  { href: '/dashboard/invoices', label: 'Financeiro', icon: DollarSign, roles: ['ADMIN'] },
  { href: '/dashboard/products', label: 'Produtos', icon: ShoppingBag, roles: ['ADMIN'] },
  { href: '/dashboard/stock', label: 'Estoque', icon: Package, roles: ['ADMIN'] },
  { href: '/dashboard/sales', label: 'Vendas', icon: ShoppingCart, roles: ['ADMIN'] },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings, roles: ['ADMIN'] },
]

// Função para filtrar itens do menu baseado no role do usuário
const getMenuItems = (userRole: string) => {
  return allMenuItems.filter(item => item.roles.includes(userRole))
}

interface Organization {
  id: string
  name: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Verificar se VISITOR está tentando acessar uma rota não permitida
    if (parsedUser.role === 'VISITOR') {
      const allowedRoutes = ['/dashboard/courts', '/dashboard/bookings']
      if (!allowedRoutes.includes(pathname)) {
        // Redireciona para Quadras se tentar acessar rota não permitida
        router.push('/dashboard/courts')
        return
      }
    }
    
    // Buscar dados da organização
    const fetchOrganization = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await axios.get(`${apiUrl}/organizations/current`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOrganization(response.data)
      } catch (error) {
        console.error('Erro ao carregar organização:', error)
      }
    }

    fetchOrganization()
  }, [router, pathname])

  // Aplicar cores dinamicamente
  useEffect(() => {
    if (organization) {
      const root = document.documentElement
      if (organization.primaryColor) {
        root.style.setProperty('--org-primary', organization.primaryColor)
      }
      if (organization.secondaryColor) {
        root.style.setProperty('--org-secondary', organization.secondaryColor)
      }
      if (organization.accentColor) {
        root.style.setProperty('--org-accent', organization.accentColor)
      }
    }
  }, [organization])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-2">
              {organization?.logoUrl ? (
                <div className="flex items-center space-x-3">
                  <img 
                    src={organization.logoUrl} 
                    alt={organization.name || 'Logo'} 
                    className="h-10 w-10 object-contain rounded"
                  />
                  <h1 
                    className="text-xl font-bold"
                    style={{ color: organization.primaryColor || '#4F46E5' }}
                  >
                    {organization.name || 'Arenas'}
                  </h1>
                </div>
              ) : (
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: organization?.primaryColor || '#4F46E5' }}
                >
                  {organization?.name || 'Arenas'}
                </h1>
              )}
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {getMenuItems(user.role || 'VISITOR').map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      style={isActive ? {
                        backgroundColor: organization?.primaryColor || '#4F46E5',
                      } : {}}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={closeSidebar}
          />
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {organization?.logoUrl && (
                    <img 
                      src={organization.logoUrl} 
                      alt={organization.name || 'Logo'} 
                      className="h-8 w-8 object-contain rounded"
                    />
                  )}
                  <h1 
                    className="text-xl font-bold"
                    style={{ color: organization?.primaryColor || '#4F46E5' }}
                  >
                    {organization?.name || 'Arenas'}
                  </h1>
                </div>
                <button
                  onClick={closeSidebar}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-1">
                  {getMenuItems(user.role || 'VISITOR').map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={`group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        style={isActive ? {
                          backgroundColor: organization?.primaryColor || '#4F46E5',
                        } : {}}
                      >
                        <Icon
                          className={`mr-3 flex-shrink-0 h-6 w-6 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-3 flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              {organization?.logoUrl && (
                <img 
                  src={organization.logoUrl} 
                  alt={organization.name || 'Logo'} 
                  className="h-6 w-6 object-contain rounded"
                />
              )}
              <h1 
                className="text-lg font-bold"
                style={{ color: organization?.primaryColor || '#4F46E5' }}
              >
                {organization?.name || 'Arenas'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 hidden sm:block">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}



