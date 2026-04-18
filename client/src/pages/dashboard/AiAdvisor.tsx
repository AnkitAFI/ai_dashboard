import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Chatbot from "@/components/chatbot/chatbot";
import { Menu, X, Sparkles, Bot } from "lucide-react";
import { useAuth } from "@/App";

export default function AiAdvisor() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden transform transition-transform shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg 
          rounded-none sm:rounded-2xl 
          px-4 sm:px-6 lg:px-8 
          py-4 sm:py-5 
          mb-4 sm:mb-6 
          flex items-center 
          justify-between gap-4 
          sticky top-0 sm:top-4 
          z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-sky-900" />
            </button>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
                AI Advisor <Sparkles className="w-5 h-5 text-amber-500" />
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Get intelligent insights and market analysis for your products
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-full">
            <Bot className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">AI Powered Assistant</span>
          </div>
        </header>

        {/* Full Screen Chatbot Component */}
        <main className="flex-1 px-4 sm:px-6 pb-6 h-full flex flex-col">
          <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-xl overflow-hidden flex flex-col">
            <Chatbot variant="fullscreen" />
          </div>
        </main>
      </div>
    </div>
  );
}
