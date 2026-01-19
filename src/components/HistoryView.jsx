import React from 'react';

const HistoryView = ({ schedule }) => {
    if (!schedule) {
        return (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
                <p className="text-slate-500">아직 생성된 대진표가 없습니다.</p>
                <p className="text-slate-400 text-sm mt-1">대진표를 먼저 생성해주세요.</p>
            </div>
        )
    }

    // Flatten matches for history
    const allMatches = [];
    schedule.forEach(round => {
        round.matches.forEach(match => {
            allMatches.push({ ...match, round: round.round, time: round.time });
        });
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">🏆 역대 전적</h2>
                <p className="text-slate-600">
                    현재 대진표의 모든 경기 기록입니다.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Round / Time</th>
                            <th className="px-6 py-3 text-center">Court</th>
                            <th className="px-6 py-3 text-right">Team A</th>
                            <th className="px-6 py-3 text-center">VS</th>
                            <th className="px-6 py-3 text-left">Team B</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allMatches.map((match, idx) => (
                            <tr key={idx} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    <span className="block text-xs text-slate-500">R{match.round}</span>
                                    {match.time}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-400">
                                    {match.courtId}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {match.team1.map(p => (
                                        <div key={p.id} className="font-bold text-indigo-700">{p.name}</div>
                                    ))}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-300 font-black">
                                    VS
                                </td>
                                <td className="px-6 py-4 text-left">
                                    {match.team2.map(p => (
                                        <div key={p.id} className="font-bold text-pink-700">{p.name}</div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryView;
