import { useState } from 'react';
import { Star, Clock, ChevronRight, Zap, MapPin, Ticket, Map } from 'lucide-react';

interface FavoriteRoute {
  id: string;
  from: string;
  to: string;
  nextDepartures: Array<{
    time: string;
    arrivalTime: string;
    duration: string;
    delay: number;
    platform: string;
    trainType: string;
  }>;
}

interface HomeScreenProps {
  onNavigateToJourney?: () => void;
}

export function HomeScreen({ onNavigateToJourney }: HomeScreenProps) {
  const [simplyGoActive, setSimplyGoActive] = useState(false);
  const [favorites] = useState<FavoriteRoute[]>([
    {
      id: '1',
      from: 'Wien Hbf',
      to: 'Salzburg Hbf',
      nextDepartures: [
        { time: '14:25', arrivalTime: '17:04', duration: '2h 39m', delay: 0, platform: '7', trainType: 'RJ' },
        { time: '15:25', arrivalTime: '18:04', duration: '2h 39m', delay: 5, platform: '8', trainType: 'RJ' },
        { time: '16:25', arrivalTime: '19:04', duration: '2h 39m', delay: 0, platform: '7', trainType: 'RJ' },
      ],
    },
    {
      id: '2',
      from: 'Wien Hbf',
      to: 'Graz Hbf',
      nextDepartures: [
        { time: '14:40', arrivalTime: '17:10', duration: '2h 30m', delay: 0, platform: '4', trainType: 'RJ' },
        { time: '15:40', arrivalTime: '18:10', duration: '2h 30m', delay: 0, platform: '4', trainType: 'RJ' },
        { time: '16:40', arrivalTime: '19:12', duration: '2h 32m', delay: 2, platform: '5', trainType: 'RJ' },
      ],
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto p-4 pt-6 space-y-6" style={{ paddingTop: "max(1rem, calc(env(safe-area-inset-top) + 1rem))" }}>
      {/* SimplyGo Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl">SimplyGo</h2>
              <p className="text-sm text-purple-100">Travel without worries</p>
            </div>
          </div>
          <label className="relative inline-block w-14 h-8">
            <input
              type="checkbox"
              checked={simplyGoActive}
              onChange={(e) => setSimplyGoActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-white/30 rounded-full peer-checked:bg-green-500 transition-all cursor-pointer"></div>
            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>
        <p className="text-sm text-purple-50">
          SimplyGo automatically recognizes your routes and determines the most suitable fare. Travel flexibly and spontaneously!
        </p>
        {simplyGoActive && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Current route detected</span>
            </div>
            <p className="text-xs text-purple-100">Wien Westbahnhof → Wien Hbf</p>
            <p className="text-xs text-purple-100 mt-1">Estimated fare: €2.40</p>
          </div>
        )}
      </div>

      {/* Journey Card */}
      <div className="bg-red-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl">Journey</h2>
              <p className="text-sm text-red-100">Your trip, beautifully tracked</p>
            </div>
          </div>
          <button
            onClick={onNavigateToJourney}
            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all text-base font-semibold"
          >
            Start
          </button>
        </div>
        <p className="text-sm text-red-50">
          Track your real-time journey progress with interactive maps and live updates. Share your travel experience with us!
        </p>
      </div>

      {/* Favorites Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-900">Favorite Routes</h2>
          <button className="text-red-600 text-sm">Manage</button>
        </div>

        <div className="space-y-4">
          {favorites.map((route) => (
            <div key={route.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <div>
                      <p className="text-gray-900">{route.from}</p>
                      <p className="text-gray-500 text-sm">→ {route.to}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Next departures in real time</span>
                </div>

                {route.nextDepartures.map((departure, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-red-600">{departure.trainType}</span>
                        </div>
                        <span className="text-xs text-gray-500">Andén {departure.platform}</span>
                      </div>
                      {departure.delay === 0 ? (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          On time
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          +{departure.delay} min
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-lg text-gray-900">{departure.time}</p>
                        <p className="text-xs text-gray-500">{route.from.split(' ')[0]}</p>
                      </div>
                      
                      <div className="flex-1 relative">
                        <div className="h-0.5 bg-gray-300 w-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-2">
                          <span className="text-xs text-gray-600">{departure.duration}</span>
                        </div>
                      </div>
                      
                      <div className="text-center min-w-[50px]">
                        <p className="text-lg text-gray-900">{departure.arrivalTime}</p>
                        <p className="text-xs text-gray-500">{route.to.split(' ')[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <Ticket className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-sm text-gray-900">Weekly Tickets</p>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-900">Special Offers</p>
        </button>
      </div>
    </div>
  );
}