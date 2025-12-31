'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    courts: 0,
    bookings: 0,
    classes: 0,
    products: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const token = localStorage.getItem('token')

        const [courtsRes, bookingsRes, classesRes, productsRes] = await Promise.all([
          axios.get(`${apiUrl}/courts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/bookings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/classes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        setStats({
          courts: courtsRes.data.length,
          bookings: bookingsRes.data.length,
          classes: classesRes.data.length,
          products: productsRes.data.length,
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  const statCards = [
    { label: 'Quadras', value: stats.courts, href: '/dashboard/courts', color: 'bg-blue-500' },
    { label: 'Reservas', value: stats.bookings, href: '/dashboard/bookings', color: 'bg-green-500' },
    { label: 'Turmas', value: stats.classes, href: '/dashboard/classes', color: 'bg-purple-500' },
    { label: 'Produtos', value: stats.products, href: '/dashboard/products', color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-md`}>
                  <span className="text-white text-2xl">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.label}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}



