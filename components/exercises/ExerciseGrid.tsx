import React, { useState } from 'react';
import { EXERCISES, Exercise } from '@/utils/exercises';
import { InstructionsModal } from './InstructionsModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Play, Fullscreen, LayoutGrid, CheckCircle2, Timer, Coffee } from 'lucide-react';

interface ExerciseGridProps {
  onStart: (selectedIds: string[], useFullscreen: boolean) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  exerciseDuration: number;
  onExerciseDurationChange: (val: number) => void;
  restDuration: number;
  onRestDurationChange: (val: number) => void;
  useFullscreen: boolean;
  onUseFullscreenChange: (val: boolean) => void;
}

export const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  onStart,
  selectedIds,
  onSelectedIdsChange,
  exerciseDuration,
  onExerciseDurationChange,
  restDuration,
  onRestDurationChange,
  useFullscreen,
  onUseFullscreenChange
}) => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const toggleSelect = (id: string) => {
    onSelectedIdsChange(
      selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]
    );
  };

  const handleStart = () => {
    if (selectedIds.length === 0) return;
    onStart(selectedIds, useFullscreen);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-12 px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8  border-b border-slate-200">
        <div className="space-y-3">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Eye <span className="gradient-text">Exercises</span>
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-xl text-slate-500 font-medium">Select your routine and boost focus.</p>
            <button
              onClick={() => setIsInstructionsOpen(true)}
              className="text-sm w-max text-primary-600 hover:text-primary-700 underline underline-offset-4 font-semibold transition-colors cursor-pointer"
            >
              How to work with this?
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap justify-end gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-10">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/50">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1"><Timer size={14} /> Exercise, s</label>
          <Input
            type="number"
            min={15} max={90}
            value={exerciseDuration}
            onChange={(e) => onExerciseDurationChange(Math.max(15, Math.min(90, Number(e.target.value))))}
            className="w-20 h-8 bg-white text-center p-1"
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/50">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1"><Coffee size={14} /> Rest, s</label>
          <Input
            type="number"
            min={0} max={30}
            value={restDuration}
            onChange={(e) => onRestDurationChange(Math.max(0, Math.min(30, Number(e.target.value))))}
            className="w-20 h-8 bg-white text-center p-1"
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/50">
          <Checkbox
            id="fullscreen"
            checked={useFullscreen}
            onCheckedChange={() => onUseFullscreenChange(!useFullscreen)}
          />
          <label htmlFor="fullscreen" className="text-sm font-semibold text-slate-600 flex items-center gap-2 cursor-pointer">
            <Fullscreen size={16} /> Fullscreen Mode
          </label>
        </div>

        <Button
          size="lg"
          className="rounded-xl px-8 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
          disabled={selectedIds.length === 0}
          onClick={handleStart}
        >
          <Play className="mr-2 fill-current" size={18} />
          Start Routine ({selectedIds.length})
        </Button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {EXERCISES.map((exercise) => (
          <div
            key={exercise.id}
            className={`group relative transition-all duration-300 ${selectedIds.includes(exercise.id) ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
          >
            <Card
              className={`h-full cursor-pointer transition-all duration-300 border-2 rounded-2xl overflow-hidden ${selectedIds.includes(exercise.id)
                ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-xl'
                : 'border-white hover:border-slate-200 shadow-sm'
                }`}
              onClick={() => toggleSelect(exercise.id)}
            >
              <div className={`absolute top-4 right-4 z-10 transition-transform duration-300 ${selectedIds.includes(exercise.id) ? 'scale-110' : 'scale-0'}`}>
                <CheckCircle2 className="text-primary-500 fill-white" size={28} />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    {exercise.id}
                  </span>
                  {exercise.name}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-sm leading-relaxed min-h-[4rem]">
                  {exercise.description}
                </CardDescription>
                <div className="mt-1 flex items-center justify-end">
                  <div className={`text-[10px] font-bold uppercase transition-opacity duration-300 ${selectedIds.includes(exercise.id) ? 'opacity-100 text-primary-600' : 'opacity-0'}`}>
                    Active
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </section>

      <footer className="pt-20 pb-10 text-center">
        <p className="text-slate-400 text-sm font-medium">© 2026 <a href="https://github.com/alexlead" target="_blank" className="text-primary-600 hover:text-primary-700 underline underline-offset-4 font-semibold transition-colors cursor-pointer">Aleksandr Razvodovskii</a>. If you like the app, you can <a href="https://ko-fi.com/aleksandrrazvodovskii" target="_blank" className="text-primary-600 hover:text-primary-700 underline underline-offset-4 font-semibold transition-colors cursor-pointer">support me</a> on Ko-fi.</p>
      </footer>

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </div>
  );
};
