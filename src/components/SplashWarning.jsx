import React, { useEffect, useState } from 'react';

const SplashWarning = ({ onDismiss }) => {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in cursor-default">
            <div className="max-w-2xl w-full p-8 text-center text-white border-4 border-red-600 bg-black/90 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                <div className="mb-6">
                    <h1 className="text-5xl font-extrabold tracking-widest text-red-600 mb-2 uppercase drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">WARNING</h1>
                    <div className="h-1 w-full bg-red-600 shadow-[0_0_15px_bg-red-600]"></div>
                </div>

                <div className="space-y-4 font-mono">
                    <p className="text-xl font-bold text-red-100">
                        UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        이 프로그램은 동현이에 의해 제작되었으며, 저작권법 및 국제 조약에 의해 보호됩니다.
                        무단 복제, 배포 또는 해킹 시도는 관계 법령에 따라 민형사상 엄중한 처벌을 받을 수 있습니다.
                    </p>

                    <div className="py-6">
                        <div className="text-7xl">👮‍♂️🚫🚧</div>
                    </div>

                    <p className="text-xs text-red-400 mt-8 font-bold tracking-widest">
                        FEDERAL LAW PROVIDES SEVERE CIVIL AND CRIMINAL PENALTIES FOR THE UNAUTHORIZED REPRODUCTION, DISTRIBUTION, OR EXHIBITION OF COPYRIGHTED MATERIALS.
                    </p>
                </div>

                <div className="mt-8 text-sm text-gray-500 min-h-[60px] flex items-center justify-center">
                    {countdown > 0 ? (
                        <div className="animate-pulse">
                            SYSTEM LOADING... {countdown}
                        </div>
                    ) : (
                        <button
                            onClick={onDismiss}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] animate-bounce-slight"
                        >
                            이해하셨습니까? 동의하고 실행하겠습니다.
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SplashWarning;
