import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../App';
import { db } from '../services/mockDb';
import { AIService } from '../services/ai';
import { FamilyStatus, RelocationProfile, RelocationStep, TargetCountry, RelocationStepItem } from '../types';
import { useI18n } from '../services/i18n';

const COUNTRIES = [
  "Ukraine", "India", "United States", "United Kingdom", "Germany", 
  "Austria", "Czech Republic", "Slovakia", "Romania", "Poland", 
  "France", "Spain", "Italy", "Brazil", "Vietnam", "China", 
  "Turkey", "Canada", "Australia", "Other"
];

const MiniChat = ({ 
  profile, 
  context, 
  title, 
  suggestions, 
  onClose,
  language
}: { 
  profile: RelocationProfile, 
  context: string, 
  title: string, 
  suggestions?: string[], 
  onClose: () => void,
  language: string
}) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role, 
        content: m.text 
      }));

      const response = await AIService.chatAboutStep(profile, context, text, history, language);
      setMessages(prev => [...prev, userMsg, { role: 'assistant', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', text: "Sorry, I encountered an error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-sm">Chat Assistant</h3>
            <p className="text-xs text-indigo-100 truncate max-w-[250px]">{title}</p>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-500 p-1 rounded">✕</button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm mb-4">Ask specifically about:</p>
              <p className="font-medium text-slate-700 text-sm mb-6">"{title}"</p>
              {suggestions && suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  {suggestions.map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-white border border-indigo-100 text-indigo-600 py-2 px-3 rounded-full hover:bg-indigo-50 transition shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-slate-400 ml-2">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <input 
              className="flex-grow bg-white border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function Relocation() {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState<RelocationProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const { t, language } = useI18n();

  // Form State
  const [citizenship, setCitizenship] = useState('Ukraine');
  const [currentResidence, setCurrentResidence] = useState('Ukraine');
  const [toCountry, setToCountry] = useState<TargetCountry>(TargetCountry.GERMANY);
  const [destinationCity, setDestinationCity] = useState('');
  const [purpose, setPurpose] = useState<any>('work');
  const [inDest, setInDest] = useState(false);
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>('alone');

  // Document Explainer State
  const [docText, setDocText] = useState('');
  const [docBase64, setDocBase64] = useState<string | null>(null);
  const [docMimeType, setDocMimeType] = useState<string>('image/jpeg');
  const [docFileName, setDocFileName] = useState<string>('');
  const [docResult, setDocResult] = useState<{ summary: string, actions: string[], isDocument?: boolean } | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Chat State
  const [activeChat, setActiveChat] = useState<{context: string, title: string, suggestions?: string[]} | null>(null);

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
      citizenship,
      currentResidence,
      toCountry,
      destinationCity: destinationCity.trim(),
      purpose,
      isAlreadyInDestination: inDest,
      familyStatus,
      plan: []
    };

    try {
      // Call AI
      const steps = await AIService.generateRelocationPlan(newProfile, language);
      newProfile.plan = steps;
      
      await db.saveRelocationProfile(newProfile);
      setProfile(newProfile);
      setIsCreating(false);
    } catch (err) {
      alert(t('relocation.generateError'));
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const toggleStep = async (stepId: string, currentStatus: string) => {
    if (!user || !profile) return;
    const newStatus = currentStatus === 'done' ? 'in_progress' : 'done';
    await db.updateStepStatus(user.id, stepId, newStatus);
    
    const updatedPlan = profile.plan?.map(s => s.id === stepId ? { ...s, status: newStatus as any } : s);
    setProfile({ ...profile, plan: updatedPlan });
  };

  const toggleChecklistItem = async (stepId: string, itemId: string) => {
    if (!profile) return;
    
    const updatedPlan = profile.plan?.map(step => {
      if (step.id !== stepId) return step;
      const updatedItems = step.checklistItems?.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      return { ...step, checklistItems: updatedItems };
    });

    setProfile({ ...profile, plan: updatedPlan });
    await db.saveRelocationProfile({ ...profile, plan: updatedPlan });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 5MB.");
      return;
    }

    setDocFileName(file.name);
    setDocMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setDocBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleExplainDocument = async () => {
    if (!docText && !docBase64) return;
    setDocLoading(true);
    setDocResult(null);
    try {
      const result = await AIService.explainDocument(docText, docBase64 || undefined, docMimeType, language);
      setDocResult(result);
    } catch (e) {
      console.error(e);
      setDocResult({ summary: "Error processing document. Please try again.", actions: [], isDocument: false });
    } finally {
      setDocLoading(false);
    }
  };

  if (isCreating || !profile) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('relocation.createTitle')}</h2>
        <form onSubmit={handleCreateProfile} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Country of Citizenship</label>
              <select 
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                value={citizenship}
                onChange={e => setCitizenship(e.target.value)}
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Country of Residence</label>
               <select 
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                value={currentResidence}
                onChange={e => setCurrentResidence(e.target.value)}
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Where are you moving to?</label>
              <select 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                value={toCountry}
                onChange={e => setToCountry(e.target.value as TargetCountry)}
              >
                {Object.values(TargetCountry).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Destination City (Optional)</label>
               <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                placeholder="e.g. Berlin"
                value={destinationCity}
                onChange={e => setDestinationCity(e.target.value)}
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Primary Purpose</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            >
              <option value="work">{t('relocation.purpose.work')}</option>
              <option value="study">{t('relocation.purpose.study')}</option>
              <option value="protection">{t('relocation.purpose.protection')}</option>
              <option value="family">{t('relocation.purpose.family')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('relocation.family.title')}</label>
            <div className="mt-2 grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:border-indigo-300">
                <input 
                  type="radio" 
                  name="familyStatus" 
                  value="alone"
                  checked={familyStatus === 'alone'}
                  onChange={() => setFamilyStatus('alone')}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700">{t('relocation.family.alone')}</span>
              </label>
              <label className="flex items-center gap-3 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:border-indigo-300">
                <input 
                  type="radio" 
                  name="familyStatus" 
                  value="with_partner"
                  checked={familyStatus === 'with_partner'}
                  onChange={() => setFamilyStatus('with_partner')}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700">{t('relocation.family.partner')}</span>
              </label>
              <label className="flex items-center gap-3 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:border-indigo-300">
                <input 
                  type="radio" 
                  name="familyStatus" 
                  value="with_children"
                  checked={familyStatus === 'with_children'}
                  onChange={() => setFamilyStatus('with_children')}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700">{t('relocation.family.children')}</span>
              </label>
              <label className="flex items-center gap-3 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:border-indigo-300">
                <input 
                  type="radio" 
                  name="familyStatus" 
                  value="with_partner_children"
                  checked={familyStatus === 'with_partner_children'}
                  onChange={() => setFamilyStatus('with_partner_children')}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700">{t('relocation.family.partnerChildren')}</span>
              </label>
            </div>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="inDest"
              className="h-4 w-4 text-indigo-600 rounded bg-white"
              checked={inDest}
              onChange={e => setInDest(e.target.checked)}
            />
            <label htmlFor="inDest" className="ml-2 text-sm text-slate-700">{t('relocation.already')}</label>
          </div>
          
          <button 
            type="submit"
            disabled={loadingAI}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loadingAI ? t('relocation.generating') : t('relocation.generate')}
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
          <h1 className="text-2xl font-bold text-slate-900">{t('relocation.planTitle')}</h1>
          <button 
            onClick={() => setIsCreating(true)}
            className="text-sm text-indigo-600 hover:underline"
          >
            {t('relocation.regenerate')}
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
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold text-lg ${step.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {step.title}
                    </h3>
                    <button 
                      onClick={() => setActiveChat({ 
                        context: `Step: ${step.title}. Details: ${step.description}`, 
                        title: step.title, 
                        suggestions: step.suggestedQuestions 
                      })}
                      className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full transition"
                      title="Open chat for this step"
                    >
                      💬
                    </button>
                  </div>
                  
                  <p className="text-slate-600 mt-1 text-sm">{step.description}</p>
                  
                  {/* Checklist Items Rendering */}
                  {step.type === 'checklist' && step.checklistItems && (
                    <div className="mt-4 space-y-2 bg-slate-50 p-3 rounded-md border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Required Documents</p>
                      {step.checklistItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleChecklistItem(step.id, item.id)}
                              className="h-4 w-4 text-indigo-600 rounded bg-white"
                            />
                            <span className={`text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.text}</span>
                          </div>
                          <button 
                            onClick={() => setActiveChat({ 
                              context: `Document Item: ${item.text}. Part of step: ${step.title}`, 
                              title: `Doc: ${item.text}`,
                              suggestions: [`What specific requirements for ${item.text}?`, `Where do I get ${item.text}?`] 
                            })}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2"
                          >
                            Ask AI 💬
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Official Links */}
                  {step.officialLinks && step.officialLinks.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {step.officialLinks.map((link, i) => {
                         // Ensure link starts with http, otherwise it might be a relative path or hash from AI
                         const safeLink = link.startsWith('http') ? link : '#';
                         return (
                          <a 
                            key={i} 
                            href={safeLink} 
                            target={safeLink !== '#' ? "_blank" : "_self"}
                            rel="noreferrer"
                            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 border border-indigo-100"
                          >
                            Official Resource {i+1} ↗
                          </a>
                         );
                      })}
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
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📄</span>
            <h3 className="text-lg font-bold">{t('relocation.doc.title')}</h3>
          </div>
          <p className="text-indigo-100 text-sm mb-6">
            {t('relocation.doc.description')}
          </p>
          <button 
            onClick={() => setShowDocModal(true)}
            className="w-full py-2 bg-white text-indigo-600 font-semibold rounded-md hover:bg-indigo-50 transition"
          >
            {t('relocation.doc.cta')}
          </button>
        </div>
      </div>

      {/* Mini Chat Overlay */}
      {activeChat && profile && (
        <MiniChat 
          profile={profile}
          context={activeChat.context}
          title={activeChat.title}
          suggestions={activeChat.suggestions}
          onClose={() => setActiveChat(null)}
          language={language}
        />
      )}

      {/* Document Explainer Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">{t('relocation.doc.modalTitle')}</h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            {!docResult ? (
              <div className="space-y-4">
                <textarea 
                  className="w-full border border-slate-300 rounded-md p-3 h-40 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
                  placeholder={t('relocation.doc.placeholder')}
                  value={docText}
                  onChange={e => setDocText(e.target.value)}
                ></textarea>
                
                <div className="border-t border-slate-100 pt-4">
                   <label className="block text-sm font-medium text-slate-700 mb-2">{t('relocation.doc.upload')}</label>
                   <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
                     <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-md transition text-sm font-medium flex items-center gap-2">
                       <span>{t('relocation.doc.choose')}</span>
                       <input 
                         type="file" 
                         accept="image/*,application/pdf" 
                         className="hidden" 
                         onChange={handleFileChange} 
                       />
                     </label>
                     {docBase64 && (
                       <div className="relative group">
                          {docMimeType.startsWith('image/') ? (
                             <img 
                               src={`data:${docMimeType};base64,${docBase64}`} 
                               alt="Preview" 
                               className="h-16 w-auto rounded border border-slate-200 object-cover" 
                             />
                          ) : (
                             <div className="h-16 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded px-3 py-2">
                                <span className="text-2xl text-red-500">📄</span>
                                <div className="flex flex-col overflow-hidden max-w-[150px]">
                                  <span className="text-xs font-bold text-slate-700 truncate">PDF Document</span>
                                  <span className="text-[10px] text-slate-500 truncate">{docFileName}</span>
                                </div>
                             </div>
                          )}
                          <button 
                            onClick={() => { setDocBase64(null); setDocMimeType('image/jpeg'); setDocFileName(''); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-600"
                            title={t('relocation.doc.removeImage')}
                          >
                            ✕
                          </button>
                       </div>
                     )}
                   </div>
                </div>

                <button 
                  onClick={handleExplainDocument}
                  disabled={docLoading || (!docText && !docBase64)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 mt-4 font-medium transition"
                >
                  {docLoading ? t('relocation.doc.analyzing') : t('relocation.doc.analyze')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {docResult.isDocument === false ? (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-md">
                        <h4 className="font-bold text-red-800 mb-2">Not a valid document</h4>
                        <p className="text-red-900 text-sm">{docResult.summary}</p>
                        <p className="text-red-800 text-xs mt-2">Please upload a photo or PDF of a clear bureaucratic document.</p>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
                
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 italic">{t('relocation.doc.disclaimer')}</p>
                  <button 
                    onClick={() => { setDocResult(null); setDocText(''); setDocBase64(null); setDocFileName(''); }}
                    className="mt-4 text-indigo-600 text-sm hover:underline"
                  >
                    {t('relocation.doc.another')}
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
