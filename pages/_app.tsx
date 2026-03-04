import type { AppProps } from 'next/app';
import '../src/index.css';
import { AuthProvider } from '../context/AuthContext';
import { ChallengeProvider } from '../context/ChallengeContext';
import { VocabularyProvider } from '../context/VocabularyContext';
import { ExamHistoryProvider } from '../context/ExamHistoryContext';
import { PdfExamProvider } from '../context/PdfExamContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ChallengeProvider>
        <VocabularyProvider>
          <ExamHistoryProvider>
            <PdfExamProvider>
              <Component {...pageProps} />
            </PdfExamProvider>
          </ExamHistoryProvider>
        </VocabularyProvider>
      </ChallengeProvider>
    </AuthProvider>
  );
}
