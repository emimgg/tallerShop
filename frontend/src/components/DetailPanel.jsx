function DetailPanel({ item, fields, onClose, onDelete, title }) {
  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div className="relative w-96 bg-white h-full shadow-xl flex flex-col z-10">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-auto">
          {fields.map(field => (
            <div key={field.key}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {field.label}
              </p>
              <p className="text-gray-800 mt-1 font-medium">
                {field.format ? field.format(item[field.key]) : item[field.key] || '—'}
              </p>
            </div>
          ))}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={() => onDelete(item.id)}
            className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailPanel