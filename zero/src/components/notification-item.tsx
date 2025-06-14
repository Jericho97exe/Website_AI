interface Deteccion {
  tipo: string;
  confianza: number;
  timestamp: string;
}

function NotificationItem({ tipo, confianza, timestamp }: Deteccion) {
  return (
    <div className="flex items-center bg-white shadow-md rounded-lg p-4 mb-3">
      <div className="flex-shrink-0">
        {/* Icono según el tipo */}
        {tipo === "persona" ? (
          <svg className="h-8 w-8 text-blue-500" /* icono */ />
        ) : (
          <svg className="h-8 w-8 text-gray-500" /* otro */ />
        )}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-semibold text-gray-800">
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)} detectado
        </p>
        <p className="text-sm text-gray-600">
          Confianza: {Math.round(confianza * 100)}%
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(timestamp).toLocaleString()}
        </p>
      </div>
      <button className="ml-4 text-gray-400 hover:text-gray-600">
        &times;
      </button>
    </div>
  )
}