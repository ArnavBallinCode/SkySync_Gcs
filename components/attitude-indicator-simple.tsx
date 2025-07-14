"use client"

import React from 'react';

interface AttitudeIndicatorProps {
    roll?: number;
    pitch?: number;
    yaw?: number;
}

const AttitudeIndicator: React.FC<AttitudeIndicatorProps> = ({
    roll = 0,
    pitch = 0,
    yaw = 0
}) => {
    return (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col items-center">
                <h3 className="text-white font-semibold mb-2">Attitude Indicator</h3>
                <div className="text-green-400 font-mono">
                    Roll: {roll.toFixed(1)}° | Pitch: {pitch.toFixed(1)}° | Yaw: {yaw.toFixed(1)}°
                </div>
            </div>
        </div>
    );
};

export default AttitudeIndicator;
