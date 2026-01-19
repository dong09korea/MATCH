import React from 'react';

const ScheduleView = ({ schedule, players }) => {
    if (!schedule || schedule.length === 0) return null;

    // Helper to get latest player stats
    const getPlayerTotalScore = (pid) => {
        const p = players.find(p => p.id === pid);
        if (!p) return 0;
        const speed = p.stats.speed || 3;
        return p.stats.forehand + p.stats.backhand + p.stats.volley + p.stats.serve + speed;
    };

    const getTeamTotalScore = (team) => {
        return team.reduce((sum, p) => sum + getPlayerTotalScore(p.id), 0);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📅 대진표 결과</span>
                    <span className="text-indigo-200 text-sm font-normal">({schedule.length} 라운드)</span>
                </h2>
            </div>

            <div className="divide-y divide-slate-100">
                {schedule.map((round) => (
                    <div key={round.round} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
                            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-lg">
                                <span className="text-slate-500 font-bold text-sm">ROUND {round.round}</span>
                                <div className="w-px h-4 bg-slate-300"></div>
                                <span className="text-slate-800 font-extrabold text-lg font-mono">{round.time}</span>
                            </div>

                            {/* Resting Players */}
                            <div className="flex-1 flex items-center gap-2 text-sm text-slate-500 overflow-x-auto">
                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">휴식</span>
                                <div className="flex gap-1 flex-wrap">
                                    {round.resting.length > 0 ? (
                                        round.resting.map(p => (
                                            <span key={p.id} className="text-slate-500">{p.name},</span>
                                        ))
                                    ) : (
                                        <span className="text-slate-300 italic">휴식 없음</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Matches Grid */}
                        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(round.matches.length, 2)} lg:grid-cols-${Math.min(round.matches.length, 3)} gap-4`}>
                            {round.matches.map((match, idx) => (
                                <div key={idx} className="bg-white border-2 border-slate-100 rounded-xl p-3 relative overflow-hidden group hover:border-indigo-200 transition-all">
                                    <div className="absolute top-0 left-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
                                        COURT {match.courtId}
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 items-center justify-center">
                                        {/* Team 1 */}
                                        <div className="flex gap-2 items-center">
                                            {match.team1.map(p => (
                                                <div key={p.id} className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-bold shadow-sm border ${p.gender === 'M' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-pink-50 text-pink-700 border-pink-100'}`}>
                                                    {p.name}
                                                    <span className="text-[10px] opacity-60">
                                                        ({getPlayerTotalScore(p.id)})
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1" title="팀 합산 점수">
                                                {getTeamTotalScore(match.team1)}
                                            </div>
                                        </div>

                                        <div className="text-slate-300 font-black text-xs">VS</div>

                                        {/* Team 2 */}
                                        <div className="flex gap-2 items-center">
                                            {match.team2.map(p => (
                                                <div key={p.id} className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-bold shadow-sm border ${p.gender === 'M' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-pink-50 text-pink-700 border-pink-100'}`}>
                                                    {p.name}
                                                    <span className="text-[10px] opacity-60">
                                                        ({getPlayerTotalScore(p.id)})
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1" title="팀 합산 점수">
                                                {getTeamTotalScore(match.team2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleView;
