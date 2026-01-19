import React, { useEffect } from 'react';

const SettingsForm = ({ config, onConfigChange, roundConstraints, onRoundConstraintsChange }) => {

    // Calculate slots whenever time changes or court count changes
    useEffect(() => {
        const generateSlots = () => {
            const slots = [];
            let current = new Date(`2000-01-01T${config.startTime}`);
            const endTime = new Date(`2000-01-01T${config.endTime}`);
            let idx = 0;

            while (current < endTime) {
                const next = new Date(current.getTime() + config.matchDuration * 60000);
                if (next > endTime) break;

                // For each time slot, create slots for each court
                for (let c = 0; c < config.courtCount; c++) {
                    slots.push({
                        roundIndex: idx,
                        courtIndex: c,
                        time: current.toTimeString().slice(0, 5),
                        label: `${idx + 1}경기 - ${String.fromCharCode(65 + c)}코트` // 1경기 - A코트
                    });
                }
                current = next;
                idx++;
            }
            return slots;
        };

        const slots = generateSlots();

        // Sync constraints: existing ones preserve type, new ones default to ANY
        // Identify slots by unique key: `r${roundIndex}_c${courtIndex}`
        const getConstraint = (r, c) => roundConstraints.find(rc => rc.roundIndex === r && rc.courtIndex === c);

        const newConstraints = slots.map(slot => {
            const existing = getConstraint(slot.roundIndex, slot.courtIndex);
            return {
                roundIndex: slot.roundIndex,
                courtIndex: slot.courtIndex,
                label: slot.label,
                time: slot.time,
                type: existing ? existing.type : 'ANY'
            };
        });

        // Only update if different length or structure (to avoid loops, though strict equality check is hard here)
        // Simple check: stringify comparison? Or just trust the user interaction flow.
        // We need to avoid infinite loop inside useEffect if we call onRoundConstraintsChange.
        // But here we rely on 'config' changes.
        // Let's only call if length differs or if we are Initializing.
        // A better pattern is to compute this only when config changes and JUST return it, 
        // but since state is lifted, we must update parent.
        // We will do a JSON stringify check to prevent loop.
        if (JSON.stringify(newConstraints) !== JSON.stringify(roundConstraints)) {
            onRoundConstraintsChange(newConstraints);
        }

    }, [config.startTime, config.endTime, config.matchDuration, config.courtCount]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">경기 설정</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">코트 개수</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={config.courtCount}
                        onChange={(e) => onConfigChange({ ...config, courtCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">시작 시간</label>
                        <input
                            type="time"
                            value={config.startTime}
                            onChange={(e) => onConfigChange({ ...config, startTime: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">종료 시간</label>
                        <input
                            type="time"
                            value={config.endTime}
                            onChange={(e) => onConfigChange({ ...config, endTime: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">게임 시간 ({config.matchDuration}분) - 수정불가</label>
                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-500 cursor-not-allowed">
                        30분
                    </div>
                </div>

                {/* Round Constraints */}
                <div className="pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-3 text-sm">경기별 특별 규칙 (코트별 설정)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: config.courtCount }).map((_, courtIdx) => {
                            const courtLabel = `${String.fromCharCode(65 + courtIdx)}코트`;
                            const courtConstraints = roundConstraints.filter(c => c.courtIndex === courtIdx);

                            return (
                                <div key={courtIdx} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-200 px-3 py-2 border-b border-slate-300 font-bold text-slate-700 text-center sticky top-0 z-10 text-sm">
                                        {courtLabel}
                                    </div>
                                    <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                                        {courtConstraints.map((constraint, idx) => (
                                            <div key={idx} className="bg-white p-2 rounded shadow-sm border border-slate-100 flex flex-col gap-1">
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-1 mb-1">
                                                    <span className="text-xs font-bold text-slate-800">{constraint.roundIndex + 1}경기</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{constraint.time}</span>
                                                </div>
                                                <div className="flex justify-between gap-1">
                                                    {['ANY', 'MALE_ONLY', 'FEMALE_ONLY'].map(type => (
                                                        <label key={type} className={`flex-1 flex items-center justify-center py-1 px-1 rounded cursor-pointer border text-[10px] font-bold transition-colors ${constraint.type === type
                                                            ? (type === 'MALE_ONLY' ? 'bg-blue-100 border-blue-300 text-blue-700' :
                                                                type === 'FEMALE_ONLY' ? 'bg-pink-100 border-pink-300 text-pink-700' :
                                                                    'bg-indigo-100 border-indigo-300 text-indigo-700')
                                                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                                            }`}>
                                                            <input
                                                                type="radio"
                                                                name={`round_${constraint.roundIndex}_court_${constraint.courtIndex}`}
                                                                checked={constraint.type === type}
                                                                onChange={() => {
                                                                    const newC = roundConstraints.map(rc =>
                                                                        (rc.roundIndex === constraint.roundIndex && rc.courtIndex === constraint.courtIndex)
                                                                            ? { ...rc, type }
                                                                            : rc
                                                                    );
                                                                    onRoundConstraintsChange(newC);
                                                                }}
                                                                className="sr-only"
                                                            />
                                                            <span>{type === 'ANY' ? '전체' : type === 'MALE_ONLY' ? '남' : '여'}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {roundConstraints.length === 0 && (
                            <div className="text-xs text-slate-400 italic col-span-full text-center py-4">시간을 설정하면 경기 목록이 나옵니다.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsForm;
