'use client'

export default function StockPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Novo Movimento
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Controle de estoque será exibido aqui.</p>
      </div>
    </div>
  )
}



