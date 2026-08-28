import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, LogIn, Users, Sparkles } from "lucide-react";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/JoinRoomModal";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function GroupLobbyPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-cream font-body flex flex-col">
      {/* Navbar */}
      <nav className="h-16 sm:h-20 border-b border-warm-border bg-white/50 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/dashboard"
            className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-brown/5 text-brown transition-colors"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <span className="font-display text-base sm:text-lg font-bold text-brown">
            {t('groupLobby.title')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-brown-muted">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">{t('groupLobby.collaborate')}</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-teal/5 blur-[80px] sm:blur-[100px] animate-pulse" />
          <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-brown/5 blur-[100px] sm:blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-teal/10 border border-teal/20 text-teal font-bold text-xs sm:text-sm mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{t('groupLobby.badge')}</span>
              <span className="xs:hidden">{t('groupLobby.badge')}</span>
            </div>
            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brown mb-3 sm:mb-4 drop-shadow-sm px-4">
              {t('groupLobby.heading')}
              <br />
              <span className="text-teal">{t('groupLobby.headingTeam')}</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-brown-muted max-w-2xl mx-auto leading-relaxed px-4">
              {t('groupLobby.subtitle')}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto px-4">
            {/* Create Room Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative flex flex-col items-start rounded-2xl sm:rounded-[2rem] border-2 border-warm-border bg-white p-6 sm:p-8 lg:p-10 shadow-lg transition-all duration-300 hover:border-teal hover:shadow-2xl hover:shadow-teal/10 hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-[0.98]"
            >
              {/* Floating Icon */}
              <div className="absolute -top-4 sm:-top-6 left-6 sm:left-10 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal to-teal-light text-white shadow-xl shadow-teal/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
              </div>

              <div className="mt-4 sm:mt-6 w-full">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-brown mb-2 sm:mb-3">
                  {t('groupLobby.createRoom')}
                </h3>
                <p className="text-sm sm:text-base text-brown-muted leading-relaxed mb-4 sm:mb-6">
                  {t('groupLobby.createRoomDesc')}
                </p>

                <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-warm-border">
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-teal uppercase tracking-wide">
                      {t('groupLobby.youreLeader')}
                    </p>
                    <p className="text-xs text-brown-muted mt-1">
                      {t('groupLobby.controlSettings')}
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-teal/10 text-teal transition-all duration-300 group-hover:bg-teal group-hover:text-white shrink-0">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </div>
            </button>

            {/* Join Room Card */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="group relative flex flex-col items-start rounded-2xl sm:rounded-[2rem] border-2 border-warm-border bg-white p-6 sm:p-8 lg:p-10 shadow-lg transition-all duration-300 hover:border-brown hover:shadow-2xl hover:shadow-brown/10 hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-[0.98]"
            >
              {/* Floating Icon */}
              <div className="absolute -top-4 sm:-top-6 left-6 sm:left-10 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-brown to-brown-light text-white shadow-xl shadow-brown/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <LogIn className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
              </div>

              <div className="mt-4 sm:mt-6 w-full">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-brown mb-2 sm:mb-3">
                  {t('groupLobby.joinRoom')}
                </h3>
                <p className="text-sm sm:text-base text-brown-muted leading-relaxed mb-4 sm:mb-6">
                  {t('groupLobby.joinRoomDesc')}
                </p>

                <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-warm-border">
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-brown uppercase tracking-wide">
                      {t('groupLobby.teamMember')}
                    </p>
                    <p className="text-xs text-brown-muted mt-1">
                      {t('groupLobby.needCode')}
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-brown/10 text-brown transition-all duration-300 group-hover:bg-brown group-hover:text-white shrink-0">
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 sm:mt-12 lg:mt-16 max-w-3xl mx-auto px-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-warm-border p-6 sm:p-8 shadow-sm">
              <h3 className="font-display text-base sm:text-lg font-bold text-brown mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
                {t('groupLobby.howItWorks')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-teal/10 text-teal font-bold text-sm">
                    1
                  </div>
                  <p className="text-brown-muted leading-relaxed">
                    <strong className="text-brown">{t('groupLobby.step1')}</strong> {t('groupLobby.step1Desc')}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-teal/10 text-teal font-bold text-sm">
                    2
                  </div>
                  <p className="text-brown-muted leading-relaxed">
                    <strong className="text-brown">{t('groupLobby.step2')}</strong> {t('groupLobby.step2Desc')}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-teal/10 text-teal font-bold text-sm">
                    3
                  </div>
                  <p className="text-brown-muted leading-relaxed">
                    <strong className="text-brown">{t('groupLobby.step3')}</strong> {t('groupLobby.step3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
      {showJoinModal && (
        <JoinRoomModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
}
