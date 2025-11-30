import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Calendar, 
  Coffee, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ChevronLeft, 
  Sparkles,
  Globe,
  X
} from 'lucide-react';

// --- MOCK DATA ---
// В реальному додатку це приходитиме з вашого API або Firebase
const COUNTRIES = [
  { id: 'pl', name: 'Польща', flag: '🇵🇱' },
  { id: 'de', name: 'Німеччина', flag: '🇩🇪' },
  { id: 'uk', name: 'Велика Британія', flag: '🇬🇧' },
  { id: 'ca', name: 'Канада', flag: '🇨🇦' },
];

const COUNTRY_CITY = {
  pl: 'Warsaw',
  de: 'Berlin',
  uk: 'London',
  ca: 'Toronto',
};

const CATEGORIES = [
  { id: 'all', label: 'Всі', icon: null },
  { id: 'history', label: 'Історія', icon: <BookOpen size={16} /> },
  { id: 'places', label: 'Місця', icon: <MapPin size={16} /> },
  { id: 'events', label: 'Події', icon: <Calendar size={16} /> },
  { id: 'traditions', label: 'Традиції', icon: <Coffee size={16} /> },
];

const ARTICLES_DB = {
  pl: [
    {
      id: 1,
      category: 'traditions',
      title: 'Tłusty Czwartek: Чому поляки їдять пончики?',
      image: 'https://images.unsplash.com/photo-1599639668393-37e42426372d?auto=format&fit=crop&q=80&w=800',
      summary: 'Все про найсолодший день у польському календарі та як не образити господаря, відмовившись від пончика.',
      content: 'Жирний четвер (Tłusty Czwartek) — це останній четвер перед Великим постом. Традиція сягає корінням у язичництво. Легенда каже, що якщо ви не з’їсте хоча б один пончик (pączek) у цей день, удача омине вас у цьому році. Середньостатистичний поляк з’їдає 2.5 пончики в цей день.',
      tags: ['Їжа', 'Свята', 'Етикет'],
      readTime: '3 хв',
      location: 'Вся Польща'
    },
    {
      id: 2,
      category: 'places',
      title: 'Вавельський замок: Серце Кракова',
      image: 'https://images.unsplash.com/photo-1558257088-755c3c0429f6?auto=format&fit=crop&q=80&w=800',
      summary: 'Історія королівської резиденції та легенда про Вавельського дракона, яку знає кожна дитина.',
      content: 'Вавель — це не просто замок, це символ польської державності. Протягом століть тут коронували польських монархів. Особливу увагу варто приділити печері Дракона біля підніжжя пагорба. Згідно з легендою, швець Скуба переміг дракона, нагодувавши його вівцею, начиненою сіркою.',
      tags: ['Туризм', 'Архітектура', 'Легенди'],
      readTime: '5 хв',
      location: 'Краків'
    }
  ],
  de: [
    {
      id: 3,
      category: 'traditions',
      title: 'Ruhezeit: Чому не можна шуміти в неділю',
      image: 'https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?auto=format&fit=crop&q=80&w=800',
      summary: 'Тиха година в Німеччині — це закон, а не просто побажання. Як уникнути штрафів та сварок із сусідами.',
      content: 'В Німеччині неділя (Sonntag) є священним днем відпочинку (Ruhetag). Це означає, що свердління стін, стрижка газону або навіть гучна музика можуть призвести до виклику поліції. Магазини також зачинені. Це час для родини та прогулянок (Spaziergang).',
      tags: ['Закони', 'Побут', 'Сусіди'],
      readTime: '4 хв',
      location: 'Вся Німеччина'
    }
  ],
  uk: [],
  ca: []
};

// --- COMPONENTS ---

