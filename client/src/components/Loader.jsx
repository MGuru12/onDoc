import React from 'react';
import { useLoading } from '../utils/LoadingProvider';

const Loader = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/30 backdrop-blur-md transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        {/* Pulsing Ripple 1 */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-violet-400/50 animate-ping opacity-20" />
        
        {/* Pulsing Ripple 2 */}
        <div className="absolute w-16 h-16 rounded-full border-2 border-violet-500/40 animate-pulse opacity-30" />

        {/* The Animated Polygon Shape - matches CustomCursor */}
        <div 
          className="w-12 h-12 bg-[radial-gradient(circle_at_30%_30%,#ffffff,#e0d9ff)] border-[2px] border-violet-400/30 flex items-center justify-center animate-spin-slow shadow-[0_0_15px_rgba(152,98,255,0.4)]"
          style={{
            clipPath: "polygon(20% 0%, 100% 40%, 100% 60%, 20% 100%, 0% 80%, 0% 20%)",
          }}
        >
          {/* Inner Core */}
          <div 
            className="w-4 h-4 bg-violet-500 rounded-full animate-bounce"
            style={{
                boxShadow: "0 0 10px #9862ff"
            }}
          />
        </div>

        {/* Loading Text */}
        <div className="absolute top-20 text-violet-800 font-bold tracking-widest text-sm uppercase animate-pulse">
            Loading...
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
