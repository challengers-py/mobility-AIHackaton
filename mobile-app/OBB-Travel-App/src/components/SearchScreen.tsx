import { useState } from 'react';
import { Search, ArrowRight, Calendar, Users, Filter, DollarSign } from 'lucide-react';
import { ConnectionResults } from './ConnectionResults';
import { SeatSelection } from './SeatSelection';

export function SearchScreen() {
  const [from, setFrom] = useState('Wien Hbf');
  const [to, setTo] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'cheapest'>('all');

  const handleSearch = () => {
    if (from && to) {
      setShowResults(true);
      setShowSeatSelection(false);
    }
  };

  const handleSelectSeats = (connection: any) => {
    setSelectedConnection(connection);
    setShowSeatSelection(true);
  };

  const handleBackToResults = () => {
    setShowSeatSelection(false);
    setSelectedConnection(null);
  };

  if (showSeatSelection && selectedConnection) {
    return (
      <SeatSelection
        connection={selectedConnection}
        onBack={handleBackToResults}
      />
    );
  }

  if (showResults) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button
          onClick={() => setShowResults(false)}
          className="text-red-600 mb-4 flex items-center gap-2"
        >
          ← Back to search
        </button>
        
        {/* Price Filter */}
        <div className="mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600">Filter by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                priceFilter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriceFilter('cheapest')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                priceFilter === 'cheapest'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Cheapest first
            </button>
          </div>
        </div>

        <ConnectionResults
          from={from}
          to={to}
          priceFilter={priceFilter}
          onSelectSeats={handleSelectSeats}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl text-gray-900">Search Connection</h2>

        {/* From/To inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">From</label>
            <div className="relative">
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Departure station"
                className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-center">
            <button className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors">
              <ArrowRight className="w-5 h-5 rotate-90" />
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">To</label>
            <div className="relative">
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Destination station"
                className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Date and time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Date</label>
            <div className="relative">
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Time</label>
            <div className="relative">
              <input
                type="time"
                defaultValue="14:00"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Passengers</label>
          <button className="w-full p-4 border border-gray-300 rounded-xl flex items-center justify-between hover:border-red-500 transition-colors">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">1 Adult</span>
            </div>
            <span className="text-gray-400">Change</span>
          </button>
        </div>

        {/* Additional options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-red-600 rounded" />
            <span className="text-sm text-gray-700">With bicycle</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-red-600 rounded" />
            <span className="text-sm text-gray-700">With dog</span>
          </label>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!from || !to}
          className="w-full bg-red-600 text-white p-4 rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Search connections
        </button>
      </div>

      {/* Popular routes */}
      <div className="mt-6">
        <h3 className="text-lg text-gray-900 mb-4">Popular routes</h3>
        <div className="grid gap-3">
          {['Salzburg Hbf', 'Graz Hbf', 'Innsbruck Hbf', 'Linz Hbf'].map((destination) => (
            <button
              key={destination}
              onClick={() => {
                setTo(destination);
              }}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Wien Hbf →</p>
                  <p className="text-gray-900">{destination}</p>
                </div>
              </div>
              <span className="text-sm text-red-600">from €19.90</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
