import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { db } from '../services/mockDb';
import { AIService } from '../services/ai';
import { RelocationProfile, TargetCountry } from '../types';

export default function Relocation() {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState<RelocationProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  // Form State
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState<TargetCountry>(TargetCountry.GERMANY);
  const [purpose, setPurpose] = useState<any>('work');
  const [inDest, setInDest] = useState(false);

  // Document Explainer State
  const [docText, setDocText] = useState('');
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docMimeType, setDocMimeType] = useState<string>('image/jpeg');
  const [docResult, setDocResult] = useState<{ summary: string, actions: string[] } | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  useEffect(() => {
    if (user) {
      db.getRelocationProfile(user.id).then(p => {
        setProfile(p);
        if (!p) setIsCreating(true);
      });
    }
  }, [user]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoadingAI(true);
    
    const newProfile: RelocationProfile = {
      id: Math.random().toString(36),
      userId: user.id,
      fromCountry,
      toCountry,
      purpose,
      isAlreadyInDestination: inDest,
      plan: []
    };

    try {
      // Call AI
      const steps = await AIService.generateRelocationPlan(newProfile);
      newProfile.plan = steps;
      
      await db.saveRelocationProfile(newProfile);
      setProfile(newProfile);
      setIsCreating(false);
    } catch (err) {
      alert("Failed to generate plan. Check console.");
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const toggleStep = async (stepId: string, currentStatus: string) => {
    if (!user || !profile) return;
    const newStatus = currentStatus === 'done' ? 'in_progress' : 'done';
    await db.updateStepStatus(user.id, stepId, newStatus);
    
    // Optimistic update
    const updatedPlan = profile.plan?.map(s => s.id === stepId ? { ...s, status: newStatus as any } : s);
    setProfile({ ...profile, plan: updatedPlan });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // result is "data:image/png;base64,....."
      // Split to get just base64
      const base64 = result.split(',')[1];
      setDocImage(base64);
      setDocMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleExplainDocument = async () => {
    if (!docText && !docImage) return;
    setDocLoading(true);
    try {
      const result = await AIService.explainDocument(docText, docImage || undefined, docMimeType);
      setDocResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setDocLoading(false);
    }
  };

  if (isCreating || !profile) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Your Relocation Profile</h2>
        <form onSubmit={handleCreateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Where are you moving from?</label>
            <input 
              type="text" 
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              placeholder="e.g. Ukraine, India, Brazil"
              value={fromCountry}
              onChange={e => setFromCountry(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Where are you moving to?</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              value={toCountry}
              onChange={e => setToCountry(e.target.value as TargetCountry)}
            >
              {Object.values(TargetCountry).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Primary Purpose</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            >
              <option value="work">Work</option>
              <option value="study">Study</option>
              <option value="protection">Temporary Protection / Asylum</option>
              <option value="family">Family Reunification</option>
            </select>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="inDest"
              className="h-4 w-4 text-indigo-600 rounded"
              checked={inDest}
              onChange={e => setInDest(e.target.checked)}
            />
            <label htmlFor="inDest" className="ml-2 text-sm text-slate-700">I am already in the destination country</label>
          </div>
          
          <button 
            type="submit"
            disabled={loadingAI}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loadingAI ? 'Generating Plan...' : 'Generate Relocation Plan'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Plan Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Your Relocation Plan</h1>
          <button 
            onClick={() => setIsCreating(true)}
            className="text-sm text-indigo-600 hover:underline"
          >
            Regenerate
          </button>
        </div>
        
        <div className="space-y-4">
          {profile.plan?.map(step => (
            <div key={step.id} className={`p-5 rounded-lg border ${step.status === 'done' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'} transition`}>
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    checked={step.status === 'done'}
                    onChange={() => toggleStep(step.id, step.status)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer bg-white"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className={`font-semibold text-lg ${step.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mt-1 text-sm">{step.description}</p>
                  {step.officialLinks && step.officialLinks.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {step.officialLinks.map((link, i) => (
                        <a key={i} href="#" className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">
                          Official Resource {i+1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div className="space-y-6">
        {/* Document Explainer Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📄</span>
            <h3 className="text-lg font-bold">Document Explainer</h3>
          </div>
          <p className="text-indigo-100 text-sm mb-6">
            Confused by a bureaucratic letter? Paste the text here or upload a photo, and our AI will summarize it for you.
          </p>
          <button 
            onClick={() => setShowDocModal(true)}
            className="w-full py-2 bg-white text-indigo-600 font-semibold rounded-md hover:bg-indigo-50 transition"
          >
            Explain a Document
          </button>
        </div>
      </div>

      {/* Document Explainer Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Document Analysis</h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            {!docResult ? (
              <div className="space-y-4">
                <textarea 
                  className="w-full border border-slate-300 rounded-md p-3 h-40 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
                  placeholder="Paste document text here..."
                  value={docText}
                  onChange={e => setDocText(e.target.value)}
                ></textarea>
                
                <div className="border-t border-slate-100 pt-4">
                   <label className="block text-sm font-medium text-slate-700 mb-2">Or Upload a Photo</label>
                   <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
                     <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-md transition text-sm font-medium flex items-center gap-2">
                       <span>📷 Choose Image</span>
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         onChange={handleFileChange} 
                       />
                     </label>
                     {docImage && (
                       <div className="relative">
                          <img 
                            src={`data:${docMimeType};base64,${docImage}`} 
                            alt="Preview" 
                            className="h-16 w-auto rounded border border-slate-200 object-cover" 
                          />
                          <button 
                            onClick={() => { setDocImage(null); setDocMimeType('image/jpeg'); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-600"
                            title="Remove image"
                          >
                            ✕
                          </button>
                       </div>
                     )}
                   </div>
                </div>

                <button 
                  onClick={handleExplainDocument}
                  disabled={docLoading || (!docText && !docImage)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 mt-4 font-medium transition"
                >
                  {docLoading ? 'Analyzing...' : 'Analyze Document'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 p-4 rounded-md">
                  <h4 className="font-bold text-green-800 mb-2">Summary</h4>
                  <p className="text-green-900 text-sm">{docResult.summary}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Action Items</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    {docResult.actions.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 italic">This is an AI generated summary and not legal advice.</p>
                  <button 
                    onClick={() => { setDocResult(null); setDocText(''); setDocImage(null); }}
                    className="mt-4 text-indigo-600 text-sm hover:underline"
                  >
                    Analyze another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
