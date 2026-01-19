import React, { useState, useEffect } from 'react';

const PlayerForm = ({ onAddPlayer, defaultStartTime }) => {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('M');
    const [stats, setStats] = useState({
        forehand: 3,
        backhand: 3,
        volley: 3,
        serve: 3,
        speed: 3
    });
    const [type, setType] = useState('MEMBER'); // MEMBER or GUEST
    const [maxGames, setMaxGames] = useState(4); // Default quota
    const [arrivalTime, setArrivalTime] = useState(defaultStartTime || '20:00');

    // Update arrivalTime if default changes (e.g. initial load)
    useEffect(() => {
        if (defaultStartTime) setArrivalTime(defaultStartTime);
    }, [defaultStartTime]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        onAddPlayer({
            id: Date.now().toString(),
            name,
            gender,
            stats,
            type,
            maxGames,
            arrivalTime, // Store time string e.g. "20:30"
        });

        // Reset
        setName('');
        // Keep gender/stats as previous or reset? Resetting usually better for varied input.
        setStats({ forehand: 3, backhand: 3, volley: 3, serve: 3, speed: 3 });
        setType('MEMBER');
        setMaxGames(4);
        setArrivalTime(defaultStartTime || '20:00');
    };

    const StatInput = ({ label, value, onChange }) => (
        <div className="flex flex-col items-center">
            <label className="text-xs font-semibold text-slate-500 mb-1">{label}</label>
            <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-bold text-blue-600 mt-1">{value}</span>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">참가자 등록</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="예: 홍길동"
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">성별</label>
                        <div className="flex rounded-md shadow-sm" role="group">
                            <button
                                type="button"
                                onClick={() => setGender('M')}
                                className={`flex-1 px-3 py-2 text-sm font-medium border rounded-l-lg ${gender === 'M'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                남
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('F')}
                                className={`flex-1 px-3 py-2 text-sm font-medium border rounded-r-lg ${gender === 'F'
                                    ? 'bg-pink-500 text-white border-pink-500'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                여
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Radar Inputs */}
                <div className="p-4 bg-slate-50 rounded-lg">
                    <label className="block text-sm font-medium text-slate-700 mb-3 text-center">능력치 (1~5점, 0.5단위)</label>
                    <div className="grid grid-cols-5 gap-2">
                        <StatInput
                            label="포핸드"
                            value={stats.forehand}
                            onChange={(val) => setStats({ ...stats, forehand: val })}
                        />
                        <StatInput
                            label="백핸드"
                            value={stats.backhand}
                            onChange={(val) => setStats({ ...stats, backhand: val })}
                        />
                        <StatInput
                            label="발리"
                            value={stats.volley}
                            onChange={(val) => setStats({ ...stats, volley: val })}
                        />
                        <StatInput
                            label="서브"
                            value={stats.serve}
                            onChange={(val) => setStats({ ...stats, serve: val })}
                        />
                        <StatInput
                            label="스피드"
                            value={stats.speed}
                            onChange={(val) => setStats({ ...stats, speed: val })}
                        />
                    </div>
                    <div className="text-center mt-2 text-xs text-slate-500">
                        종합 점수: <span className="font-bold text-slate-800">{stats.forehand + stats.backhand + stats.volley + stats.serve + stats.speed}</span> / 25
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">구분</label>
                        <div className="flex rounded-md shadow-sm" role="group">
                            <button
                                type="button"
                                onClick={() => setType('MEMBER')}
                                className={`flex-1 px-3 py-2 text-xs font-bold border rounded-l-lg ${type === 'MEMBER'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                            >
                                회원
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('GUEST')}
                                className={`flex-1 px-3 py-2 text-xs font-bold border rounded-r-lg ${type === 'GUEST'
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                            >
                                게스트
                            </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            최대 경기 수 (Quota)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={maxGames}
                            onChange={(e) => setMaxGames(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">참가 시간 (Arrival)</label>
                    <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">* 기본값은 전체 시작 시간입니다. 늦참 시 수정하세요.</p>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                    등록하기
                </button>
            </form>
        </div>
    );
};

export default PlayerForm;
