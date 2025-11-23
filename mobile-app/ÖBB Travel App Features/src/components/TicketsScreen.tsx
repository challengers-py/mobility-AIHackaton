import { useState } from 'react';
import { Ticket, QrCode, Calendar, Clock, MapPin, ChevronRight, Download } from 'lucide-react';

interface TicketData {
  id: string;
  type: 'single' | 'weekly' | 'monthly' | 'klimaticket' | 'vorteilscard';
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  seat?: string;
  trainType?: string;
  validUntil?: string;
  cardNumber?: string;
  price: number;
}

export function TicketsScreen() {
  const [tickets] = useState<TicketData[]>([
    {
      id: 'T001',
      type: 'single',
      from: 'Wien Hbf',
      to: 'Salzburg Hbf',
      date: '23 Nov 2025',
      time: '14:25',
      seat: '5A',
      trainType: 'RJ 640',
      price: 22.90,
    },
    {
      id: 'W001',
      type: 'weekly',
      from: 'Wien',
      to: 'Graz',
      validUntil: '30 Nov 2025',
      price: 89.90,
    },
    {
      id: 'V001',
      type: 'vorteilscard',
      cardNumber: '1234 5678 9012',
      validUntil: '31 Dic 2025',
      price: 99.00,
    },
  ]);

  const getTicketIcon = (type: string) => {
    switch (type) {
      case 'vorteilscard':
        return '💳';
      case 'klimaticket':
        return '🌿';
      case 'weekly':
      case 'monthly':
        return '📅';
      default:
        return '🎫';
    }
  };

  const getTicketTitle = (ticket: TicketData) => {
    switch (ticket.type) {
      case 'single':
        return `${ticket.from} → ${ticket.to}`;
      case 'weekly':
        return `Weekly Ticket: ${ticket.from} → ${ticket.to}`;
      case 'monthly':
        return `Monthly Ticket: ${ticket.from} → ${ticket.to}`;
      case 'vorteilscard':
        return 'Vorteilscard';
      case 'klimaticket':
        return 'KlimaTicket Austria';
      default:
        return 'Ticket';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">My Tickets</h2>
        <p className="text-gray-600">All your tickets saved in your account</p>
      </div>

      {/* Widget info banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <h3 className="text-lg mb-2">📱 Home screen widgets</h3>
        <p className="text-sm text-blue-50 mb-4">
          Place your tickets, Vorteilscard or KlimaTicket on your smartphone home screen for quick access
        </p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
          Configure widgets
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center gap-2">
          <Calendar className="w-8 h-8 text-red-600" />
          <span className="text-sm text-gray-900">Weekly Ticket</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center gap-2">
          <Calendar className="w-8 h-8 text-red-600" />
          <span className="text-sm text-gray-900">Monthly Ticket</span>
        </button>
      </div>

      {/* Tickets list */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTicketIcon(ticket.type)}</span>
                  <span className="text-sm opacity-80">#{ticket.id}</span>
                </div>
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg">{getTicketTitle(ticket)}</h3>
            </div>

            <div className="p-4">
              {ticket.type === 'single' && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{ticket.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{ticket.time} • {ticket.trainType}</span>
                  </div>
                  {ticket.seat && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Seat {ticket.seat}</span>
                    </div>
                  )}
                </div>
              )}

              {(ticket.type === 'weekly' || ticket.type === 'monthly' || ticket.type === 'vorteilscard' || ticket.type === 'klimaticket') && (
                <div className="space-y-3 mb-4">
                  {ticket.validUntil && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Valid until: {ticket.validUntil}</span>
                    </div>
                  )}
                  {ticket.cardNumber && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Ticket className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">No.: {ticket.cardNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {/* QR Code placeholder */}
              <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center mb-4">
                <div className="w-32 h-32 bg-white border-4 border-gray-900 rounded-lg flex items-center justify-center mb-2">
                  <QrCode className="w-20 h-20 text-gray-900" />
                </div>
                <p className="text-xs text-gray-500">Scan to validate</p>
              </div>

              <button className="w-full bg-red-50 text-red-600 py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                <span>View full details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add to widget shortcut */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Long press any ticket to add it as a widget
        </p>
        <div className="flex justify-center gap-4">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl">
            🎫
          </div>
          <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl">
            💳
          </div>
          <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl">
            🌿
          </div>
        </div>
      </div>
    </div>
  );
}
