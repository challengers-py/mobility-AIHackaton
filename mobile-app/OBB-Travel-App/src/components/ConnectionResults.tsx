import { Train, Clock, Euro, ChevronRight } from 'lucide-react';

interface Connection {
  id: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  changes: number;
  price: number;
  priceType: 'standard' | 'sparschiene';
  platforms: string[];
}

interface ConnectionResultsProps {
  from: string;
  to: string;
  priceFilter: 'all' | 'cheapest';
  onSelectSeats: (connection: Connection) => void;
}

export function ConnectionResults({ from, to, priceFilter, onSelectSeats }: ConnectionResultsProps) {
  const connections: Connection[] = [
    {
      id: '1',
      trainType: 'RJ 640',
      departureTime: '14:25',
      arrivalTime: '17:04',
      duration: '2h 39m',
      changes: 0,
      price: 19.90,
      priceType: 'sparschiene',
      platforms: ['7', '3'],
    },
    {
      id: '2',
      trainType: 'RJ 642',
      departureTime: '15:25',
      arrivalTime: '18:04',
      duration: '2h 39m',
      changes: 0,
      price: 29.90,
      priceType: 'sparschiene',
      platforms: ['8', '3'],
    },
    {
      id: '3',
      trainType: 'RJ 644',
      departureTime: '16:25',
      arrivalTime: '19:04',
      duration: '2h 39m',
      changes: 0,
      price: 56.40,
      priceType: 'standard',
      platforms: ['7', '3'],
    },
    {
      id: '4',
      trainType: 'RJ 646',
      departureTime: '17:25',
      arrivalTime: '20:04',
      duration: '2h 39m',
      changes: 0,
      price: 39.90,
      priceType: 'sparschiene',
      platforms: ['8', '3'],
    },
  ];

  const sortedConnections = priceFilter === 'cheapest'
    ? [...connections].sort((a, b) => a.price - b.price)
    : connections;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900">{from}</p>
            <p className="text-gray-500 text-sm">→ {to}</p>
          </div>
          <p className="text-sm text-gray-600">{connections.length} conexiones encontradas</p>
        </div>
      </div>

      {sortedConnections.map((connection, index) => (
        <div key={connection.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
          {priceFilter === 'cheapest' && index === 0 && connection.priceType === 'sparschiene' && (
            <div className="bg-green-500 text-white px-4 py-2 text-sm flex items-center gap-2">
              <Euro className="w-4 h-4" />
              ¡Oferta más barata! Sparschiene
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center">
                  <p className="text-2xl text-gray-900">{connection.departureTime}</p>
                  <p className="text-xs text-gray-500">Andén {connection.platforms[0]}</p>
                </div>
                
                <div className="flex-1 relative">
                  <div className="h-px bg-gray-300 w-full"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {connection.duration}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl text-gray-900">{connection.arrivalTime}</p>
                  <p className="text-xs text-gray-500">Andén {connection.platforms[1]}</p>
                </div>
              </div>

              <div className="ml-6 text-right">
                <div className="flex items-center gap-2 mb-1">
                  {connection.priceType === 'sparschiene' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Sparschiene
                    </span>
                  )}
                </div>
                <p className="text-2xl text-gray-900">€{connection.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">por persona</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Train className="w-4 h-4" />
                  {connection.trainType}
                </div>
                {connection.changes === 0 ? (
                  <span className="text-green-600">Directo</span>
                ) : (
                  <span>{connection.changes} cambio(s)</span>
                )}
              </div>

              <button
                onClick={() => onSelectSeats(connection)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                Seleccionar asiento
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
