import React from 'react';

const ProfileView = ({ players, onUpdatePlayer, onRemovePlayer }) => {
    if (!players || players.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500 text-lg">등록된 참가자가 없습니다.</p>
                <p className="text-slate-400">참가자 등록 탭에서 선수를 추가해주세요.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">📋 프로필 관리</h2>
                <p className="text-slate-600">
                    선수들의 능력치와 <span className="text-indigo-600 font-bold">초기 경기 수</span>를 수정할 수 있습니다.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map(player => {
                    // Safety check: skip invalid player objects
                    if (!player) return null;

                    // Safety accessors
                    const playerId = player.id ? String(player.id) : 'unknown';
                    const playerStats = player.stats || {};

                    return (
                        <div key={playerId} className="relative bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors group">
                            <button
                                onClick={() => onRemovePlayer(player.id)}
                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                title="삭제"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${player.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                        {player.gender === 'M' ? '남' : '여'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                            {player.name || '이름없음'}
                                            <button
                                                onClick={() => onUpdatePlayer(player.id, { type: player.type === 'MEMBER' ? 'GUEST' : 'MEMBER' })}
                                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${player.type === 'GUEST'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                                                    : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                                    }`}
                                            >
                                                {player.type === 'GUEST' ? 'GUEST' : 'MEMBER'}
                                            </button>
                                        </h3>
                                        <div className="text-xs text-slate-400">ID: {playerId.slice(-4)}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 block text-right">Max Games</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={player.maxGames !== undefined ? player.maxGames : 4}
                                            onChange={(e) => onUpdatePlayer(player.id, { maxGames: Number(e.target.value) })}
                                            className="w-16 px-1 py-0.5 text-right text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">ARRIVAL</span>
                                    <input
                                        type="time"
                                        value={player.arrivalTime || '20:00'}
                                        onChange={(e) => onUpdatePlayer(player.id, { arrivalTime: e.target.value })}
                                        className="w-32 px-1 py-0.5 text-right text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Stats Editor */}
                            <div className="space-y-3 mb-4 bg-slate-50 p-3 rounded-lg">
                                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">능력치 수정 (1~5, 0.5단위)</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {['forehand', 'backhand', 'volley', 'serve', 'speed'].map(statProp => (
                                        <div key={statProp} className="flex flex-col">
                                            <label className="text-[10px] text-slate-500 font-semibold uppercase">{statProp}</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                step="0.5"
                                                value={playerStats[statProp] !== undefined ? playerStats[statProp] : 3}
                                                onChange={(e) => {
                                                    const val = Math.max(1, Math.min(5, Number(e.target.value)));
                                                    onUpdatePlayer(player.id, {
                                                        stats: { ...playerStats, [statProp]: val }
                                                    });
                                                }}
                                                className="w-full text-sm font-bold p-1 border border-slate-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfileView;
