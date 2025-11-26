import React, { useEffect, useState } from 'react';
import { signInUser, subscribeToAuthChanges, subscribeToScenarios, saveScenario, deleteScenario } from './services/firebase';
import { analyzeScenario } from './services/geminiService';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { ScenarioCard } from './components/ScenarioCard';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ReviewModal } from './components/ReviewModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SettingsModal } from './components/SettingsModal';
import { Scenario, UserState } from './types';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  
  // Modal states
  const [reviewScenario, setReviewScenario] = useState<Scenario | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Initialize Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, isAnonymous: firebaseUser.isAnonymous });
      } else {
        // Auto sign-in if no user
        signInUser().then((u) => {
           // State updates via onAuthStateChanged callback
        }).catch(err => console.error("Auto sign-in failed", err));
      }
      setAuthInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Scenarios (only when user is logged in)
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToScenarios(user.uid, (data) => {
      setScenarios(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSend = async (text: string, imageBase64?: string) => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Call AI Service (Gemini or OpenAI based on settings)
      const analysisData = await analyzeScenario(text, imageBase64);

      // 2. Save to Firestore/IndexedDB
      await saveScenario(user.uid, analysisData, {
        text,
        imageUrl: imageBase64
      });

      // 3. Scroll to top is handled by React automatically rendering the new item at top
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error("Error processing scenario:", error);
      alert(`Error: ${error.message || "Failed to analyze"}. Please check your AI Settings.`);
      setIsSettingsOpen(true); // Auto-open settings on error
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!user || !deleteId) return;
    
    try {
      await deleteScenario(user.uid, deleteId);
      // Ensure UI updates if relying on manual events (Demo Mode)
      // The subscribeToScenarios callback handles this, but 'await' ensures db op is done.
      // Small delay to ensure DB transaction clears
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleRandomReview = () => {
    if (scenarios.length === 0) return;
    
    // Simple random pick
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    setReviewScenario(scenarios[randomIndex]);
  };

  if (authInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header 
        onRandom={handleRandomReview} 
        onSettings={() => setIsSettingsOpen(true)}
        hasHistory={scenarios.length > 0} 
      />
      
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-32">
        {/* Empty State */}
        {scenarios.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <Sparkles className="text-primary w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Start your journey</h2>
            <p className="max-w-xs mx-auto text-sm text-slate-500">
              Type a situation (e.g. "Order coffee") or take a photo to learn how to say it naturally.
            </p>
          </div>
        )}

        {/* List */}
        <div className="space-y-6">
          {scenarios.map((scenario) => (
            <ScenarioCard 
              key={scenario.id} 
              scenario={scenario} 
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </main>

      <LoadingOverlay isVisible={loading} />
      
      <InputArea onSend={handleSend} isLoading={loading} />

      {/* Modals */}
      <ReviewModal 
        scenario={reviewScenario} 
        onClose={() => setReviewScenario(null)} 
        onNext={handleRandomReview}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Card"
        message="Are you sure you want to delete this scenario? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isDestructive
      />
    </div>
  );
};

export default App;