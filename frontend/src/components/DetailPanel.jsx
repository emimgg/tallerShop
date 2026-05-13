import { useState, useEffect } from 'react'

function DetailPanel({ item, fields, onClose, onDelete, title, onSave, editableFields }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    if (item) {
      const initial = {}
      if (editableFields) {
        editableFields.forEach(f => { initial[f.key] = item[f.key] ?? '' })
      }
      setEditForm(initial)
      setIsEditing(false)
    }
  }, [item?.id])

  if (!item) return null

  async function handleSave(e) {
    e.preventDefault()
    await onSave(item.id, editForm)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div className="relative w-full md:w-96 bg-white h-full shadow-xl flex flex-col z-10">
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
          {isEditing && editableFields ? (
            <form id="detail-edit-form" onSubmit={handleSave} className="space-y-4">
              {editableFields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={editForm[field.key] ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </form>
          ) : (
            fields.map(field => (
              <div key={field.key}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {field.label}
                </p>
                <p className="text-gray-800 mt-1 font-medium">
                  {field.format ? field.format(item[field.key]) : item[field.key] || '—'}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t space-y-2">
          {onSave && editableFields && (
            isEditing ? (
              <div className="flex gap-2">
                <button
                  type="submit"
                  form="detail-edit-form"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
              >
                Editar
              </button>
            )
          )}
          {!isEditing && (
            <button
              onClick={() => onDelete(item.id)}
              className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
            >
              Borrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailPanel
