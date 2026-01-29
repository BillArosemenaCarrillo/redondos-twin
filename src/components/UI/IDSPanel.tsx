"use client";
import React from 'react';

interface CheckResult {
    id: string;
    name: string;
    status: 'pass' | 'fail';
    percentage: number;
    count: number;
}

export const IDSPanel = () => {
    // Mock data based on the reference image
    const results: CheckResult[] = [
        { id: '1', name: 'Exterior walls', status: 'fail', percentage: 63, count: 104 },
        { id: '2', name: 'Fire rating properties', status: 'pass', percentage: 100, count: 42 },
        { id: '3', name: 'Classification (Uniclass)', status: 'pass', percentage: 98, count: 215 },
        { id: '4', name: 'Load bearing elements', status: 'fail', percentage: 12, count: 8 },
    ];

    const totalPass = results.filter(r => r.status === 'pass').length;
    const totalFail = results.filter(r => r.status === 'fail').length;

    return (
        <div className="h-full flex flex-col animate-in fade-in">
            {/* Header / Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex gap-4">
                <div className="flex-1 text-center">
                    <div className="text-2xl font-black text-green-500">{totalPass}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Checks Passed</div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="flex-1 text-center">
                    <div className="text-2xl font-black text-red-500">{totalFail}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Checks Failed</div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {results.map(res => (
                    <div key={res.id} className="p-3 bg-white border border-gray-100 rounded-lg hover:border-black transition-colors group cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${res.status === 'pass' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-bold text-sm text-gray-800">{res.name}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{res.count} items</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${res.status === 'pass' ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${res.status === 'fail' ? 100 - res.percentage : res.percentage}%` }} // Simplified visual logic
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
                            <span>{res.status === 'pass' ? 'Passing' : 'Failing'}</span>
                            <span>{res.status === 'fail' ? `${res.percentage}% Failed` : '100%'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Action */}
            <button className="mt-4 w-full py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                Run Validation Audit
            </button>
        </div>
    );
};
