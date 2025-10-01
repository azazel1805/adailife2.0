export interface TenseData {
    id: string;
    name: string;
    emoji: string;
    explanation: string; // Turkish
    formula: {
      positive: string;
      negative: string;
      question: string;
    };
    examples: {
      positive: { en: string; tr: string };
      negative: { en: string; tr: string };
      question: { en: string; tr: string };
    };
    usage: string[]; // Turkish
    pexelsQuery: string;
  }
  
  export const tensesData: TenseData[] = [
      // Present Tenses
      {
          id: 'present-simple',
          name: 'Present Simple',
          emoji: '🔄',
          explanation: 'Genel doğruları, alışkanlıkları ve sık sık tekrarlanan eylemleri ifade etmek için kullanılır. Geniş zaman olarak da bilinir.',
          formula: {
              positive: 'Subject + V1 (he/she/it + V-s)',
              negative: 'Subject + do/does + not + V1',
              question: 'Do/Does + subject + V1?',
          },
          examples: {
              positive: { en: 'She works at a hospital.', tr: 'O, bir hastanede çalışır.' },
              negative: { en: 'They do not play football on Sundays.', tr: 'Onlar Pazar günleri futbol oynamazlar.' },
              question: { en: 'Do you like coffee?', tr: 'Kahve sever misin?' },
          },
          usage: [
              'Alışkanlıklar ve rutinler (I wake up at 7 AM.)',
              'Genel geçer gerçekler ve bilimsel kanunlar (The Earth revolves around the Sun.)',
              'Programlar ve tarifeler (The train leaves at 5 PM.)',
              'Duygu ve düşünceleri ifade ederken (I think you are right.)'
          ],
          pexelsQuery: 'person working in hospital',
      },
      {
          id: 'present-continuous',
          name: 'Present Continuous',
          emoji: '🏃‍♂️',
          explanation: 'Konuşma anında gerçekleşen eylemleri, geçici durumları veya yakın gelecek için yapılmış planları anlatmak için kullanılır. Şimdiki zaman olarak da bilinir.',
          formula: {
              positive: 'Subject + am/is/are + V-ing',
              negative: 'Subject + am/is/are + not + V-ing',
              question: 'Am/Is/Are + subject + V-ing?',
          },
          examples: {
              positive: { en: 'He is reading a book right now.', tr: 'O, şu anda bir kitap okuyor.' },
              negative: { en: 'We are not watching TV.', tr: 'Biz televizyon izlemiyoruz.' },
              question: { en: 'Are they coming to the party?', tr: 'Onlar partiye geliyorlar mı?' },
          },
          usage: [
              'Konuşma anında olan eylemler (She is talking on the phone.)',
              'Geçici durumlar (I am living in London this year.)',
              'Değişen ve gelişen durumlar (The climate is getting warmer.)',
              'Yakın gelecek planları (We are meeting at 8 PM tonight.)'
          ],
          pexelsQuery: 'person reading book',
      },
      {
        id: 'present-perfect',
        name: 'Present Perfect',
        emoji: '✅',
        explanation: 'Geçmişte belirsiz bir zamanda başlamış ve etkisi hala devam eden veya yeni tamamlanmış eylemleri ifade eder.',
        formula: {
          positive: 'Subject + have/has + V3',
          negative: 'Subject + have/has + not + V3',
          question: 'Have/Has + subject + V3?',
        },
        examples: {
          positive: { en: 'I have finished my homework.', tr: 'Ödevimi bitirdim.' },
          negative: { en: 'She has not seen that movie.', tr: 'O, o filmi görmedi.' },
          question: { en: 'Have you ever been to Japan?', tr: 'Hiç Japonya\'da bulundun mu?' },
        },
        usage: [
          'Geçmişte başlayıp etkisi devam eden eylemler (I have lost my keys.)',
          'Hayat tecrübeleri (He has traveled to many countries.)',
          'Yakın zamanda tamamlanmış eylemler (She has just arrived.)',
          'Zamanı belirtilmeyen geçmiş eylemler (Someone has eaten my cake.)'
        ],
        pexelsQuery: 'person finished homework',
      },
      {
        id: 'present-perfect-continuous',
        name: 'Present Perfect Continuous',
        emoji: '⏳',
        explanation: 'Geçmişte başlayıp konuşma anına kadar devam etmiş ve hala devam etmekte olan eylemleri vurgulamak için kullanılır. Süreç ön plandadır.',
        formula: {
          positive: 'Subject + have/has + been + V-ing',
          negative: 'Subject + have/has + not + been + V-ing',
          question: 'Have/Has + subject + been + V-ing?',
        },
        examples: {
          positive: { en: 'She has been working here for five years.', tr: 'O, beş yıldır burada çalışıyor.' },
          negative: { en: 'I have not been feeling well lately.', tr: 'Son zamanlarda iyi hissetmiyorum.' },
          question: { en: 'How long have you been waiting?', tr: 'Ne kadar zamandır bekliyorsun?' },
        },
        usage: [
          'Geçmişte başlayıp hala devam eden eylemler (It has been raining all day.)',
          'Yakın zamanda bitmiş ama etkisi görülen eylemler (The ground is wet because it has been raining.)',
          'Bir eylemin ne kadar süredir yapıldığını vurgulamak için (They have been talking for hours.)'
        ],
        pexelsQuery: 'person working on computer for long time',
      },
      // Past Tenses
      {
          id: 'past-simple',
          name: 'Past Simple',
          emoji: '📜',
          explanation: 'Geçmişte belirli bir zamanda başlayıp bitmiş eylemleri anlatmak için kullanılır. Di\'li geçmiş zaman olarak bilinir.',
          formula: {
              positive: 'Subject + V2',
              negative: 'Subject + did not + V1',
              question: 'Did + subject + V1?',
          },
          examples: {
              positive: { en: 'We went to the cinema yesterday.', tr: 'Biz dün sinemaya gittik.' },
              negative: { en: 'He did not finish his work.', tr: 'O, işini bitirmedi.' },
              question: { en: 'Did she call you last night?', tr: 'O, dün gece seni aradı mı?' },
          },
          usage: [
              'Geçmişte tamamlanmış eylemler (I visited Paris in 2019.)',
              'Geçmişteki alışkanlıklar (He played the guitar when he was a child.)',
              'Bir hikaye anlatırken (Once upon a time, a king lived in a castle.)'
          ],
          pexelsQuery: 'people watching movie in cinema',
      },
      {
        id: 'past-continuous',
        name: 'Past Continuous',
        emoji: '🎬',
        explanation: 'Geçmişte belirli bir anda devam etmekte olan bir eylemi anlatır. Genellikle başka bir geçmiş zaman eylemi tarafından kesintiye uğrar.',
        formula: {
          positive: 'Subject + was/were + V-ing',
          negative: 'Subject + was/were + not + V-ing',
          question: 'Was/Were + subject + V-ing?',
        },
        examples: {
          positive: { en: 'I was watching TV when the phone rang.', tr: 'Telefon çaldığında televizyon izliyordum.' },
          negative: { en: 'They were not sleeping at midnight.', tr: 'Onlar gece yarısı uyumuyorlardı.' },
          question: { en: 'What were you doing at 8 PM yesterday?', tr: 'Dün akşam 8\'de ne yapıyordun?' },
        },
        usage: [
          'Geçmişte başka bir eylem olduğunda devam eden eylem (He was cooking while she was reading.)',
          'Geçmişte belirli bir zamanda devam eden eylem (At 3 PM yesterday, I was working.)',
          'Bir hikayeye arka plan bilgisi vermek için (The sun was shining and the birds were singing.)'
        ],
        pexelsQuery: 'person sleeping while phone is ringing',
      },
      {
        id: 'past-perfect',
        name: 'Past Perfect',
        emoji: '⏪',
        explanation: 'Geçmişteki bir eylemden daha önce meydana gelmiş başka bir eylemi anlatmak için kullanılır. Miş\'li geçmiş zaman olarak da bilinir.',
        formula: {
          positive: 'Subject + had + V3',
          negative: 'Subject + had + not + V3',
          question: 'Had + subject + V3?',
        },
        examples: {
          positive: { en: 'The train had left when we arrived at the station.', tr: 'Biz istasyona vardığımızda tren gitmişti.' },
          negative: { en: 'She had not studied French before she moved to Paris.', tr: 'Paris\'e taşınmadan önce Fransızca çalışmamıştı.' },
          question: { en: 'Had you finished the report before the meeting?', tr: 'Toplantıdan önce raporu bitirmiş miydin?' },
        },
        usage: [
          'Geçmişteki bir olaydan önce olan bir olay (By the time I got home, he had already cooked dinner.)',
          'Geçmişteki bir durumun nedenini açıklamak (He was tired because he had worked all day.)'
        ],
        pexelsQuery: 'empty train station platform',
      },
      {
        id: 'past-perfect-continuous',
        name: 'Past Perfect Continuous',
        emoji: '🔁',
        explanation: 'Geçmişteki bir eylemden önce başlayıp o eyleme kadar devam etmiş olan bir süreci vurgulamak için kullanılır.',
        formula: {
          positive: 'Subject + had + been + V-ing',
          negative: 'Subject + had + not + been + V-ing',
          question: 'Had + subject + been + V-ing?',
        },
        examples: {
          positive: { en: 'He had been waiting for an hour when she finally arrived.', tr: 'O nihayet vardığında, bir saattir bekliyordu.' },
          negative: { en: 'They had not been living there for long before the flood.', tr: 'Selden önce orada uzun süredir yaşamıyorlardı.' },
          question: { en: 'Had you been working there long when you got the promotion?', tr: 'Terfiyi aldığında orada uzun süredir mi çalışıyordun?' },
        },
        usage: [
          'Geçmişteki bir noktaya kadar devam eden eylemin süresini belirtmek (She had been studying for three hours before she took a break.)',
          'Geçmişteki bir olayın nedenini açıklamak (His eyes were red because he had been crying.)'
        ],
        pexelsQuery: 'person waiting looking at watch',
      },
      // Future Tenses
      {
        id: 'future-simple',
        name: 'Future Simple',
        emoji: '➡️',
        explanation: 'Gelecekle ilgili tahminlerde, anlık kararlarda, sözlerde veya planlanmamış eylemlerde kullanılır.',
        formula: {
          positive: 'Subject + will + V1',
          negative: 'Subject + will + not (won\'t) + V1',
          question: 'Will + subject + V1?',
        },
        examples: {
          positive: { en: 'I think it will rain tomorrow.', tr: 'Sanırım yarın yağmur yağacak.' },
          negative: { en: 'She will not be at the party.', tr: 'O, partide olmayacak.' },
          question: { en: 'Will you help me with this box?', tr: 'Bu kutu için bana yardım edecek misin?' },
        },
        usage: [
          'Gelecek tahminleri (It will be cold in winter.)',
          'Anlık kararlar (I am thirsty. I will drink some water.)',
          'Sözler ve teklifler (I will always love you.)',
          '\'be going to\' ile planlanmış eylemler (I am going to visit my grandparents next week.)'
        ],
        pexelsQuery: 'rainy day city',
      },
      {
        id: 'future-continuous',
        name: 'Future Continuous',
        emoji: '✈️',
        explanation: 'Gelecekte belirli bir zamanda devam ediyor olacak bir eylemi ifade etmek için kullanılır.',
        formula: {
          positive: 'Subject + will + be + V-ing',
          negative: 'Subject + will + not + be + V-ing',
          question: 'Will + subject + be + V-ing?',
        },
        examples: {
          positive: { en: 'This time tomorrow, I will be flying to New York.', tr: 'Yarın bu zamanlar New York\'a uçuyor olacağım.' },
          negative: { en: 'Don\'t call me at 9 PM, I will be sleeping.', tr: 'Beni akşam 9\'da arama, uyuyor olacağım.' },
          question: { en: 'What will you be doing this time next week?', tr: 'Gelecek hafta bu zamanlar ne yapıyor olacaksın?' },
        },
        usage: [
          'Gelecekte belirli bir anda devam edecek eylemler (At 10 AM tomorrow, she will be giving a presentation.)',
          'Gelecekteki bir eylem tarafından kesintiye uğrayacak devam eden eylem (I will be waiting for you when your bus arrives.)'
        ],
        pexelsQuery: 'person on airplane looking out window',
      },
      {
        id: 'future-perfect',
        name: 'Future Perfect',
        emoji: '🏁',
        explanation: 'Gelecekteki belirli bir zamandan önce tamamlanmış olacak bir eylemi ifade etmek için kullanılır.',
        formula: {
          positive: 'Subject + will + have + V3',
          negative: 'Subject + will + not + have + V3',
          question: 'Will + subject + have + V3?',
        },
        examples: {
          positive: { en: 'By 2030, they will have built the new bridge.', tr: '2030\'a kadar yeni köprüyü inşa etmiş olacaklar.' },
          negative: { en: 'She will not have finished her project by Friday.', tr: 'Cuma gününe kadar projesini bitirmiş olmayacak.' },
          question: { en: 'Will you have graduated by next year?', tr: 'Gelecek yıla kadar mezun olmuş olacak mısın?' },
        },
        usage: [
          'Gelecekteki bir zamandan önce bitecek eylemler (By the time you arrive, I will have cooked dinner.)'
        ],
        pexelsQuery: 'bridge under construction at sunset',
      },
      {
        id: 'future-perfect-continuous',
        name: 'Future Perfect Continuous',
        emoji: '📈',
        explanation: 'Gelecekteki bir noktaya kadar bir eylemin ne kadar süredir devam ediyor olacağını vurgulamak için kullanılır.',
        formula: {
          positive: 'Subject + will + have + been + V-ing',
          negative: 'Subject + will + not + have + been + V-ing',
          question: 'Will + subject + have + been + V-ing?',
        },
        examples: {
          positive: { en: 'By next month, I will have been working here for two years.', tr: 'Gelecek aya kadar burada iki yıldır çalışıyor olacağım.' },
          negative: { en: 'He will not have been studying for long when the exam starts.', tr: 'Sınav başladığında uzun süredir ders çalışıyor olmayacak.' },
          question: { en: 'How long will you have been living here by the end of the year?', tr: 'Yıl sonuna kadar burada ne kadar süredir yaşıyor olacaksın?' },
        },
        usage: [
          'Gelecekteki bir eylemin süresini vurgulamak (In June, we will have been living in this house for ten years.)'
        ],
        pexelsQuery: 'office worker happy anniversary',
      },
  ];
  