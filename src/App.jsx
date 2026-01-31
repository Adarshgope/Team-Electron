import React, { useState } from "react";
import { Sparkles, CheckCircle, ArrowRight, Type } from "lucide-react";

const App = () => {
  const [steps, setSteps] = useState([]);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSession, setActiveSession] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [streak, setStreak] = useState(12);

  const fontClass = isDyslexicFont
    ? "font-['OpenDyslexic',_sans-serif]"
    : "font-['Lexend',_sans-serif]";

  const handleStartTask = async () => {
    if (!taskInput.trim()) return;

    setIsProcessing(true);

    // small delay for UX
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const res = await fetch("http://localhost:5001/decompose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: taskInput }),
      });

      const data = await res.json();

      if (!data.steps || data.steps.length === 0) {
        alert("No steps returned");
        return;
      }

      setSteps(data.steps);
      setCurrentStepIndex(0);
      setActiveSession(true);
    } catch (err) {
      console.error("Backend error:", err);
      alert("Backend not responding");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      alert("Great job! Task Complete 🎉");
      setStreak((prev) => prev + 1);
      setActiveSession(false);
      setCurrentStepIndex(0);
      setTaskInput("");
      setSteps([]);
    }
  };

  return (
    <div className={`min-h-screen bg-yellow-50 text-slate-800 ${fontClass}`}>
      {/* Header */}
      <nav className="flex justify-between items-center p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-yellow-900">
            Neurathon Mate
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-3 py-1 rounded-full border">
            🔥 {streak}
          </div>

          <button
            onClick={() => setIsDyslexicFont(!isDyslexicFont)}
            className="flex items-center gap-1 text-sm"
          >
            <Type size={16} />
            {isDyslexicFont ? "Dyslexic" : "Lexend"}
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-xl mx-auto mt-12 px-6">
        {/* Task input */}
        {!activeSession && (
          <div className="fade-in">
            <h2 className="text-3xl font-bold text-center mb-4">
              What's on your mind?
            </h2>

            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="e.g., I need to clean my room but I can't start..."
              className="w-full h-32 p-4 rounded-xl bg-white border focus:ring-2 focus:ring-yellow-400"
            />

            <button
              onClick={handleStartTask}
              disabled={isProcessing}
              className="w-full mt-4 py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold"
            >
              {isProcessing ? "Breaking it down..." : "Break it Down"}
            </button>
          </div>
        )}

        {/* Focus mode */}
        {activeSession && (
          <div className="fade-in">
            <div className="mb-6 text-sm text-yellow-700 font-semibold">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg min-h-[250px] flex flex-col justify-between">
              <p className="text-3xl font-bold">
                {steps[currentStepIndex]}
              </p>

              <button
                onClick={handleNextStep}
                className="self-end mt-8 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2"
              >
                Done
                {currentStepIndex === steps.length - 1 ? (
                  <CheckCircle />
                ) : (
                  <ArrowRight />
                )}
              </button>
            </div>

            <p className="text-center mt-6 text-yellow-700">
              One step at a time 🌱
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

