import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-2 h-4" style={style}></div>
);

const Confetti: React.FC = () => {
    const pieces = Array.from({ length: 70 }).map((_, i) => {
        const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            animation: `fall ${2 + Math.random() * 4}s linear ${Math.random() * 2}s infinite`,
            backgroundColor: ['#8b5cf6', '#7c3aed', '#facc15', '#ec4899', '#34d399'][i % 5],
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: Math.random() + 0.2,
        };
        return <ConfettiPiece key={i} style={style} />;
    });

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
            <style>
                {`
                @keyframes fall {
                    0% { transform: translateY(-20vh) rotateZ(0deg); opacity: 1; }
                    100% { transform: translateY(120vh) rotateZ(720deg); opacity: 0; }
                }
                `}
            </style>
            {pieces}
        </div>
    );
};

export default Confetti;