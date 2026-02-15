import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { toggleFont } from './redux/profileSlice';     
import ProfileSettings from './components/ProfileSettings'; 

import { 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  Circle,
  RefreshCw,
  Zap,
  LayoutGrid,
  Type,
  Settings,
  Clock,     // NEW ICON
  Trophy     // NEW ICON
} from 'lucide-react';

import logoImg from './assets/logo.jpg';
import introVideo from './assets/intro.mp4';

const App = () => {
  // --- REDUX STATE ---
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const isDyslexic = profile.preferences.fontType === 'dyslexic';

  // --- LOCAL STATE ---
  const [showProfile, setShowProfile] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  
  // Single-Task Mode States
  const [roadmap, setRoadmap] = useState(""); 
  const [totalTime, setTotalTime] = useState(""); // NEW STATE
  const [steps, setSteps] = useState(null); 
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [streak, setStreak] = useState(0);

  // --- HANDLERS ---
  const startRecording = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorder.start();
      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", audioBlob, "speech.wav");

        try {
          const res = await fetch("http://localhost:8000/speech-to-text", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          setTaskInput(data.transcript || "");
        } catch (err) {
          console.error("Voice backend error:", err);
        }
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      setTimeout(() => mediaRecorder.stop(), 5000);
    } catch (err) {
      alert("Microphone permission needed");
      setIsRecording(false);
    }
  };

  const handleDecompose = async () => {
    if (!taskInput.trim()) return;
    
    // 1. INSTANT START (Buffer Step)
    const bufferStep = {
      time: "30s",
      action: "Take a deep breath, We will get it done together",
      tip: "Dopamine priming helps you start!"
    };

    setIsProcessing(true);
    
    // Show buffer step quickly
    const bufferTimer = setTimeout(() => {
        setSteps([bufferStep]); 
        setRoadmap("Designing your winning plan...");
        setTotalTime("~2 mins"); // Temporary filler
        setCurrentStepIndex(0); // Jump straight to action
    }, 3000);

    try {
      const res = await fetch("http://localhost:5001/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskInput,
          userPreferences: profile.preferences,
          userTriggers: profile.triggers
        }),
      });

      const data = await res.json();
      
      if (data && data.steps) {
        setSteps(prev => {
            if (prev && prev.length > 0) return [bufferStep, ...data.steps];
            return data.steps;
        });

        setRoadmap(data.roadmap || "You got this!");
        setTotalTime(data.total_time || "~15 mins"); // Set real total time
        
        // Ensure we stay on the current view
        setCurrentStepIndex(prev => prev === -1 ? -1 : prev); 
      } 
    } catch (err) {
      console.error(err);
      alert("Backend connection failed.");
    } finally {
      clearTimeout(bufferTimer); 
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setSteps(null);
    setTaskInput('');
    setRoadmap("");
    setTotalTime("");
    setCurrentStepIndex(-1);
  };

  const nextStep = () => {
    if (steps && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setStreak(s => s + 1);
      alert("🎉 Task Complete! Dopamine hit received!");
      resetApp();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > -1) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // --- RENDER ---
  return (
    <div className={`min-h-screen bg-[#FFFDF5] text-slate-900 transition-all duration-500 ${isDyslexic ? 'font-dyslexic' : 'font-sans'}`}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-40 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-[#FFFDF5]/80 border-b border-yellow-100/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
          <img src={logoImg} alt="Marg Logo" className="w-20 h-20 object-contain mix-blend-multiply" />
          <span className="font-bold text-xl tracking-tight text-slate-800">मार्ग</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-yellow-100 shadow-sm">
            <span className="text-orange-500 font-bold text-sm">🔥 {streak}</span>
          </div>
          <button onClick={() => setShowProfile(true)} className="p-2 hover:bg-yellow-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <ProfileSettings onClose={() => setShowProfile(false)} />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto pt-32 px-6 flex flex-col items-center relative min-h-[80vh]">
        
        {/* INPUT MODE */}
        {!steps && (
          <div className="flex flex-col items-center w-full animate-fade-in-up">
            <div className="relative mb-8 group flex justify-center h-40 items-center">
              {(isProcessing || !introPlayed) ? (
                <video autoPlay muted playsInline loop={isProcessing} onEnded={() => !isProcessing && setIntroPlayed(true)} className="w-40 h-40 object-cover mix-blend-multiply">
                  <source src={introVideo} type="video/mp4" />
                </video>
              ) : (
                <img src={logoImg} alt="Marg Logo" className="relative w-32 h-32 object-contain mix-blend-multiply animate-fade-in-up" />
              )}
            </div>

            <div className="text-center space-y-4 mb-10 max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-slate-800">
                {isProcessing ? <span className="text-slate-400 animate-pulse">Thinking...</span> : 
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-600">
                   {profile.name ? `Namaste, ${profile.name}!` : 'Kaise ho aap?'}
                 </span>
                }
              </h1>
            </div>

            {!isProcessing && (
              <div className="w-full max-w-2xl relative group z-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-200 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-xl shadow-yellow-100/50 border border-yellow-100 p-2 flex flex-col md:flex-row items-center gap-2">
                  <textarea
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="e.g. Clean my messy room..."
                    className="w-full bg-transparent border-none focus:ring-0 text-lg p-4 text-slate-700 placeholder:text-slate-400 resize-none h-[60px]"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDecompose(); }}}
                  />
                  <div className="flex items-center gap-2 pr-2">
                   <button onClick={startRecording} disabled={isRecording} className={`p-3 rounded-full ${isRecording ? "bg-yellow-200 animate-pulse" : "hover:bg-slate-50"}`}>
                    <Mic size={20} />
                  </button>
                    <button onClick={handleDecompose} disabled={!taskInput} className={`p-3 rounded-2xl ${taskInput ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'}`}>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOCUS MODE (SINGLE CARD VIEW) */}
        {steps && (
          <div className="w-full max-w-xl animate-fade-in-up flex flex-col items-center">
            
            <div className="w-full h-3 bg-yellow-100/50 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-700 ease-out"
                style={{ width: `${((currentStepIndex + 2) / ((steps?.length || 1) + 1)) * 100}%` }}
              />
            </div>

            <div className="w-full bg-white rounded-[2rem] shadow-xl border border-yellow-100 p-8 min-h-[400px] flex flex-col justify-between relative">
              <div className="flex justify-between items-start">
                {currentStepIndex > -1 ? (
                   <button onClick={prevStep} className="text-slate-400 hover:text-slate-800 font-medium text-sm flex items-center gap-1">← Back</button>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Overview</span>
                )}
                
                {/* TIMER BADGE */}
                {currentStepIndex >= 0 && steps[currentStepIndex] && (
                   <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">⏱️ {steps[currentStepIndex]?.time || "2 mins"}</span>
                )}
              </div>

              <div className="text-center my-6">
                
                {/* --- UPDATED ROADMAP VIEW (Redesigned for Motivation) --- */}
                {currentStepIndex === -1 && (
                  <div className="animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-6">"{roadmap}"</h2>
                    
                    {/* NEW: VICTORY STATS CARD (Instead of a list) */}
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex flex-col items-center w-32">
                             <Clock size={24} className="text-green-600 mb-2" />
                             <span className="text-green-800 font-bold text-lg">{totalTime}</span>
                             <span className="text-green-600 text-xs uppercase font-bold">Total Time</span>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex flex-col items-center w-32">
                             <Trophy size={24} className="text-purple-600 mb-2" />
                             <span className="text-purple-800 font-bold text-lg">{steps?.length}</span>
                             <span className="text-purple-600 text-xs uppercase font-bold">Micro-Wins</span>
                        </div>
                    </div>
                  </div>
                )}

                {/* ACTIVE STEP VIEW */}
                {currentStepIndex >= 0 && steps[currentStepIndex] && (
                  <div className="animate-fade-in-up">
                    <span className="text-slate-300 font-bold text-6xl opacity-20 mb-4 block">{currentStepIndex + 1}</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">{steps[currentStepIndex]?.action || "Action"}</h2>
                    <div className="bg-yellow-50/80 p-4 rounded-2xl border border-yellow-100 inline-block">
                      <p className="text-yellow-700 text-sm font-medium">💡 <span className="italic">{steps[currentStepIndex]?.tip || "You got this!"}</span></p>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={nextStep} className="w-full bg-slate-900 hover:bg-black text-white text-lg font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group">
                {currentStepIndex === -1 ? <>Let's Go <ArrowRight size={20} /></> : 
                 currentStepIndex === ((steps?.length || 0) - 1) ? <>Finish Task 🎉</> : <>Done! Next <ArrowRight size={20} /></>}
              </button>
            </div>
            
            <div className="text-center mt-8">
               <button onClick={resetApp} className="text-slate-400 hover:text-red-500 text-sm font-medium">Cancel & Start Over</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;