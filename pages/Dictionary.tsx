import React, { useState, useEffect } from 'react';
import { getDictionaryEntry, getEli5Explanation } from '../services/geminiService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { SpeakerIcon } from '../components/icons/Icons';
import { useChallenge } from '../context/ChallengeContext';
import { useVocabulary } from '../context/VocabularyContext';
import { DictionaryEntry } from '../types';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';

const Dictionary: React.FC = () => {
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { trackAction } = useChallenge();
  const { addWord, removeWord, isWordSaved } = useVocabulary();
  const [isEli5Mode, setIsEli5Mode] = useState(false);
  const [eli5Explanation, setEli5Explanation] = useState<string | null>(null);
  const [isLoadingEli5, setIsLoadingEli5] = useState(false);


  useEffect(() => {
    const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);


  const fetchImage = async (query: string): Promise<string | null> => {
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: {
          Authorization: PEXELS_API_KEY
        }
      });
      if (!response.ok) {
        console.error(`Pexels API error: ${response.statusText}`);
        return null;
      }
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.large;
      }
      return null;
    } catch (error) {
      console.error('Error fetching image from Pexels:', error);
      return null;
    }
  };
  
  const executeSearch = async (searchTerm: string) => {
    const cleanedSearchTerm = searchTerm.trim();
    if (!cleanedSearchTerm) {
      setError('Lütfen bir kelime girin.');
      return;
    }
    setWord(cleanedSearchTerm);
    setIsLoading(true);
    setError('');
    setEntry(null);
    setImageUrl(null);
    setIsEli5Mode(false);
    setEli5Explanation(null);
    try {
      const [resultText, fetchedImageUrl] = await Promise.all([
        getDictionaryEntry(cleanedSearchTerm),
        fetchImage(cleanedSearchTerm)
      ]);
      
      const parsedResult: DictionaryEntry = JSON.parse(resultText);
      setEntry(parsedResult);
      setImageUrl(fetchedImageUrl);
      trackAction('dictionary');
    } catch (e: any) {
      setError(e.message || 'Sözlük girdisi alınırken bir hata oluştu. Modelden gelen format hatalı olabilir.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    executeSearch(word);
  };
    
  const handleWordClick = (clickedWord: string) => {
      const cleanedWord = clickedWord.replace(/[^\w\s-]/g, '').trim();
      if(cleanedWord) {
        executeSearch(cleanedWord);
      }
  };

  const handleSpeak = () => {
    if (!word) return;
    window.speechSynthesis.cancel(); // Cancel any previous speech
    const utterance = new SpeechSynthesisUtterance(word);
    const femaleVoice = voices.find(voice => voice.lang === 'en-US' && /female/i.test(voice.name));
    utterance.voice = femaleVoice || voices.find(voice => voice.lang === 'en-US') || null;
    utterance.lang = 'en-US';
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        // Don't show an error message if the speech was simply cancelled.
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.error("Speech synthesis error:", e.error);
            setError("Sorry, the pronunciation could not be played.");
        }
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSaveWord = () => {
    if (!word || !entry?.turkishMeanings || entry.turkishMeanings.length === 0) return;
    const combinedMeaning = entry.turkishMeanings.map(m => `(${m.type}) ${m.meaning}`).join(', ');
    if (isWordSaved(word)) {
        removeWord(word);
    } else {
        addWord(word, combinedMeaning);
    }
  };

  const handleToggleEli5Mode = async () => {
    if (!entry || !word) return;

    const newModeState = !isEli5Mode;
    setIsEli5Mode(newModeState);

    // If turning on and we don't have an explanation yet
    if (newModeState && !eli5Explanation) {
        setIsLoadingEli5(true);
        setError('');
        try {
            const explanation = await getEli5Explanation(word, entry);
            setEli5Explanation(explanation);
        } catch (e: any) {
            setError(e.message || 'Basit açıklama alınamadı.');
            setIsEli5Mode(false); // Turn off if it fails
        } finally {
            setIsLoadingEli5(false);
        }
    }
  };
  
  const WordList = ({ title, words, onClick }: { title: string, words: string[], onClick: (word: string) => void}) => {
      if (!words || words.length === 0) return null;
      
      return (
          <div>
              <h4 className="font-semibold text-lg text-slate-600 dark:text-slate-400 mt-6 mb-2">{title}:</h4>
              <div className="flex flex-wrap gap-2">
                  {words.map((item, index) => (
                      <button
                          key={index}
                          onClick={() => onClick(item)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-brand-secondary dark:text-brand-primary rounded-full hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-colors duration-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                          {item}
                      </button>
                  ))}
              </div>
          </div>
      )
  }
  
  const renderParsedEntry = (entry: DictionaryEntry) => (
    <>
      {entry.pronunciation && (
        <div className="flex items-center gap-3">
          <p className="text-lg text-slate-500 dark:text-slate-400 font-mono">{entry.pronunciation}</p>
          <button onClick={handleSpeak} className="text-brand-primary hover:text-brand-secondary transition-colors" title="Telaffuzu Dinle">
            <SpeakerIcon />
          </button>
        </div>
      )}
      
      {entry.turkishMeanings && entry.turkishMeanings.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg text-slate-600 dark:text-slate-400 mt-4 mb-2">Türkçe Anlamları:</h4>
          <div className="space-y-2">
            {entry.turkishMeanings.map((meaning, index) => (
              <div key={index} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                <span className="font-bold text-brand-primary capitalize">{meaning.type}</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1">{meaning.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {entry.definitions && entry.definitions.length > 0 && <div><h4 className="font-semibold text-lg text-slate-600 dark:text-slate-400 mt-6 mb-2">Tanımlar:</h4><ul className="list-disc list-inside space-y-2 pl-2 text-slate-700 dark:text-slate-300">{entry.definitions.map((def, i) => <li key={i}>{def}</li>)}</ul></div>}

      {entry.synonyms && <WordList title="Eş Anlamlılar" words={entry.synonyms} onClick={handleWordClick} />}
      {entry.antonyms && <WordList title="Zıt Anlamlılar" words={entry.antonyms} onClick={handleWordClick} />}
      
      {entry.etymology && <p className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800"><strong className="font-semibold text-slate-600 dark:text-slate-400">Etimoloji:</strong> <span className="text-sm text-slate-500">{entry.etymology}</span></p>}
      {entry.exampleSentences && entry.exampleSentences.length > 0 && <div><h4 className="font-semibold text-lg text-slate-600 dark:text-slate-400 mt-6 mb-2">Örnek Cümleler:</h4><ul className="list-disc list-inside space-y-2 pl-2 text-slate-700 dark:text-slate-300">{entry.exampleSentences.map((ex, i) => <li key={i}>{ex}</li>)}</ul></div>}
    </>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">İngilizce Sözlük</h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">Anlamını öğrenmek istediğiniz kelime veya ifadeyi girin.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Örn: 'ubiquitous' veya 'break a leg'"
            className="flex-grow p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-800 dark:text-slate-200 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {isLoading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>
      </div>

      {isLoading && <Loader />}
      <ErrorMessage message={error} />

      {entry && (
        <div className="mt-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
                <h3 className="text-4xl font-bold text-brand-primary capitalize">{word}</h3>
                 <button 
                    onClick={handleToggleSaveWord}
                    disabled={!entry.turkishMeanings || entry.turkishMeanings.length === 0}
                    className="text-3xl p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isWordSaved(word) ? 'Kelimeyi Kaldır' : 'Kelimeyi Kaydet'}
                 >
                    {isWordSaved(word) ? '✅' : '🔖'}
                 </button>
            </div>

            <div className="flex items-center justify-end gap-2 text-sm">
                <span className="font-semibold text-slate-500 dark:text-slate-400">5 Yaşında Gibi Anlat</span>
                <label htmlFor="eli5-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="eli5-toggle"
                        className="sr-only peer"
                        checked={isEli5Mode}
                        onChange={handleToggleEli5Mode}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
            </div>
          
          {imageUrl && !isEli5Mode && (
            <div className="my-4 rounded-lg overflow-hidden shadow-md border-2 border-slate-200 dark:border-slate-800">
              <img 
                src={imageUrl} 
                alt={`An image representing '${word}'`} 
                className="w-full h-auto max-h-[400px] object-cover" 
              />
            </div>
          )}
          
          {isLoadingEli5 && <Loader />}
        
          {isEli5Mode && eli5Explanation ? (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 p-4 rounded-r-lg animate-fade-in">
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-200 text-lg">Basit Açıklama 🧸</h4>
                  <p className="mt-2">{eli5Explanation}</p>
              </div>
          ) : (
              renderParsedEntry(entry)
          )}
        </div>
      )}
    </div>
  );
};

export default Dictionary;