import React from 'react';

const PlayerList = ({ players, onRemovePlayer, schedule }) => {
    // Helper to count scheduled games
    const getScheduledGamesCount = (playerId) => {
        if (!schedule) return 0;
        let count = 0;
        schedule.forEach(round => {
            round.matches.forEach(match => {
                if (match.team1.some(p => p.id === playerId) || match.team2.some(p => p.id === playerId)) {
                    count++;
                }
            });
        });
        return count;
    };

    if (players.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">참가자를 등록해주세요.</p>
            </div>
        );
    }

    // Sort players by total score (descending)
    const sortedPlayers = [...players].sort((a, b) => {
        const getScore = (p) => {
            const stats = p.stats || {};
            return (stats.forehand || 0) + (stats.backhand || 0) + (stats.volley || 0) + (stats.serve || 0) + (stats.speed || 3);
        };
        return getScore(b) - getScore(a);
    });

    // Split into members and guests
    const members = sortedPlayers.filter(p => p.type !== 'GUEST');
    const guests = sortedPlayers.filter(p => p.type === 'GUEST');

    const renderPlayerRow = (player) => {
        // Ensure stats exist (backwards compatibility)
        const speed = player.stats.speed || 3;
        const totalScore = player.stats.forehand + player.stats.backhand + player.stats.volley + player.stats.serve + speed;
        const scheduledGames = getScheduledGamesCount(player.id);

        return (
            <li key={player.id} className="px-4 py-3 hover:bg-slate-50 flex items-center justify-between group">
                <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ${player.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {player.gender === 'M' ? '남' : '여'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 truncate">{player.name}</span>
                            {player.type === 'GUEST' && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-full font-bold whitespace-nowrap">
                                    GUEST
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                            능력치 합계: <span className="font-bold text-indigo-700 text-sm">{totalScore}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Games</div>
                        <div className="font-bold text-slate-800 text-sm">
                            {player.maxGames === 0 ? (
                                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs">불참</span>
                            ) : (
                                <>
                                    {scheduledGames}
                                    <span className="text-slate-400 text-xs font-normal"> / {player.maxGames !== undefined ? player.maxGames : 4}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => onRemovePlayer(player.id)}
                        className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="삭제"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </li>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-slate-700">참가자 목록 <span className="text-blue-600">({players.length}명)</span></h3>
                <span className="text-xs text-slate-400">점수 높은 순</span>
            </div>
            <ul className="divide-y divide-slate-100 overflow-y-auto flex-1 h-[600px] md:h-auto">
                {/* Members Section */}
                {members.length > 0 && (
                    <>
                        <li className="bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-800 uppercase tracking-wider sticky top-0 z-10 border-b border-indigo-100">
                            Members ({members.length})
                        </li>
                        {members.map(renderPlayerRow)}
                    </>
                )}

                {/* Guests Section */}
                {guests.length > 0 && (
                    <>
                        <li className="bg-orange-50 px-4 py-2 text-xs font-bold text-orange-800 uppercase tracking-wider sticky top-0 z-10 border-b border-orange-100 border-t border-slate-200">
                            Guests ({guests.length})
                        </li>
                        {guests.map(renderPlayerRow)}
                    </>
                )}
            </ul>
        </div>
    );
};

export default PlayerList;
