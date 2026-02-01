import React, { useState } from 'react';
import { 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  Circle,
  RefreshCw,
  Zap,
  LayoutGrid,
  Type
} from 'lucide-react';

// --- IMPORTS ---
import logoImg from './assets/logo.jpg';
import introVideo from './assets/intro.mp4';

const App = () => {
  // --- STATE ---
  // We removed "showSplash". Now we track if the INTRO animation has finished.
  const [introPlayed, setIntroPlayed] = useState(false); 
  const [isRecording, setIsRecording] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [steps, setSteps] = useState(null);
  const [completedIndices, setCompletedIndices] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDyslexic, setIsDyslexic] = useState(false);
  const [streak, setStreak] = useState(12);

  const startRecording = async () => {
  try {
    setIsRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    let audioChunks = [];

    mediaRecorder.start();

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

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

        // 🎯 Inject voice text into existing input
        setTaskInput(data.transcript || "");
      } catch (err) {
        console.error("Voice backend error:", err);
        alert("Voice service not responding");
      }

      setIsRecording(false);
      stream.getTracks().forEach(track => track.stop());
    };

    // ⏱ Record for 5 seconds
    setTimeout(() => mediaRecorder.stop(), 5000);

  } catch (err) {
    console.error("Mic error:", err);
    alert("Microphone permission needed");
    setIsRecording(false);
  }
};

  // --- HANDLERS ---
  const handleDecompose = async () => {
    if (!taskInput.trim()) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch("http://localhost:5001/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskInput }),
      });

      const data = await res.json();
      if (data.steps) {
        setSteps(data.steps);
        setCompletedIndices([]);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Is the backend running?");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleStep = (index) => {
    if (completedIndices.includes(index)) {
      setCompletedIndices(prev => prev.filter(i => i !== index));
    } else {
      setCompletedIndices(prev => [...prev, index]);
      if (completedIndices.length + 1 === steps.length) {
         setStreak(s => s + 1);
      }
    }
  };

  const resetApp = () => {
    setSteps(null);
    setTaskInput('');
    setCompletedIndices([]);
    // Optional: Reset intro to play again on "New Task"? 
    // Uncomment below if you want the leaf to grow again on reset:
    // setIntroPlayed(false); 
  };

  const progress = steps ? Math.round((completedIndices.length / steps.length) * 100) : 0;

  // --- RENDER ---
  return (
    <div className={`min-h-screen bg-[#FFFDF5] text-slate-900 transition-all duration-500 ${isDyslexic ? 'font-dyslexic' : 'font-sans'}`}>
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-[#FFFDF5]/80 border-b border-yellow-100/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
          {/* Small Nav Logo */}
          <img 
            src={logoImg} 
            alt="Marg Logo" 
            className="w-20 h-20 object-contain mix-blend-multiply" 
          />
          <span className="font-bold text-xl tracking-tight text-slate-800">मार्ग</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-yellow-100 shadow-sm">
            <span className="text-orange-500 font-bold text-sm">🔥 {streak}</span>
          </div>
          
          <button 
            onClick={() => setIsDyslexic(!isDyslexic)}
            className="p-2 hover:bg-yellow-100 rounded-full transition-colors text-slate-500 hover:text-yellow-700"
            title="Toggle Dyslexic Font"
          >
            <Type size={20} />
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-4xl mx-auto pt-32 px-6 flex flex-col items-center relative min-h-[80vh]">
        
        {/* INPUT MODE */}
        {!steps && (
          <div className="flex flex-col items-center w-full animate-fade-in-up">
            
            {/* --- HERO ANIMATION AREA --- */}
            {/* Logic: Show Video if Processing OR Intro hasn't finished yet */}
            <div className="relative mb-8 group flex justify-center h-40 items-center">
              
              {(isProcessing || !introPlayed) ? (
                // 🎥 VIDEO MODE (Plays on Entry & Loading)
                <video 
                  autoPlay 
                  muted 
                  playsInline
                  // Loop ONLY if processing. If it's just the intro, play once.
                  loop={isProcessing} 
                  // When intro ends, switch to static logo
                  onEnded={() => !isProcessing && setIntroPlayed(true)} 
                  className="w-40 h-40 object-cover mix-blend-multiply"
                >
                  <source src={introVideo} type="video/mp4" />
                </video>
              ) : (
                // 🖼️ STATIC MODE (After intro is done)
                <div className="relative">
                  {/* Subtle Glow behind the static logo */}
                  <div className="absolute inset-0 bg-yellow-300 blur-3xl opacity-20 rounded-full scale-150 animate-pulse-slow"></div>
                  <img 
                    src={logoImg} 
                    alt="Marg Logo" 
                    className="relative w-32 h-32 object-contain mix-blend-multiply animate-fade-in-up" 
                  />
                </div>
              )}
            </div>

            {/* HEADLINE */}
            <div className="text-center space-y-4 mb-10 max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-slate-800">
                {isProcessing ? (
                  <span className="text-slate-400 animate-pulse">Thinking...</span>
                ) : (
                  <>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-600">
                      Pareshan kyon?
                    </span>Milkar suljhate hain.
                  </>
                )}
              </h1>
              {!isProcessing && (
                <p className="text-xl text-slate-500 font-light">
                  Bas apna कार्य batayiye. Baaki hum dekh lenge.
                </p>
              )}
            </div>

            {/* INPUT BAR */}
            {!isProcessing && (
              <div className="w-full max-w-2xl relative group z-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-200 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                
                <div className="relative bg-white rounded-3xl shadow-xl shadow-yellow-100/50 border border-yellow-100 p-2 flex flex-col md:flex-row items-center gap-2 transition-transform duration-300 focus-within:scale-[1.01]">
                  <textarea
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="e.g. Clean my messy room..."
                    className="w-full bg-transparent border-none focus:ring-0 text-lg p-4 text-slate-700 placeholder:text-slate-400 resize-none h-[60px] md:h-[56px] leading-relaxed"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleDecompose();
                      }
                    }}
                  />

                  <div className="flex items-center gap-2 pr-2 pb-2 md:pb-0 self-end md:self-center">
                   <button 
                    onClick={startRecording}
  disabled={isRecording}
  className={`p-3 rounded-full transition-colors ${
    isRecording 
      ? "bg-yellow-200 text-yellow-800 animate-pulse" 
      : "hover:bg-slate-50 text-slate-400 hover:text-yellow-600"
  }`}
>
  <Mic size={20} />
</button>


                    <button 
                      onClick={handleDecompose}
                      disabled={!taskInput}
                      className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                        taskInput 
                          ? 'bg-slate-900 text-white shadow-lg hover:bg-black rotate-0' 
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed rotate-90'
                      }`}
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Features Grid */}
            {!isProcessing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-24 opacity-60 hover:opacity-100 transition-opacity">
                 <FeatureCard icon={<Zap />} title="Instant" desc="Phataphat" />
                 <FeatureCard icon={<LayoutGrid />} title="Simple" desc="Asaan hai" />
                 <FeatureCard icon={<Mic />} title="Voice" desc="Bol kar dekho" />
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST MODE */}
        {steps && (
          <div className="w-full max-w-2xl animate-fade-in-up">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Your Action Plan</h2>
                <p className="text-slate-500 text-sm mt-1">{completedIndices.length}/{steps.length} completed</p>
              </div>
              <button onClick={resetApp} className="text-sm font-medium text-slate-400 hover:text-yellow-600 flex items-center gap-1">
                <RefreshCw size={14} /> New Task
              </button>
            </div>

            <div className="w-full h-2 bg-yellow-100 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const isCompleted = completedIndices.includes(index);
                return (
                  <div 
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={`
                      group flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border
                      ${isCompleted 
                        ? 'bg-slate-50 border-transparent opacity-60' 
                        : 'bg-white border-yellow-100 shadow-sm hover:shadow-md hover:border-yellow-300 hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors
                      ${isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-yellow-200 group-hover:text-yellow-700'}
                    `}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <p className={`
                      text-lg font-medium transition-all select-none
                      ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}
                    `}>
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
            {progress === 100 && (
               <div className="mt-8 p-6 bg-green-50 rounded-2xl text-center animate-bounce-slow border border-green-100">
                 <p className="text-green-800 font-bold text-xl">🎉 Task Crushed!</p>
                 <p className="text-green-600">You maintained your streak!</p>
               </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-4 rounded-2xl bg-white border border-yellow-50 shadow-sm flex items-center gap-3">
    <div className="text-yellow-600">{icon}</div>
    <div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-slate-400 text-xs">{desc}</p>
    </div>
  </div>
);

export default App;