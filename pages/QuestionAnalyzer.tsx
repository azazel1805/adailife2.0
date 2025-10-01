
import React, { useState } from 'react';
import { analyzeQuestion, generateSimilarQuiz } from '../services/geminiService';
import { useHistory } from '../context/HistoryContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { AnalysisResult, ParsedQuestion } from '../types';
import AnalysisResultDisplay from '../components/AnalysisResultDisplay';
import { useChallenge } from '../context/ChallengeContext';
import { parseGeneratedQuestions } from '../utils/questionParser';

interface QuizState {
  questions: ParsedQuestion[];
  userAnswers: { [key: number]: string };
  showResults: boolean;
  isLoading: boolean;
  error: string;
}

interface AnalysisWithQuestion {
  id: string;
  question: string;
  analysis: AnalysisResult;
  quiz?: QuizState;
}

interface QuestionAnalyzerProps {
    onAskTutor: (context: string) => void;
}

const QuestionAnalyzer: React.FC<QuestionAnalyzerProps> = ({ onAskTutor }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisWithQuestion[] | null>(null);
  const { addHistoryItem } = useHistory();
  const { trackAction } = useChallenge();


  const handleAnalyze = async () => {
    if (!question.trim()) {
      setError('Lütfen analiz edilecek bir soru girin.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysisResults(null);
    try {
      const parsedQuiz = parseGeneratedQuestions(question);

      if (parsedQuiz.questions.length > 0) {
        // Multi-question flow
        setAnalysisResults([]); // Initialize to show progress
        for (const parsedQuestion of parsedQuiz.questions) {
            const resultText = await analyzeQuestion(parsedQuestion.fullText);
            const resultJson: AnalysisResult = JSON.parse(resultText);
            const newResult: AnalysisWithQuestion = {
                id: `${new Date().toISOString()}-${Math.random()}`,
                question: parsedQuestion.fullText,
                analysis: resultJson
            };
            setAnalysisResults(prev => [...(prev || []), newResult]);
            addHistoryItem(parsedQuestion.fullText, resultJson);
            // FIX: The trackAction function expects only one argument (the action type).
            trackAction('analyze');
        }
      } else {
        // Single question flow (fallback)
        const resultText = await analyzeQuestion(question);
        const resultJson: AnalysisResult = JSON.parse(resultText);
        setAnalysisResults([{ 
          id: `${new Date().toISOString()}-${Math.random()}`,
          question: question, 
          analysis: resultJson 
        }]);
        addHistoryItem(question, resultJson);
        // FIX: The trackAction function expects only one argument (the action type).
        trackAction('analyze');
      }

    // FIX: Add missing opening brace for the catch block.
    } catch (e: any) {
      setError(e.message || 'Analiz sırasında bir hata oluştu. Lütfen konsolu kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateQuiz = async (resultId: string) => {
    setAnalysisResults(prev =>
      prev!.map(item =>
        item.id === resultId
          ? { ...item, quiz: { isLoading: true, error: '', questions: [], userAnswers: {}, showResults: false } }
          : item
      )
    );

    const targetItem = analysisResults?.find(item => item.id === resultId);
    if (!targetItem) return;

    try {
      const quizText = await generateSimilarQuiz(targetItem.analysis, targetItem.question);
      const parsedQuiz = parseGeneratedQuestions(quizText);

      if (parsedQuiz.questions.length === 0) {
        throw new Error("Model, quizi beklenmedik bir formatta oluşturdu. Lütfen tekrar deneyin.");
      }

      setAnalysisResults(prev =>
        prev!.map(item => {
            if (item.id === resultId) {
                const newQuizState: QuizState = {
                    isLoading: false,
                    error: '',
                    questions: parsedQuiz.questions,
                    userAnswers: {}, // Explicitly reset answers for a new quiz
                    showResults: false, // Explicitly reset results view
                };
                return { ...item, quiz: newQuizState };
            }
            return item;
        })
      );
    } catch (e: any) {
      setAnalysisResults(prev =>
        prev!.map(item =>
          item.id === resultId
            ? { ...item, quiz: { ...item.quiz!, isLoading: false, error: e.message || 'Quiz oluşturulamadı.' } }
            : item
        )
      );
    }
  };

  const handleQuizAnswerChange = (resultId: string, questionId: number, answer: string) => {
    setAnalysisResults(prev =>
      prev!.map(item => {
        if (item.id === resultId && item.quiz) {
          const newQuizState = {
            ...item.quiz,
            userAnswers: {
              ...item.quiz.userAnswers,
              [questionId]: answer,
            },
          };
          return { ...item, quiz: newQuizState };
        }
        return item;
      })
    );
  };

  const handleCheckQuizAnswers = (resultId: string) => {
    setAnalysisResults(prev =>
      prev!.map(item =>
        item.id === resultId && item.quiz
          ? { ...item, quiz: { ...item.quiz, showResults: true } }
          : item
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Soru Analisti</h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">İngilizce sınav sorusunu aşağıya yapıştırın ve detaylı bir analiz alın. Paragraf veya Cloze Test gibi çoklu soruları içeren metinler otomatik olarak algılanacaktır.</p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Analiz edilecek soruyu veya metni buraya yapıştırın..."
          className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-800 dark:text-slate-200 resize-y transition-colors"
          disabled={isLoading}
        />
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="mt-4 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </button>
      </div>

      {isLoading && <Loader />}
      <ErrorMessage message={error} />
      
      {analysisResults && analysisResults.length > 0 && (
        <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Analiz Sonuçları</h2>
            {analysisResults.map((item, index) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-brand-primary mb-4">
                        {analysisResults.length > 1 ? `Soru ${index + 1} Analizi` : 'Soru Analizi'}
                    </h3>
                    <div className="mb-4">
                        <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Analiz Edilen Soru:</h4>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono text-slate-700 dark:text-slate-300">{item.question}</div>
                    </div>
                    <AnalysisResultDisplay result={item.analysis} />
                    
                    <div className="mt-6 border-t-2 border-slate-200 dark:border-slate-800 pt-6">
                      {!item.quiz ? (
                        <button
                          onClick={() => handleGenerateQuiz(item.id)}
                          className="w-full bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                          Bu Soruya Benzer 5 Soruluk Quiz Oluştur
                        </button>
                      ) : (
                        <div>
                          <h4 className="text-lg font-bold text-brand-primary mb-4">Pratik Testi</h4>
                          {item.quiz.isLoading && <Loader />}
                          <ErrorMessage message={item.quiz.error} />
                          {item.quiz.questions.length > 0 && (
                            <div className="space-y-6">
                              {item.quiz.questions.map((q, qIndex) => {
                                const showResults = item.quiz!.showResults;
                                const userAnswers = item.quiz!.userAnswers;
                                const userAnswer = userAnswers[q.id];
                                const isCorrect = userAnswer === q.correctAnswer;
                                
                                return (
                                  <div key={q.id}>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-4 whitespace-pre-wrap"><span className="text-brand-primary font-bold">{qIndex + 1}.</span> {q.questionText}</p>
                                    <div className="space-y-3">
                                      {q.options.map(opt => {
                                        const isSelected = userAnswer === opt.key;
                                        const isCorrectOption = opt.key === q.correctAnswer;
                                        
                                        let baseClass = "flex items-center p-3 rounded-lg transition-all duration-200 border-2";
                                        let stateClass;

                                        if (showResults) {
                                            if (isCorrectOption) stateClass = "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
                                            else if (isSelected && !isCorrectOption) stateClass = "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 line-through";
                                            else stateClass = "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 opacity-70";
                                        } else {
                                            if (isSelected) {
                                                stateClass = "bg-brand-secondary/20 border-brand-primary text-slate-800 dark:text-slate-200";
                                            } else {
                                                stateClass = "border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer";
                                            }
                                        }

                                        return (
                                          <label key={opt.key} className={`${baseClass} ${stateClass}`}>
                                            <input
                                              type="radio"
                                              name={`quiz-${item.id}-question-${q.id}`}
                                              value={opt.key}
                                              checked={isSelected}
                                              onChange={() => handleQuizAnswerChange(item.id, q.id, opt.key)}
                                              disabled={showResults}
                                              className="w-4 h-4 text-brand-primary bg-slate-100 border-slate-300 focus:ring-brand-primary ring-offset-bg-secondary hidden"
                                            />
                                            <span className={`font-bold mr-3`}>{opt.key})</span>
                                            <span>{opt.value}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                     {showResults && !isCorrect && (
                                        <div className="mt-3 text-right">
                                            <button
                                                onClick={() => {
                                                    const userAnswerValue = q.options.find(o => o.key === userAnswer)?.value || 'Boş bırakıldı';
                                                    const correctAnswerValue = q.options.find(o => o.key === q.correctAnswer)?.value;
                                                    const questionContext = q.fullText.replace(/Correct answer: [A-E]/i, '').trim();
                                                    const context = `Merhaba Onur, bu soruyu yanlış yaptım. Bana nedenini açıklayabilir misin?\n\n---SORU---\n${questionContext}\n\n---CEVAPLARIM---\nBenim Cevabım: ${userAnswer || 'Boş'}) ${userAnswerValue}\nDoğru Cevap: ${q.correctAnswer}) ${correctAnswerValue}`;
                                                    onAskTutor(context);
                                                }}
                                                className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
                                            >
                                                Neden yanlış yaptığımı Onur'a sor
                                            </button>
                                        </div>
                                    )}
                                  </div>
                                );
                              })}
                              {!item.quiz.showResults && (
                                <button onClick={() => handleCheckQuizAnswers(item.id)} className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                  Cevapları Kontrol Et
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default QuestionAnalyzer;