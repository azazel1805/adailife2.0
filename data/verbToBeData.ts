export interface ToBeData {
  tense: string;
  forms: string;
  emoji: string;
  explanation: string;
  formula: {
    positive: string;
    negative: string;
    question: string;
  };
  examples: {
    person: string;
    positive: { en: string; tr: string };
    negative: { en: string; tr: string };
    question: { en: string; tr: string };
  }[];
  pexelsQuery: string;
}

export const verbToBeData: ToBeData[] = [
  // Present Simple
  {
    tense: "Present Simple",
    forms: "am / is / are",
    emoji: "👋",
    explanation: "'To be' fiilinin geniş zamandaki halleri, bir şeyin ne olduğunu, nerede olduğunu veya nasıl olduğunu anlatmak için kullanılır. Durum bildirir.",
    formula: {
      positive: "Subject + am/is/are + ...",
      negative: "Subject + am/is/are + not + ...",
      question: "Am/Is/Are + Subject + ...?",
    },
    examples: [
      { person: 'I', positive: { en: 'I am a student.', tr: 'Ben bir öğrenciyim.' }, negative: { en: 'I am not tired.', tr: 'Yorgun değilim.' }, question: { en: 'Am I late?', tr: 'Geç mi kaldım?' } },
      { person: 'You / We / They', positive: { en: 'You are my friend.', tr: 'Sen benim arkadaşımsın.' }, negative: { en: 'They are not here.', tr: 'Onlar burada değiller.' }, question: { en: 'Are we ready?', tr: 'Hazır mıyız?' } },
      { person: 'He / She / It', positive: { en: 'She is a doctor.', tr: 'O bir doktor.' }, negative: { en: 'It is not cold.', tr: 'Hava soğuk değil.' }, question: { en: 'Is he from Turkey?', tr: 'O Türkiyeli mi?' } }
    ],
    pexelsQuery: "diverse group of people smiling"
  },
  // Past Simple
  {
    tense: "Past Simple",
    forms: "was / were",
    emoji: "🕰️",
    explanation: "'To be' fiilinin geçmiş zamandaki halleri, geçmişteki bir durumu, konumu veya özelliği anlatmak için kullanılır.",
    formula: {
      positive: "Subject + was/were + ...",
      negative: "Subject + was/were + not + ...",
      question: "Was/Were + Subject + ...?",
    },
    examples: [
      { person: 'I / He / She / It', positive: { en: 'He was at home yesterday.', tr: 'O dün evdeydi.' }, negative: { en: 'It was not expensive.', tr: 'Pahalı değildi.' }, question: { en: 'Was she happy?', tr: 'O mutlu muydu?' } },
      { person: 'You / We / They', positive: { en: 'They were in London last year.', tr: 'Onlar geçen yıl Londra\'daydılar.' }, negative: { en: 'We were not late.', tr: 'Geç kalmamıştık.' }, question: { en: 'Were you at the party?', tr: 'Partide miydin?' } },
    ],
    pexelsQuery: "old photograph of London"
  },
  // Future Simple
  {
    tense: "Future Simple",
    forms: "will be",
    emoji: "🚀",
    explanation: "'To be' fiilinin gelecek zaman hali, gelecekteki bir durumu, konumu veya özelliği anlatmak için kullanılır. Bütün öznelerle aynı şekilde kullanılır.",
    formula: {
      positive: "Subject + will be + ...",
      negative: "Subject + will not be (won't be) + ...",
      question: "Will + Subject + be + ...?",
    },
    examples: [
      { person: 'All Subjects', positive: { en: 'She will be a famous artist one day.', tr: 'O bir gün ünlü bir sanatçı olacak.' }, negative: { en: 'They will not be ready on time.', tr: 'Zamanında hazır olmayacaklar.' }, question: { en: 'Will you be at the meeting tomorrow?', tr: 'Yarın toplantıda olacak mısın?' } },
    ],
    pexelsQuery: "futuristic city"
  }
];