// 1. Компонент Картки Статті
const ArticleCard = ({ article, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
  >
    <div className="relative h-48 overflow-hidden">
      <img 
        src={article.image} 
        alt={article.title} 
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-slate-700 uppercase tracking-wider">
        {article.category}
      </span>
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex items-center text-xs text-slate-500 mb-2 space-x-2">
        <span className="flex items-center"><MapPin size={12} className="mr-1"/> {article.location}</span>
        <span>•</span>
        <span>{article.readTime} читання</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{article.title}</h3>
      <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">{article.summary}</p>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        {article.tags.map(tag => (
          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">#{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

// 2. Модальне вікно для читання статті + AI Features
const ArticleReader = ({ article, onClose, onAskAI }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header Image */}
        <div className="relative h-64 shrink-0">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
            <h2 className="text-2xl font-bold text-white mb-2">{article.title}</h2>
            <div className="flex items-center text-white/80 text-sm space-x-4">
              <span className="flex items-center"><MapPin size={14} className="mr-1"/> {article.location}</span>
              <span className="flex items-center"><BookOpen size={14} className="mr-1"/> {article.readTime}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          <p className="text-slate-700 leading-relaxed text-lg">{article.content}</p>
          <p className="text-slate-700 leading-relaxed">
            {/* Mocking more content */}
            Тут буде продовження статті. Важливо розуміти культурний контекст, щоб відчувати себе комфортно в новому середовищі. 
            Використовуйте цю інформацію, щоб налагодити стосунки з місцевими жителями та краще зрозуміти історію навколо вас.
          </p>

          {/* AI Action Area */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mt-8">
            <div className="flex items-center mb-3">
              <div className="bg-indigo-600 p-1.5 rounded-lg mr-3">
                <Sparkles size={18} className="text-white" />
              </div>
              <h4 className="font-semibold text-indigo-900">AI Культурний Асистент</h4>
            </div>
            <p className="text-sm text-indigo-700 mb-4">
              Є питання про цю традицію чи місце? Спитайте AI для глибшого розуміння.
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button onClick={() => onAskAI("Поясни простими словами для дитини")} className="whitespace-nowrap px-3 py-1.5 bg-white text-indigo-600 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                👶 Поясни простими словами
              </button>
              <button onClick={() => onAskAI("Який етикет тут важливий?")} className="whitespace-nowrap px-3 py-1.5 bg-white text-indigo-600 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                🎩 Який етикет?
              </button>
              <button onClick={() => onAskAI("Які слова мені треба вивчити?")} className="whitespace-nowrap px-3 py-1.5 bg-white text-indigo-600 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                🗣 Словник теми
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between items-center shrink-0">
          <div className="flex space-x-2">
            <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
              <Bookmark size={20} />
            </button>
            <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
              <Share2 size={20} />
            </button>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Я відвідав це місце
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. AI Chat Context Modal
const AIChatOverlay = ({ query, context, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'user', text: query },
    { role: 'assistant', text: 'Думаю...' }
  ]);

  // Fetch real AI answer from backend (OpenAI proxy)
  useEffect(() => {
    let aborted = false;
    const run = async () => {
      try {
        const res = await fetch('/api/places/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: context?.title || query, address: context?.location || '' }),
        });
        const data = await res.json();
        if (aborted) return;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[1] = { role: 'assistant', text: data.text || 'Немає відповіді.' };
          return newMsgs;
        });
      } catch (err) {
        if (aborted) return;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[1] = { role: 'assistant', text: 'Не вдалося отримати відповідь. Спробуйте ще раз.' };
          return newMsgs;
        });
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [query, context]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="bg-white w-full sm:w-[400px] h-[50vh] sm:h-[600px] shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-300">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles size={18} className="mr-2" />
            <span className="font-bold">AI Гід</span>
          </div>
          <button onClick={onClose}><X size={18}/></button>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                 msg.role === 'user' 
                   ? 'bg-indigo-600 text-white rounded-br-none' 
                   : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
               }`}>
                 {msg.text}
               </div>
             </div>
           ))}
        </div>

        <div className="p-3 bg-white border-t border-slate-200">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Спитайте ще щось..." 
              className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button className="absolute right-2 top-2 p-1 bg-indigo-600 rounded-full text-white">
              <ChevronLeft size={16} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('pl');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [aiQuery, setAiQuery] = useState(null); // { query: string, context: article }
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState('');
  const [traditions, setTraditions] = useState([]);
  const [traditionsLoading, setTraditionsLoading] = useState(false);
  const [traditionsError, setTraditionsError] = useState('');

  // Filter logic
  const articles = ARTICLES_DB[selectedCountry] || [];
  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  useEffect(() => {
    const city = COUNTRY_CITY[selectedCountry];
    if (!city) return;
    setPlacesLoading(true);
    setPlacesError('');
    const params = new URLSearchParams({ city });
    if (activeCategory === 'history') {
      params.set('type', 'historic');
    }
    fetch(`/api/places?${params.toString()}`)
      .then(res => res.json())
      .then(data => setPlaces(data.places || []))
      .catch(() => setPlacesError('Не вдалось отримати місця для цього міста.'))
      .finally(() => setPlacesLoading(false));
  }, [selectedCountry, activeCategory]);

  const handleCountryChange = (e) => setSelectedCountry(e.target.value);

  const handleAskAI = (question) => {
    setAiQuery({ query: question, context: selectedArticle });
  };

  const handlePlaceAI = (place) => {
    setAiQuery({ query: `Розкажи про ${place.name}`, context: { title: place.name, location: place.address } });
  };

  useEffect(() => {
    if (activeCategory !== 'traditions') return;
    const countryName = COUNTRIES.find(c => c.id === selectedCountry)?.name || '';
    setTraditionsLoading(true);
    setTraditionsError('');
    fetch(`/api/traditions?country=Poland&lang=pl`)
      .then(res => res.json())
      .then(data => setTraditions(data.items || []))
      .catch(() => setTraditionsError('Не вдалося завантажити традиції.'))
      .finally(() => setTraditionsLoading(false));
  }, [activeCategory, selectedCountry]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Globe size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
              CulturePulse
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-500 hidden sm:inline">Я зараз в:</span>
            <div className="relative">
              <select 
                value={selectedCountry}
                onChange={handleCountryChange}
                className="appearance-none bg-slate-100 border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {COUNTRIES.map(c => (
                  <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="max-w-5xl mx-auto px-4 py-2 overflow-x-auto no-scrollbar border-t border-slate-100 sm:border-t-0">
          <div className="flex space-x-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Feed */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Live Places Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Місця навколо</p>
              <h3 className="text-lg font-bold text-slate-800">
                Топ місця в {COUNTRIES.find(c => c.id === selectedCountry)?.name}
              </h3>
            </div>
            {placesLoading && <span className="text-xs text-indigo-600">Завантажуємо...</span>}
          </div>
          {placesError && <p className="text-sm text-red-500 mb-3">{placesError}</p>}

            {places.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map(place => (
                <div key={place.id} className="bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
                  {place.photoUrl && (
                    <div className="h-36 w-full overflow-hidden">
                      <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 line-clamp-1">{place.name}</h4>
                      {place.rating ? (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          ★ {place.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{place.address}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Відгуків: {place.userRatingsTotal ?? '—'}</span>
                      <span>{place.category || '—'}</span>
                    </div>
                    <button
                      onClick={() => handlePlaceAI(place)}
                      className="mt-auto text-sm inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      <Sparkles size={14} /> AI про це місце
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !placesLoading && <p className="text-sm text-slate-500">Немає результатів для цього міста.</p>
          )}
        </div>
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Відкривай культуру {COUNTRIES.find(c => c.id === selectedCountry)?.name} </h2>
            <p className="text-indigo-100 max-w-lg">
              Досліджуй історію, традиції та приховані перлини. Використовуй AI, щоб зрозуміти контекст подій.
            </p>
          </div>
        </div>

        {/* Grid Layout */}
        {activeCategory === 'traditions' ? (
          traditionsLoading ? (
            <div className="text-center py-16 text-slate-500">Завантажуємо традиції...</div>
          ) : traditionsError ? (
            <div className="text-center py-16 text-red-500 text-sm">{traditionsError}</div>
          ) : traditions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {traditions.map(item => (
                <div key={item.title} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  {item.thumbnail && (
                    <img src={`/api/places/photo?url=${encodeURIComponent(item.thumbnail)}`} alt={item.title} className="h-40 w-full object-cover" />
                  )}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h4 className="font-semibold text-slate-900 line-clamp-2">{item.title}</h4>
                    {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                    <p className="text-sm text-slate-600 line-clamp-3">{item.extract}</p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Читати у Wiki</a>
                      <button
                        onClick={() => setAiQuery({ query: `Коротко поясни цю традицію: ${item.title}`, context: { title: item.title, location: '' } })}
                        className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        <Sparkles size={14} /> AI
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-sm">Нічого не знайдено.</div>
          )
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-slate-300" />
            </div>
            <p>Ще немає статей для цієї категорії або країни.</p>
            <button onClick={() => setSelectedCountry('pl')} className="text-indigo-600 text-sm font-medium mt-2 hover:underline">
              Спробуйте "Польща" для демо
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedArticle && (
        <ArticleReader 
          article={selectedArticle} 
          onClose={() => {
            setSelectedArticle(null);
            setAiQuery(null);
          }}
          onAskAI={handleAskAI}
        />
      )}

      {aiQuery && (
        <AIChatOverlay 
          query={aiQuery.query} 
          context={aiQuery.context}
          onClose={() => setAiQuery(null)}
        />
      )}
      
    </div>
  );
}
