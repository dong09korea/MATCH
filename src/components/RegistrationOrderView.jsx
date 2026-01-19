import React, { useState, useRef } from 'react';

const RegistrationOrderView = ({ players, onReorder, config }) => {
    // Local state for drag and drop to avoid flickering global updates
    // but here we might just trigger global update directly or use local state
    // Let's use local state for smooth UI then commit on drop? 
    // Actually, direct updates are fine for this number of items.

    const dragItem = useRef();
    const dragOverItem = useRef();

    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const getAvailabilityText = (player) => {
        if (!player.arrivalTime || !config) return null;

        const startMin = timeToMinutes(config.startTime);
        const arrivalMin = timeToMinutes(player.arrivalTime);

        // If arrival is earlier or equal to start time, don't show anything (Default)
        if (arrivalMin <= startMin) return null;

        const duration = config.matchDuration || 30;
        const diff = arrivalMin - startMin;
        // 0-30m late = Round 2 (Index 1)
        // 30-60m late = Round 3 (Index 2)
        // We use Math.ceil because if you arrive 1 min late, you miss the start of Round 1
        const roundIndex = Math.ceil(diff / duration);
        const roundNumber = roundIndex + 1;

        return (
            <span className="ml-2 text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-100">
                {roundNumber}번째 게임부터 참석 ({player.arrivalTime} ~)
            </span>
        );
    };

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = "move";
        // Ghost image styling if needed
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;

        // Optional: Reorder on hover for "live" feel, but "onDrop" is safer for performance/UX usually
        // Let's do live reorder for better visual feedback
        const newList = [...players];
        const dragItemContent = newList[dragItem.current];
        newList.splice(dragItem.current, 1);
        newList.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = position; // Update drag index to new position
        onReorder(newList);
    };

    const handleDragEnd = (e) => {
        dragItem.current = null;
        dragOverItem.current = null;
    };

    if (!players || players.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">등록된 참가자가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">🔢 참가 신청 순서 관리</h2>
                <p className="text-slate-600">
                    참가자 카드를 <span className="text-indigo-600 font-bold">드래그 앤 드롭</span>하여 순서를 변경하세요.<br />
                    <span className="text-sm text-slate-500">※ 위쪽(낮은 번호)에 있을수록 남는 경기 배정 시 우선권(First Come First Served)을 가집니다.</span>
                </p>
            </div>

            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                <ul className="divide-y divide-slate-100">
                    {players.map((player, index) => (
                        <li
                            key={player.id}
                            className="p-4 flex items-center gap-4 hover:bg-indigo-50 transition-colors cursor-move active:bg-indigo-100 group"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Necessary to allow dropping
                        >
                            {/* Rank Badge */}
                            <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-black text-xl shadow-sm border shrink-0
                                ${index < 4 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}
                            `}>
                                {index + 1}
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ${player.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                    {player.gender === 'M' ? '남' : '여'}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                        {player.name}
                                        {player.type === 'GUEST' && <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">GUEST</span>}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        Max: {player.maxGames !== undefined ? player.maxGames : 4} 게임
                                        {getAvailabilityText(player)}
                                    </div>
                                </div>
                            </div>

                            {/* Handle Icon */}
                            <div className="text-slate-300 group-hover:text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RegistrationOrderView;
