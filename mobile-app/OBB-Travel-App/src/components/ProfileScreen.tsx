import { User, CreditCard, Bell, Shield, HelpCircle, LogOut, ChevronRight, Zap, Calendar } from 'lucide-react';

export function ProfileScreen() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl">Maria Schmidt</h2>
            <p className="text-red-100">maria.schmidt@email.com</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">24</p>
            <p className="text-xs text-red-100">Trips this year</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">€340</p>
            <p className="text-xs text-red-100">Total saved</p>
          </div>
        </div>
      </div>

      {/* Cards section */}
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-4">My Cards</h3>
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">Vorteilscard</span>
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-sm text-green-100">Valid until: 31 Dec 2025</p>
            <p className="text-xs text-green-100 mt-1">50% discount on trips</p>
          </div>
          
          <button className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-red-500 hover:bg-red-50 transition-all">
            <span className="text-gray-600">+ Add KlimaTicket</span>
          </button>
        </div>
      </div>

      {/* Settings sections */}
      <div className="space-y-4">
        {/* Account settings */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <h3 className="text-lg text-gray-900 p-4 border-b border-gray-200">Account</h3>
          <div className="divide-y divide-gray-200">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Personal information</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Payment methods</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <h3 className="text-lg text-gray-900 p-4 border-b border-gray-200">Preferences</h3>
          <div className="divide-y divide-gray-200">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="text-gray-900">SimplyGo</p>
                  <p className="text-xs text-gray-500">Enabled</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Favorite routes</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <h3 className="text-lg text-gray-900 p-4 border-b border-gray-200">Support</h3>
          <div className="divide-y divide-gray-200">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Help center</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Privacy and security</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button className="w-full bg-white rounded-2xl shadow-md p-4 flex items-center justify-center gap-3 hover:bg-red-50 transition-colors text-red-600">
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>ÖBB App v3.2.1</p>
        <p className="mt-1">© 2025 Austrian Federal Railways</p>
      </div>
    </div>
  );
}
