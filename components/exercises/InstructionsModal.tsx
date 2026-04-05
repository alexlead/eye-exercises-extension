import React from 'react';
import { X } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12 space-y-10 font-sans text-slate-700">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">🖥️</span> Workspace Setup
            </h2>
            <ul className="space-y-4 text-base md:text-lg leading-relaxed">
              <li><strong className="text-slate-900 font-bold">Distance:</strong> Keep a distance of 50–70 cm from the screen (about an arm's length).</li>
              <li><strong className="text-slate-900 font-bold">Lighting:</strong> Avoid glare on the monitor. Room lighting should be comfortable, not too bright, but not in complete darkness either.</li>
              <li><strong className="text-slate-900 font-bold">Posture:</strong> Sit straight, relax your shoulders. Your head should remain still during all exercises — only your eye muscles should work.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">⏱️</span> Frequency and Process
            </h2>
            <ul className="space-y-4 text-base md:text-lg leading-relaxed">
              <li><strong className="text-slate-900 font-bold">Regularity:</strong> It is recommended to take a break every 2 hours of computer work.</li>
              <li><strong className="text-slate-900 font-bold">Duration:</strong> A full cycle of a few exercises takes 2–10 minutes.</li>
              <li><strong className="text-slate-900 font-bold">Technique:</strong> Follow the point smoothly, without sudden jerks. After each exercise, it is useful to blink quickly for a few seconds — this moisturizes the mucous membrane and relieves tension.</li>
            </ul>
          </div>

          <div className="bg-red-50 p-6 md:p-8 rounded-2xl border border-red-100">
            <h2 className="text-2xl font-extrabold text-red-900 mb-4 flex items-center gap-3">
              <span className="text-2xl">⚠️</span> Contraindications
            </h2>
            <p className="text-red-800 font-medium mb-4">Before starting, make sure you do not have any restrictions:</p>
            <ul className="list-disc pl-6 space-y-2 text-red-800/90 font-medium">
              <li>Inflammatory eye diseases (conjunctivitis, etc.).</li>
              <li>Recent eye surgeries (requires doctor's consultation).</li>
              <li>Retinal detachment.</li>
              <li>Severe discomfort or sharp pain during performance (in this case, stop the exercises immediately).</li>
            </ul>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
            >
              Understand & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
