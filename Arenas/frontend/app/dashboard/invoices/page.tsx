'use client'

export default function InvoicesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Nova Fatura
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Lista de faturas será exibida aqui.</p>
      </div>
    </div>
  )
}



