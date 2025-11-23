import { useState } from 'react';
import { Home, Ticket, Zap, ShoppingCart, User, Settings } from 'lucide-react';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { TicketsScreen } from './components/TicketsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { JourneyMap } from './components/JourneyMap';
import './index.css';
import obbLogo from './assets/logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tickets' | 'simpligo' | 'cart' | 'account' | 'map'>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToJourney={() => setActiveTab('map')} />;
      case 'tickets':
        return <TicketsScreen />;
      case 'simpligo':
        return <SearchScreen />;
      case 'cart':
        return <div className="max-w-6xl mx-auto p-4"><h2 className="text-2xl text-gray-900">Shopping Cart</h2></div>;
      case 'account':
        return <ProfileScreen />;
      case 'map':
        return <JourneyMap />;
      default:
        return <HomeScreen onNavigateToJourney={() => setActiveTab('map')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header
        className="bg-white text-gray-900 p-4 shadow-lg border-b-4 border-red-600"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={obbLogo} alt="ÖBB Logo" className="h-12 object-contain" />
          </div>
          <Settings className="w-6 h-6 cursor-pointer text-gray-700" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-4 transition-colors ${
              activeTab === 'home' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Start</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center gap-1 p-4 transition-colors ${
              activeTab === 'tickets' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <Ticket className="w-6 h-6" />
            <span className="text-xs">Tickets</span>
          </button>
          <button
            onClick={() => setActiveTab('simpligo')}
            className={`flex flex-col items-center gap-1 p-4 transition-colors ${
              activeTab === 'simpligo' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <Zap className="w-6 h-6" />
            <span className="text-xs">SimplyGo!</span>
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center gap-1 p-4 transition-colors ${
              activeTab === 'cart' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">Warenkorb</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center gap-1 p-4 transition-colors ${
              activeTab === 'account' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Mein Konto</span>
          </button>
        </div>
      </nav>
    </div>
  );
}