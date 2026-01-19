import React, { useState, useEffect } from 'react';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import SettingsForm from './components/SettingsForm';
import ScheduleView from './components/ScheduleView';
import ProfileView from './components/ProfileView';
import HistoryView from './components/HistoryView';
import RegistrationOrderView from './components/RegistrationOrderView';
import SplashWarning from './components/SplashWarning';
import { generateSchedule } from './lib/scheduler';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('tennis_players');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(p => ({ initialGamesPlayed: 0, ...p }));
  });

  const [activeTab, setActiveTab] = useState('settings'); // settings, schedule, profile, history

  // Initialize Config & Constraints from LocalStorage
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('tennis_config');
    return saved ? JSON.parse(saved) : {
      courtCount: 1,
      startTime: '20:00',
      endTime: '22:00',
      matchDuration: 30,
    };
  });

  const [roundConstraints, setRoundConstraints] = useState(() => {
    const saved = localStorage.getItem('tennis_constraints');
    return saved ? JSON.parse(saved) : [];
  });

  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    localStorage.setItem('tennis_players', JSON.stringify(players));
  }, [players]);

  // Persist Config & Constraints
  useEffect(() => {
    localStorage.setItem('tennis_config', JSON.stringify(config));
    localStorage.setItem('tennis_constraints', JSON.stringify(roundConstraints));
  }, [config, roundConstraints]);

  const handleAddPlayer = (player) => {
    setPlayers([...players, { ...player, initialGamesPlayed: 0 }]);
  };

  const handleRemovePlayer = (id) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const handleUpdatePlayer = (id, updates) => {
    setPlayers(players.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleGenerateValues = () => {
    if (players.length < 4) {
      alert("최소 4명의 참가자가 필요합니다.");
      return;
    }
    const result = generateSchedule(players, config, roundConstraints);
    setSchedule(result);
    alert("대진표가 생성되었습니다! '대진표' 탭에서 확인하세요.");
    setActiveTab('schedule');
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === id
        ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-4 font-sans">
      {showSplash && <SplashWarning onDismiss={() => setShowSplash(false)} />}

      <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-xl overflow-hidden min-h-[90vh] flex flex-col">
        {/* Header */}
        <header className="bg-slate-900 text-white p-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">🎾 동현이가 만든 대진표 생성기</h1>
          <p className="text-slate-400 text-sm mt-1">스마트 복식 대진표 생성기</p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <TabButton id="settings" label="설정" icon="⚙️" />
          <TabButton id="schedule" label="대진표" icon="📅" />
          <TabButton id="order" label="참가순서" icon="🔢" />
          <TabButton id="profile" label="프로필/능력치" icon="👤" />
          <TabButton id="history" label="역대전적" icon="🏆" />
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 bg-slate-50 overflow-y-auto">

          {/* 1. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="space-y-6">
                <SettingsForm
                  config={config}
                  onConfigChange={setConfig}
                  roundConstraints={roundConstraints}
                  onRoundConstraintsChange={setRoundConstraints}
                />
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                  <h3 className="font-bold text-indigo-900 mb-2">💡 팁</h3>
                  <p className="text-sm text-indigo-700">모든 설정을 마치고 참가자를 등록한 뒤, 하단의 버튼을 눌러주세요.</p>
                  <button
                    onClick={handleGenerateValues}
                    className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-colors"
                  >
                    🚀 대진표 생성하기
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <PlayerList players={players} onRemovePlayer={handleRemovePlayer} schedule={schedule} />
              </div>
            </div>
          )}

          {/* 2. SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-fade-in relative">
              {!schedule && (
                <div className="text-center py-20">
                  <p className="text-slate-400 mb-4">아직 생성된 대진표가 없습니다.</p>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full"
                  >
                    설정 탭으로 이동
                  </button>
                </div>
              )}
              {schedule && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Schedule (Main) */}
                  <div className="lg:col-span-8">
                    <ScheduleView schedule={schedule} players={players} />
                  </div>
                  {/* Sidebar List (Status) */}
                  <div className="lg:col-span-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4">
                      <h3 className="font-bold text-slate-700 mb-3 text-sm">현재 경기 현황</h3>
                      <PlayerList players={players} onRemovePlayer={handleRemovePlayer} schedule={schedule} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in space-y-8">
              <ProfileView
                players={players}
                onUpdatePlayer={handleUpdatePlayer}
                onRemovePlayer={handleRemovePlayer}
              />

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">➕ 신규 참가자 등록</h3>
                <PlayerForm onAddPlayer={handleAddPlayer} defaultStartTime={config.startTime} />
              </div>
            </div>
          )}

          {/* 4. ORDER TAB */}
          {activeTab === 'order' && (
            <div className="animate-fade-in">
              <RegistrationOrderView
                players={players}
                onReorder={setPlayers}
                config={config}
              />
            </div>
          )}

          {/* 5. HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <HistoryView schedule={schedule} />
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="bg-slate-50 border-t border-slate-200 p-4 text-center text-slate-400 text-xs">
          <p>© {new Date().getFullYear()} MATCH. All rights reserved.</p>
          <p className="mt-1">Created by <span className="font-bold text-slate-600">dong09korea</span></p>
        </footer>
      </div>
    </div>
  );
}

export default App;
