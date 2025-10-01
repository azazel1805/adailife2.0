
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { MockExamQuestion } from '../types';

interface PdfExamState {
  questions: MockExamQuestion[];
  userAnswers: { [key: number]: string };
  timeLeft: number;
  isActive: boolean;
}

interface PdfExamContextType {
  examState: PdfExamState;
  startExam: (questions: MockExamQuestion[], duration: number) => void;
  updateAnswer: (questionNumber: number, answer: string) => void;
  setTime: (time: number | ((prevTime: number) => number)) => void;
  endExam: () => void;
}

const PdfExamContext = createContext<PdfExamContextType | undefined>(undefined);

export const PdfExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [examState, setExamState] = useState<PdfExamState>({
    questions: [],
    userAnswers: {},
    timeLeft: 0,
    isActive: false,
  });

  const startExam = useCallback((questions: MockExamQuestion[], duration: number) => {
    setExamState({
      questions,
      userAnswers: {},
      timeLeft: duration,
      isActive: true,
    });
  }, []);

  const updateAnswer = useCallback((questionNumber: number, answer: string) => {
    setExamState(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [questionNumber]: answer },
    }));
  }, []);
  
  const setTime = useCallback((time: number | ((prevTime: number) => number)) => {
    setExamState(prev => ({ ...prev, timeLeft: typeof time === 'function' ? time(prev.timeLeft) : time }));
  }, []);

  const endExam = useCallback(() => {
    setExamState({
      questions: [],
      userAnswers: {},
      timeLeft: 0,
      isActive: false,
    });
  }, []);

  return (
    <PdfExamContext.Provider value={{ examState, startExam, updateAnswer, setTime, endExam }}>
      {children}
    </PdfExamContext.Provider>
  );
};

export const usePdfExam = (): PdfExamContextType => {
  const context = useContext(PdfExamContext);
  if (!context) {
    throw new Error('usePdfExam must be used within a PdfExamProvider');
  }
  return context;
};
