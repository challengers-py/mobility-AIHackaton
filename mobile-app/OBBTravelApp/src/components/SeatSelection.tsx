import { useState } from 'react';
import { ArrowLeft, RotateCw, Check } from 'lucide-react';
import { PurchaseConfirmation } from './PurchaseConfirmation';

interface Seat {
  id: string;
  number: string;
  type: 'window' | 'aisle' | 'middle';
  status: 'available' | 'occupied' | 'selected';
  direction: 'forward' | 'backward';
}

interface SeatSelectionProps {
  connection: any;
  onBack: () => void;
}

export function SeatSelection({ connection, onBack }: SeatSelectionProps) {
  const [showPurchase, setShowPurchase] = useState(false);
  const [directionChange, setDirectionChange] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  // Mock seat layout for a train car
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const rows = 15;
    
    for (let row = 1; row <= rows; row++) {
      const direction = row <= 7 ? 'forward' : 'backward';
      
      // Left side (seats 1-2)
      seats.push({
        id: `${row}A`,
        number: `${row}A`,
        type: 'window',
        status: Math.random() > 0.6 ? 'occupied' : 'available',
        direction,
      });
      seats.push({
        id: `${row}B`,
        number: `${row}B`,
        type: 'aisle',
        status: Math.random() > 0.6 ? 'occupied' : 'available',
        direction,
      });
      
      // Right side (seats 3-4)
      seats.push({
        id: `${row}C`,
        number: `${row}C`,
        type: 'aisle',
        status: Math.random() > 0.6 ? 'occupied' : 'available',
        direction,
      });
      seats.push({
        id: `${row}D`,
        number: `${row}D`,
        type: 'window',
        status: Math.random() > 0.6 ? 'occupied' : 'available',
        direction,
      });
    }
    
    return seats;
  };

  const [seats] = useState<Seat[]>(generateSeats());

  const handleSeatClick = (seatId: string, status: string) => {
    if (status === 'occupied') return;
    
    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
    } else {
      newSelected.clear();
      newSelected.add(seatId);
    }
    setSelectedSeats(newSelected);
  };

  const getSeatClass = (seat: Seat): string => {
    if (selectedSeats.has(seat.id)) {
      return 'bg-red-600 text-white border-red-600';
    }
    if (seat.status === 'occupied') {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    return 'bg-white border-gray-300 hover:border-red-500 cursor-pointer';
  };

  const handleConfirm = () => {
    if (selectedSeats.size > 0) {
      setShowPurchase(true);
    }
  };

  if (showPurchase) {
    return (
      <PurchaseConfirmation
        connection={connection}
        selectedSeats={Array.from(selectedSeats)}
        onBack={() => setShowPurchase(false)}
      />
    );
  }

  const groupedSeats: Seat[][] = [];
  for (let i = 0; i < seats.length; i += 4) {
    groupedSeats.push(seats.slice(i, i + 4));
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={onBack}
        className="text-red-600 mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a resultados
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl text-gray-900 mb-2">Selección gráfica de asiento</h2>
          <p className="text-gray-600">{connection.trainType} • {connection.departureTime} - {connection.arrivalTime}</p>
        </div>

        {/* Direction change notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <RotateCw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-900 mb-1">Cambio de dirección del tren</p>
            <p className="text-xs text-gray-600">
              Este tren cambia de dirección en la fila 8. Los asientos con flecha hacia arriba ↑ miran en dirección de marcha al inicio, y los asientos con flecha hacia abajo ↓ después del cambio.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-600">Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🪟</span>
            <span className="text-sm text-gray-600">Ventana</span>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-gray-50 rounded-xl p-6 overflow-x-auto">
          <div className="min-w-[400px]">
            <div className="flex items-center justify-center mb-4 text-sm text-gray-600">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-300">
                → Dirección del tren (inicio del viaje)
              </div>
            </div>

            <div className="space-y-3">
              {groupedSeats.map((row, rowIndex) => (
                <div key={rowIndex}>
                  {rowIndex === 7 && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-lg text-sm text-gray-900 flex items-center gap-2">
                        <RotateCw className="w-4 h-4" />
                        Punto de cambio de dirección
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-3">
                    {/* Row number */}
                    <span className="text-sm text-gray-500 w-6 text-center">{rowIndex + 1}</span>
                    
                    {/* Left seats */}
                    <div className="flex gap-2">
                      {row.slice(0, 2).map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat.id, seat.status)}
                          className={`w-12 h-12 rounded border-2 transition-all flex items-center justify-center text-xs relative ${getSeatClass(seat)}`}
                          disabled={seat.status === 'occupied'}
                        >
                          {seat.type === 'window' && (
                            <span className="absolute -left-6 text-lg">🪟</span>
                          )}
                          <span>{seat.direction === 'forward' ? '↑' : '↓'}</span>
                          {selectedSeats.has(seat.id) && (
                            <Check className="w-4 h-4 absolute" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Aisle */}
                    <div className="w-8 h-12 bg-gray-200 rounded"></div>

                    {/* Right seats */}
                    <div className="flex gap-2">
                      {row.slice(2, 4).map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat.id, seat.status)}
                          className={`w-12 h-12 rounded border-2 transition-all flex items-center justify-center text-xs relative ${getSeatClass(seat)}`}
                          disabled={seat.status === 'occupied'}
                        >
                          <span>{seat.direction === 'forward' ? '↑' : '↓'}</span>
                          {selectedSeats.has(seat.id) && (
                            <Check className="w-4 h-4 absolute" />
                          )}
                          {seat.type === 'window' && (
                            <span className="absolute -right-6 text-lg">🪟</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {selectedSeats.size > 0 && (
              <p className="text-gray-600">
                Asiento seleccionado: <span className="text-gray-900">{Array.from(selectedSeats)[0]}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleConfirm}
            disabled={selectedSeats.size === 0}
            className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continuar con la compra
          </button>
        </div>
      </div>
    </div>
  );
}
