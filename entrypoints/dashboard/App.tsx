import React, { useState, useEffect, useCallback } from 'react';
import { ExerciseGrid } from '@/components/exercises/ExerciseGrid';
import { ExerciseBall } from '@/components/exercises/ExerciseBall';
import { TimerBar } from '@/components/exercises/TimerBar';
import { PauseOverlay } from '@/components/exercises/PauseOverlay';
import { EXERCISES, Exercise } from '@/utils/exercises';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, LayoutGrid, PanelRight } from 'lucide-react';
import beep1 from '@/assets/audio/beep-001.wav';

type AppState = 'dashboard' | 'exercise' | 'pause' | 'complete';

const App = () => {
  const [state, setState] = useState<AppState>('dashboard');
  const [selectedSequence, setSelectedSequence] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Audio feedback
  useEffect(() => {
    if (state === 'exercise') {
      const isSoundEnabled = localStorage.getItem('local:sounds_enabled') !== 'false';
      if (isSoundEnabled) {
        new Audio(beep1).play().catch(console.warn);
      }
    }
  }, [state]);

  // Settings state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exerciseDuration, setExerciseDuration] = useState(30);
  const [restDuration, setRestDuration] = useState(10);
  const [useFullscreenSetting, setUseFullscreenSetting] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      const savedIds = localStorage.getItem('local:selected_exercises');
      const savedDuration = localStorage.getItem('local:exercise_duration');
      const savedRest = localStorage.getItem('local:rest_duration');
      const savedFs = localStorage.getItem('local:use_fullscreen');

      if (savedIds) setSelectedIds(JSON.parse(savedIds));
      else setSelectedIds(EXERCISES.slice(0, 3).map(e => e.id));

      if (savedDuration) setExerciseDuration(Number(savedDuration));
      if (savedRest) setRestDuration(Number(savedRest));
      if (savedFs !== null) setUseFullscreenSetting(savedFs === 'true');

      setIsLoaded(true);
    };
    loadSettings();
  }, []);

  // Save settings on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('local:selected_exercises', JSON.stringify(selectedIds));
    }
  }, [selectedIds, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('local:exercise_duration', exerciseDuration.toString());
    }
  }, [exerciseDuration, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('local:rest_duration', restDuration.toString());
    }
  }, [restDuration, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('local:use_fullscreen', useFullscreenSetting.toString());
    }
  }, [useFullscreenSetting, isLoaded]);

  const startRoutine = (ids: string[], useFs: boolean) => {
    // Override exercise durations with custom setting
    const sequence = EXERCISES
      .filter(e => ids.includes(e.id))
      .map(e => ({ ...e, duration: exerciseDuration }));

    setSelectedSequence(sequence);
    setCurrentIndex(0);
    setIsFullscreen(useFs);

    if (useFs) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }

    setState('exercise');
  };

  const handleExerciseComplete = useCallback(() => {
    if (currentIndex < selectedSequence.length - 1) {
      setState('pause');
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setState('exercise');
      }, restDuration * 1000);
    } else {
      setState('complete');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setTimeout(() => setState('dashboard'), 3000);
    }
  }, [currentIndex, selectedSequence, restDuration]);

  const exitRoutine = () => {
    setState('dashboard');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const openSidepanel = () => {
    if (browser.sidePanel && browser.sidePanel.open) {
      browser.windows.getCurrent().then(window => {
        if (window.id) {
          browser.sidePanel.open({ windowId: window.id });
        }
      });
    } else {
      console.warn('Side Panel API not available');
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>;
  }

  if (state === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        <div className="absolute top-8 right-8 z-50">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl shadow-sm bg-white hover:bg-slate-50 flex items-center gap-2 group"
            onClick={openSidepanel}
          >
            <PanelRight size={18} className="text-slate-500 group-hover:text-primary-600 transition-colors" />
            <span className="text-slate-700">Open Settings</span>
          </Button>
        </div>
        <ExerciseGrid
          onStart={startRoutine}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          exerciseDuration={exerciseDuration}
          onExerciseDurationChange={setExerciseDuration}
          restDuration={restDuration}
          onRestDurationChange={setRestDuration}
          useFullscreen={useFullscreenSetting}
          onUseFullscreenChange={setUseFullscreenSetting}
        />
      </div>
    );
  }

  const currentExercise = selectedSequence[currentIndex];

  return (
    <div className={`fixed inset-0 z-[100] ${state === 'pause' ? 'bg-slate-900/40' : 'bg-white'} flex flex-col items-center justify-center`}>
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-[110]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={exitRoutine}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900">{currentExercise.name}</h2>
          </div>
          <p className="text-sm text-slate-500 ml-10">Exercise {currentIndex + 1} of {selectedSequence.length}</p>
        </div>

        {state === 'exercise' && (
          <TimerBar
            duration={currentExercise.duration}
            isRunning={state === 'exercise'}
            onComplete={handleExerciseComplete}
          />
        )}
      </header>

      <main className="relative w-full h-full flex items-center justify-center p-12">
        {state === 'exercise' && (
          <div className="w-full h-full max-w-5xl max-h-[70vh]">
            <ExerciseBall
              trajectory={currentExercise.trajectory}
              duration={currentExercise.duration}
            />
          </div>
        )}

        {state === 'pause' && <PauseOverlay />}

        {state === 'complete' && (
          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid size={40} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900">Great Job!</h1>
            <p className="text-xl text-slate-500">Your routine is complete. Returning to dashboard...</p>
          </div>
        )}
      </main>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow-xl flex items-center gap-4 z-[110]">
        <div className="flex gap-1">
          {selectedSequence.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-primary-500' :
                  i < currentIndex ? 'bg-green-400' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

