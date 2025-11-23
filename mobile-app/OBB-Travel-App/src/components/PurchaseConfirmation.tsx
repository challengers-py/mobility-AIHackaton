import { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';

interface PurchaseConfirmationProps {
  connection: any;
  selectedSeats: string[];
  onBack: () => void;
}

export function PurchaseConfirmation({ connection, selectedSeats, onBack }: PurchaseConfirmationProps) {
  const [purchased, setPurchased] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [showCancelOption, setShowCancelOption] = useState(false);

  useEffect(() => {
    if (purchased && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowCancelOption(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [purchased, timeLeft]);

  const handlePurchase = () => {
    setPurchased(true);
    setShowCancelOption(true);
  };

  const handleCancel = () => {
    setPurchased(false);
    setTimeLeft(180);
    setShowCancelOption(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (purchased) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl text-gray-900 mb-4">¡Compra confirmada!</h2>
          <p className="text-gray-600 mb-8">Tu entrada ha sido guardada en tu cuenta</p>

          {showCancelOption && timeLeft > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-2xl text-blue-900">{formatTime(timeLeft)}</span>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Puedes cancelar tu compra sin costo en los próximos 3 minutos
              </p>
              <button
                onClick={handleCancel}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancelar compra
              </button>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
            <h3 className="text-lg text-gray-900 mb-4">Detalles de tu viaje</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tren:</span>
                <span className="text-gray-900">{connection.trainType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salida:</span>
                <span className="text-gray-900">{connection.departureTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Llegada:</span>
                <span className="text-gray-900">{connection.arrivalTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Asiento:</span>
                <span className="text-gray-900">{selectedSeats[0]}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-3">
                <span className="text-gray-900">Total:</span>
                <span className="text-xl text-gray-900">€{connection.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            Ver mis entradas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={onBack}
        className="text-red-600 mb-4 flex items-center gap-2"
      >
        ← Volver
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl text-gray-900 mb-6">Confirmar compra</h2>

        <div className="space-y-6">
          {/* Journey details */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg text-gray-900 mb-4">Detalles del viaje</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tren:</span>
                <span className="text-gray-900">{connection.trainType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salida:</span>
                <span className="text-gray-900">{connection.departureTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Llegada:</span>
                <span className="text-gray-900">{connection.arrivalTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="text-gray-900">{connection.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Asiento seleccionado:</span>
                <span className="text-gray-900">{selectedSeats[0]} (Ventana)</span>
              </div>
            </div>
          </div>

          {/* Passenger info */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg text-gray-900 mb-4">Pasajeros</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">1 Adulto</span>
                <span className="text-gray-900">€{connection.price.toFixed(2)}</span>
              </div>
              <button className="text-red-600 text-sm hover:underline">
                + Añadir pasajero acompañante
              </button>
            </div>
          </div>

          {/* Price summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">€{connection.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Reserva de asiento:</span>
              <span className="text-gray-900">€3.00</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-900">Total:</span>
                <span className="text-2xl text-gray-900">€{(connection.price + 3).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cancel policy */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900 mb-1">Cancelación gratuita en 3 minutos</p>
                <p className="text-xs text-gray-600">
                  Después de completar la compra, tendrás 3 minutos para cancelar sin ningún costo. Esto incluye entradas Sparschiene.
                </p>
              </div>
            </div>
          </div>

          {/* Purchase button */}
          <button
            onClick={handlePurchase}
            className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 transition-colors text-lg"
          >
            Comprar entrada
          </button>
        </div>
      </div>
    </div>
  );
}
