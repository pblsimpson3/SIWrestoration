import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { RefreshCw, Compass } from 'lucide-react';
import { Role, RoleId } from '../types';
import { ROLES } from '../data';

interface SpinWheelProps {
  onRoleSelected: (roleId: RoleId) => void;
  selectedRoleId: RoleId | null;
}

export default function SpinWheel({ onRoleSelected, selectedRoleId }: SpinWheelProps) {
  const [isSpinning, setIsSigning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const roleList = Object.values(ROLES);

  const spin = async () => {
    if (isSpinning) return;
    setIsSigning(true);

    // Pick a random role
    const randomIndex = Math.floor(Math.random() * roleList.length);
    const targetRole = roleList[randomIndex];

    // Calculate rotation: 
    // Quad 1: Archaeologist (Angle 0 to 90) -> center at 45
    // Quad 2: Historian (Angle 90 to 180) -> center at 135
    // Quad 3: Worker (Angle 180 to 270) -> center at 225
    // Quad 4: Descendant (Angle 270 to 360) -> center at 315
    // To make the wheel spin, let's spin it 5-8 full rotations (1800 - 2880 deg)
    // plus the landing angle.
    // Note: Since the pointer is at the TOP (90 deg relative to canvas, or 0 deg), 
    // to align the wheel quadrant to the pointer:
    // Landing angle = 360 - (quadrant_center_angle)
    const baseRotations = (5 + Math.floor(Math.random() * 4)) * 360; 
    let quadrantCenter = 0;
    if (targetRole.id === 'archaeologist') quadrantCenter = 45;
    else if (targetRole.id === 'historian') quadrantCenter = 135;
    else if (targetRole.id === 'worker') quadrantCenter = 225;
    else if (targetRole.id === 'descendant') quadrantCenter = 315;

    const landingAngle = 360 - quadrantCenter;
    const finalRotation = currentRotation + baseRotations + landingAngle;

    setCurrentRotation(finalRotation);

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 4,
        ease: [0.25, 1, 0.5, 1] // Custom deceleration cubic-bezier
      }
    });

    setIsSigning(false);
    onRoleSelected(targetRole.id);
  };

  return (
    <div id="role-spinner-container" className="flex flex-col items-center justify-center p-6 bg-[#FEFDFB] border border-natural-sand-dark rounded-xl shadow-md">
      <div className="text-center mb-6">
        <h3 className="text-lg font-serif font-bold text-natural-dark">1. Spin to Discover Your Persona</h3>
        <p className="text-xs text-stone-600 max-w-sm mt-1 font-serif">
          Spin the wheel of historical preservation to randomly assign your role in the 1950s Saugus Iron Works Restoration project.
        </p>
      </div>

      {/* Spin Wheel Visual Box */}
      <div className="relative w-72 h-72 mb-6 flex items-center justify-center">
        {/* Pointer at the TOP of the wheel */}
        <div id="wheel-pointer" className="absolute top-0 z-20 -mt-3 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-natural-accent drop-shadow-md"></div>
          <div className="w-2 h-4 bg-natural-accent-hover -mt-1 rounded-sm"></div>
        </div>

        {/* Circular Wheel container */}
        <motion.div
          id="role-selection-wheel"
          ref={wheelRef}
          animate={controls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: 'center' }}
          className="w-64 h-64 rounded-full border-4 border-natural-dark shadow-xl relative overflow-hidden flex items-center justify-center select-none bg-natural-darker"
        >
          {/* Quadrants background lines */}
          <div className="absolute inset-0 w-full h-full rotate-45">
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-natural-dark"></div>
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-natural-dark"></div>
          </div>

          {/* Quadrant text and mini icons */}
          {roleList.map((role) => {
            let rotationClass = "";
            let colorClass = "";
            let textRotation = "";
            
            if (role.id === 'archaeologist') {
              rotationClass = "rotate-0"; // top-right
              colorClass = "bg-[#EEDC82]/90 text-stone-900"; // Flaxen soil
              textRotation = "rotate-[22.5deg]";
            } else if (role.id === 'historian') {
              rotationClass = "rotate-90"; // bottom-right
              colorClass = "bg-[#D2B48C]/90 text-stone-900"; // Tan document
              textRotation = "rotate-[-22.5deg]";
            } else if (role.id === 'worker') {
              rotationClass = "rotate-180"; // bottom-left
              colorClass = "bg-[#C0C0C0]/90 text-stone-900"; // Pewter/Steel iron
              textRotation = "rotate-[22.5deg]";
            } else if (role.id === 'descendant') {
              rotationClass = "rotate-270"; // top-left
              colorClass = "bg-[#A3B899]/90 text-stone-900"; // Sage heritage
              textRotation = "rotate-[-22.5deg]";
            }

            return (
              <div
                key={role.id}
                className={`absolute w-32 h-32 origin-bottom-right bottom-1/2 right-1/2 overflow-hidden border border-natural-dark/20 ${rotationClass}`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
              >
                <div className={`w-full h-full ${colorClass} flex flex-col items-center justify-center p-4 pt-8 rotate-[45deg] origin-center`}>
                  <span className="font-serif font-bold text-[10px] tracking-tight text-center uppercase block max-w-[50px] leading-tight">
                    {role.shortTitle}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Inner circle button space */}
          <div className="absolute w-12 h-12 bg-natural-dark border-2 border-natural-sand rounded-full flex items-center justify-center shadow-inner z-10">
            <Compass className="w-5 h-5 text-[#F5F2ED]" />
          </div>
        </motion.div>
      </div>

      <button
        id="btn-spin-wheel"
        onClick={spin}
        disabled={isSpinning}
        className={`px-5 py-2.5 rounded-lg font-serif font-bold text-sm tracking-wide shadow-md transition-all duration-300 flex items-center gap-2 ${
          isSpinning
            ? 'bg-natural-sand text-stone-500 cursor-not-allowed'
            : 'bg-natural-accent hover:bg-natural-accent-hover text-white active:scale-[0.98]'
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
        {selectedRoleId ? 'Spin for another role' : 'Spin to Assign Saugus Role'}
      </button>

      {selectedRoleId && (
        <div id="selection-status" className="mt-4 text-xs font-semibold text-[#5A5A40] bg-natural-sand px-3 py-1 bg-[#E6E0D4]/40 rounded border border-natural-sand-dark font-serif">
          Current Assignment: <span className="font-bold text-natural-dark font-serif underline decoration-natural-accent decoration-2">{ROLES[selectedRoleId].name}</span>
        </div>
      )}
    </div>
  );
}
