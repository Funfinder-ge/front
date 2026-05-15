import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Fade,
  Slide,
  Chip,
  Divider
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import logo from '../assets/logo.jpg';
const ClaudeChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I help you? / Привет! Как я могу помочь? / Merhaba! Size nasıl yardımcı olabilirim? / مرحبا! كيف يمكنني مساعدتك؟ / שלום! איך אני יכול לעזור?\n\n💡 Ask about activities, pricing, booking, safety for website info\n💬 Ask general questions for AI conversation\n\nPowered by Discount AI 🤖",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Check if it's a website-specific question (activities, pricing, booking, etc.)
      const isWebsiteQuestion = checkIfWebsiteQuestion(currentInput);
      
      let botResponseText;
      
      if (isWebsiteQuestion) {
        // Use keyword-based responses for website-specific questions
        botResponseText = await getBotResponse(currentInput);
      } else {
        // Use Ollama for general questions
        const ollamaResponse = await callOllamaAPI(currentInput);
        if (ollamaResponse) {
          botResponseText = ollamaResponse;
        } else {
          // Fallback to keyword response if Ollama fails
          botResponseText = await getBotResponse(currentInput);
        }
      }

      const botResponse = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const detectLanguage = (text) => {
    // Georgian characters
    if (/[\u10A0-\u10FF]/.test(text)) return 'georgian';
    // Arabic characters
    if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
    // Hebrew characters
    if (/[\u0590-\u05FF]/.test(text)) return 'hebrew';
    // Cyrillic characters (Russian)
    if (/[\u0400-\u04FF]/.test(text)) return 'russian';
    // Turkish specific characters
    if (/[çğıöşüÇĞIİÖŞÜ]/.test(text)) return 'turkish';
    // Default to English
    return 'english';
  };

  const checkIfWebsiteQuestion = (userInput) => {
    const websiteKeywords = [
      // Activities
      'აქტივობა', 'activity', 'активность', 'aktivite', 'نشاط', 'פעילות',
      'პარაშუტი', 'parachute', 'парашют', 'paraşüt', 'مظلة', 'צניחה',
      'იახტა', 'yacht', 'яхта', 'yat', 'يخت', 'יאכטה',
      'კვადრო', 'quad', 'квадро', 'quad', 'رباعي', 'קוואדרו',
      'ჯიპი', 'jeep', 'джип', 'cip', 'جيب', 'גיפ',
      'ველოსიპედი', 'bicycle', 'велосипед', 'bisiklet', 'دراجة', 'אופניים',
      'ზიპ', 'zip', 'зип', 'zip', 'زيب', 'זיפ',
      'სროლა', 'shooting', 'стрельба', 'atış', 'رماية', 'ירי',
      
      // Pricing
      'ფასი', 'price', 'цена', 'fiyat', 'سعر', 'מחיר',
      'ღირებულება', 'cost', 'стоимость', 'maliyet', 'تكلفة', 'עלות',
      'ფული', 'money', 'деньги', 'para', 'مال', 'כסף',
      'ლარი', 'lari', 'лари', 'lari', 'لاري', 'לרי',
      
      // Booking
      'დაჯავშნა', 'booking', 'бронирование', 'rezervasyon', 'حجز', 'הזמנה',
      'reservation', 'резервация', 'rezervasyon', 'حجز', 'הזמנה',
      'შეკვეთა', 'order', 'заказ', 'sipariş', 'طلب', 'הזמנה',
      
      // Safety
      'უსაფრთხოება', 'safety', 'безопасность', 'güvenlik', 'أمان', 'בטיחות',
      'შეზღუდვა', 'restriction', 'ограничение', 'kısıtlama', 'تقييد', 'הגבלה',
      'წესი', 'rule', 'правило', 'kural', 'قاعدة', 'חוק',
      
      // Cancellation
      'გაუქმება', 'cancel', 'отмена', 'iptal', 'إلغاء', 'ביטול',
      'cancellation', 'отмена', 'iptal', 'إلغاء', 'ביטול',
      
      
      // Contact
      'კონტაქტი', 'contact', 'контакт', 'iletişim', 'اتصال', 'קשר',
      'დახმარება', 'help', 'помощь', 'yardım', 'مساعدة', 'עזרה',
      'მხარდაჭერა', 'support', 'поддержка', 'destek', 'دعم', 'תמיכה',
      
      // Greetings
      'გამარჯობა', 'hello', 'hi', 'привет', 'merhaba', 'مرحبا', 'שלום',
      'გამარჯობათ', 'hey', 'хай', 'selam', 'أهلا', 'היי',
      'მადლობა', 'thanks', 'спасибо', 'teşekkür', 'شكرا', 'תודה',
      'thank', 'благодарю', 'teşekkür', 'شكر', 'תודה',
      
      // Website specific terms
      'discount', 'დისკაუნტი', 'скидка', 'indirim', 'خصم', 'הנחה',
      'ბათუმი', 'batumi', 'батуми', 'batum', 'باتومي', 'בתומי',
      'ქობულეთი', 'kobuleti', 'кобулети', 'kobuleti', 'كوبوليتي', 'קובולטי',
      'საქართველო', 'georgia', 'грузия', 'gürcistan', 'جورجيا', 'גאורגיה',
      'ტურიზმი', 'tourism', 'туризм', 'turizm', 'سياحة', 'תיירות'
    ];
    
    const input = userInput.toLowerCase();
    return websiteKeywords.some(keyword => input.includes(keyword));
  };

  const callOllamaAPI = async (userInput) => {
    try {
      const response = await fetch('https://api.ollama.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 7cef583b144f465db55e260dd580c77d.UTt1lEAOiCbglUPznTSq1sqh'
        },
        body: JSON.stringify({
          model: 'llama3.1',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant. You handle general questions and conversations. For specific questions about activities, pricing, booking, safety, or other website-related topics, direct users to ask about those specific topics. Respond in the same language as the user. Keep responses concise, friendly, and helpful for general inquiries.'
            },
            {
              role: 'user',
              content: userInput
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Ollama API error:', error);
      return null;
    }
  };

  const getBotResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    const detectedLanguage = detectLanguage(userInput);
    
    // Keywords for activities
    const activityKeywords = [
      'აქტივობა', 'activity', 'активность', 'aktivite', 'نشاط', 'פעילות',
      'პარაშუტი', 'parachute', 'парашют', 'paraşüt', 'مظلة', 'צניחה',
      'იახტა', 'yacht', 'яхта', 'yat', 'يخت', 'יאכטה',
      'კვადრო', 'quad', 'квадро', 'quad', 'رباعي', 'קוואדרו',
      'ჯიპი', 'jeep', 'джип', 'cip', 'جيب', 'גיפ',
      'ველოსიპედი', 'bicycle', 'велосипед', 'bisiklet', 'دراجة', 'אופניים',
      'ზიპ', 'zip', 'зип', 'zip', 'زيب', 'זיפ',
      'სროლა', 'shooting', 'стрельба', 'atış', 'رماية', 'ירי'
    ];
    
    // Keywords for pricing
    const priceKeywords = [
      'ფასი', 'price', 'цена', 'fiyat', 'سعر', 'מחיר',
      'ღირებულება', 'cost', 'стоимость', 'maliyet', 'تكلفة', 'עלות',
      'ფული', 'money', 'деньги', 'para', 'مال', 'כסף',
      'ლარი', 'lari', 'лари', 'lari', 'لاري', 'לרי'
    ];
    
    // Keywords for booking
    const bookingKeywords = [
      'დაჯავშნა', 'booking', 'бронирование', 'rezervasyon', 'حجز', 'הזמנה',
      'reservation', 'резервация', 'rezervasyon', 'حجز', 'הזמנה',
      'შეკვეთა', 'order', 'заказ', 'sipariş', 'طلب', 'הזמנה'
    ];
    
    // Keywords for safety
    const safetyKeywords = [
      'უსაფრთხოება', 'safety', 'безопасность', 'güvenlik', 'أمان', 'בטיחות',
      'შეზღუდვა', 'restriction', 'ограничение', 'kısıtlama', 'تقييد', 'הגבלה',
      'წესი', 'rule', 'правило', 'kural', 'قاعدة', 'חוק'
    ];
    
    // Keywords for cancellation
    const cancelKeywords = [
      'გაუქმება', 'cancel', 'отмена', 'iptal', 'إلغاء', 'ביטול',
      'გაუქმება', 'cancellation', 'отмена', 'iptal', 'إلغاء', 'ביטול'
    ];
    
    
    // Keywords for thanks
    const thanksKeywords = [
      'მადლობა', 'thanks', 'спасибо', 'teşekkür', 'شكرا', 'תודה',
      'thank', 'благодарю', 'teşekkür', 'شكر', 'תודה'
    ];
    
    // Keywords for contact
    const contactKeywords = [
      'კონტაქტი', 'contact', 'контакт', 'iletişim', 'اتصال', 'קשר',
      'დახმარება', 'help', 'помощь', 'yardım', 'مساعدة', 'עזרה',
      'მხარდაჭერა', 'support', 'поддержка', 'destek', 'دعم', 'תמיכה'
    ];
    
    // Keywords for greetings
    const greetingKeywords = [
      'გამარჯობა', 'hello', 'hi', 'привет', 'merhaba', 'مرحبا', 'שלום',
      'გამარჯობათ', 'hey', 'хай', 'selam', 'أهلا', 'היי'
    ];
    
    // Check for keyword matches
    const hasActivityKeywords = activityKeywords.some(keyword => input.includes(keyword));
    const hasPriceKeywords = priceKeywords.some(keyword => input.includes(keyword));
    const hasBookingKeywords = bookingKeywords.some(keyword => input.includes(keyword));
    const hasSafetyKeywords = safetyKeywords.some(keyword => input.includes(keyword));
    const hasCancelKeywords = cancelKeywords.some(keyword => input.includes(keyword));
    const hasThanksKeywords = thanksKeywords.some(keyword => input.includes(keyword));
    const hasContactKeywords = contactKeywords.some(keyword => input.includes(keyword));
    const hasGreetingKeywords = greetingKeywords.some(keyword => input.includes(keyword));
    
    // Language-specific responses
    if (hasActivityKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "🎯 აქტივობები\n\n" +
                 "პარაშუტით ფრენა\n" +
                 "იახტა\n" +
                 "კვადრო ტურები\n" +
                 "ჯიპ ტურები\n" +
                 "ველოსიპედი\n" +
                 "ზიპ ლაინი\n" +
                 "სროლა";
        case 'russian':
          return "🎯 Активности\n\n" +
                 "Парашютный полет\n" +
                 "Яхта\n" +
                 "Квадро туры\n" +
                 "Джип туры\n" +
                 "Велосипед\n" +
                 "Зип-лайн\n" +
                 "Стрельба";
        case 'turkish':
          return "🎯 Aktiviteler\n\n" +
                 "Paraşüt uçuşu\n" +
                 "Yat\n" +
                 "Quad turları\n" +
                 "Jeep turları\n" +
                 "Bisiklet\n" +
                 "Zip line\n" +
                 "Atış";
        case 'arabic':
          return "🎯 الأنشطة\n\n" +
                 "القفز بالمظلة\n" +
                 "يخت\n" +
                 "جولات رباعية\n" +
                 "جولات جيب\n" +
                 "دراجة\n" +
                 "خط الانزلاق\n" +
                 "رماية";
        case 'hebrew':
          return "🎯 פעילויות\n\n" +
                 "צניחה חופשית\n" +
                 "יאכטה\n" +
                 "סיורי קוואדרו\n" +
                 "סיורי גיפ\n" +
                 "אופניים\n" +
                 "זיפ ליין\n" +
                 "ירי";
        default: // English
          return "🎯 Activities\n\n" +
                 "Parachute flying\n" +
                 "Yacht\n" +
                 "Quad tours\n" +
                 "Jeep tours\n" +
                 "Bicycle\n" +
                 "Zip line\n" +
                 "Shooting";
      }
    }
    
    if (hasPriceKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "💰 ფასები\n\n" +
                 "პარაშუტით ფრენა: 200₾\n" +
                 "იახტა: 250₾\n" +
                 "კვადრო: 80₾\n" +
                 "ჯიპი: 120₾\n\n" +
                 "⚠️ ტაქსის ფასი ცალკე იხდება";
        case 'russian':
          return "💰 Цены\n\n" +
                 "Парашют: 200₾\n" +
                 "Яхта: 250₾\n" +
                 "Квадро: 80₾\n" +
                 "Джип: 120₾\n\n" +
                 "⚠️ Цена такси оплачивается отдельно";
        case 'turkish':
          return "💰 Fiyatlar\n\n" +
                 "Paraşüt: 200₾\n" +
                 "Yat: 250₾\n" +
                 "Quad: 80₾\n" +
                 "Jeep: 120₾\n\n" +
                 "⚠️ Taksi fiyatı ayrı ödenir";
        case 'arabic':
          return "💰 الأسعار\n\n" +
                 "مظلة: 200₾\n" +
                 "يخت: 250₾\n" +
                 "رباعي: 80₾\n" +
                 "جيب: 120₾\n\n" +
                 "⚠️ سعر التاكسي يدفع منفصل";
        case 'hebrew':
          return "💰 מחירים\n\n" +
                 "צניחה: 200₾\n" +
                 "יאכטה: 250₾\n" +
                 "קוואדרו: 80₾\n" +
                 "גיפ: 120₾\n\n" +
                 "⚠️ מחיר המונית משולם בנפרד";
        default: // English
          return "💰 Prices\n\n" +
                 "Parachute: 200₾\n" +
                 "Yacht: 250₾\n" +
                 "Quad: 80₾\n" +
                 "Jeep: 120₾\n\n" +
      }
    }
    
    if (hasBookingKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "📅 დაჯავშნა\n\n" +
                 "1. აირჩიეთ აქტივობა\n" +
                 "2. დააჭირეთ 'დაჯავშნა'\n" +
                 "3. შეავსეთ ფორმა\n" +
                 "4. გადაიხადეთ\n\n" +
                 "⏰ მინიმუმ 24 საათით ადრე";
        case 'russian':
          return "📅 Бронирование\n\n" +
                 "1. Выберите активность\n" +
                 "2. Нажмите 'Забронировать'\n" +
                 "3. Заполните форму\n" +
                 "4. Оплатите\n\n" +
                 "⏰ Минимум за 24 часа";
        case 'turkish':
          return "📅 Rezervasyon\n\n" +
                 "1. Aktivite seçin\n" +
                 "2. 'Rezervasyon' tıklayın\n" +
                 "3. Formu doldurun\n" +
                 "4. Ödeyin\n\n" +
                 "⏰ En az 24 saat önceden";
        case 'arabic':
          return "📅 الحجز\n\n" +
                 "1. اختر النشاط\n" +
                 "2. اضغط 'احجز'\n" +
                 "3. املأ النموذج\n" +
                 "4. ادفع\n\n" +
                 "⏰ قبل 24 ساعة على الأقل";
        case 'hebrew':
          return "📅 הזמנה\n\n" +
                 "1. בחר פעילות\n" +
                 "2. לחץ 'הזמן'\n" +
                 "3. מלא טופס\n" +
                 "4. שלם\n\n" +
                 "⏰ לפחות 24 שעות מראש";
        default: // English
          return "📅 Booking\n\n" +
                 "1. Choose activity\n" +
                 "2. Click 'Book'\n" +
                 "3. Fill form\n" +
                 "4. Pay\n\n" +
                 "⏰ Minimum 24 hours before";
      }
    }
    
    if (hasSafetyKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "🛡️ უსაფრთხოება\n\n" +
                 "• მინიმუმ 18 წელი\n" +
                 "• უსაფრთხოების აღჭურვილობა\n" +
                 "• ინსტრუქტორის ბრძანებების დაცვა\n" +
                 "• ალკოჰოლის აკრძალვა";
        case 'russian':
          return "🛡️ Безопасность\n\n" +
                 "• Минимум 18 лет\n" +
                 "• Снаряжение безопасности\n" +
                 "• Следовать указаниям инструктора\n" +
                 "• Запрет алкоголя";
        case 'turkish':
          return "🛡️ Güvenlik\n\n" +
                 "• En az 18 yaş\n" +
                 "• Güvenlik ekipmanı\n" +
                 "• Eğitmen talimatlarını takip edin\n" +
                 "• Alkol yasağı";
        case 'arabic':
          return "🛡️ الأمان\n\n" +
                 "• 18 سنة على الأقل\n" +
                 "• معدات الأمان\n" +
                 "• اتبع تعليمات المدرب\n" +
                 "• منع الكحول";
        case 'hebrew':
          return "🛡️ בטיחות\n\n" +
                 "• לפחות 18 שנים\n" +
                 "• ציוד בטיחות\n" +
                 "• עקוב אחר הוראות המדריך\n" +
                 "• איסור אלכוהול";
        default: // English
          return "🛡️ Safety\n\n" +
                 "• Minimum 18 years\n" +
                 "• Safety equipment\n" +
                 "• Follow instructor's orders\n" +
                 "• No alcohol";
      }
    }
    
    if (hasCancelKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "❌ გაუქმება\n\n" +
                 "• 24 საათით ადრე\n" +
                 "• 50% თანხის დაბრუნება\n" +
                 "• ცუდი ამინდის შემთხვევაში სრული დაბრუნება";
        case 'russian':
          return "❌ Отмена\n\n" +
                 "• За 24 часа\n" +
                 "• Возврат 50%\n" +
                 "• Полный возврат при плохой погоде";
        case 'turkish':
          return "❌ İptal\n\n" +
                 "• 24 saat önceden\n" +
                 "• %50 iade\n" +
                 "• Kötü hava durumunda tam iade";
        case 'arabic':
          return "❌ الإلغاء\n\n" +
                 "• قبل 24 ساعة\n" +
                 "• استرداد 50%\n" +
                 "• استرداد كامل للطقس السيء";
        case 'hebrew':
          return "❌ ביטול\n\n" +
                 "• 24 שעות מראש\n" +
                 "• החזר 50%\n" +
                 "• החזר מלא למזג אוויר גרוע";
        default: // English
          return "❌ Cancellation\n\n" +
                 "• 24 hours before\n" +
                 "• 50% refund\n" +
                 "• Full refund for bad weather";
      }
    }
    
    if (hasThanksKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "🙏 მადლობა!\n\nკიდევ რამე გჭირდებათ?";
        case 'russian':
          return "🙏 Спасибо!\n\nНужно что-то еще?";
        case 'turkish':
          return "🙏 Teşekkürler!\n\nBaşka bir şey gerekli mi?";
        case 'arabic':
          return "🙏 شكرا!\n\nتحتاج أي شيء آخر؟";
        case 'hebrew':
          return "🙏 תודה!\n\nצריך עוד משהו?";
        default: // English
          return "🙏 Thank you!\n\nNeed anything else?";
      }
    }
    
    if (hasGreetingKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "👋 გამარჯობა!\n\n" +
                 "მოგვიხარია, რომ ჩვენთან ხართ! როგორ შემიძლია დაგეხმაროთ?\n\n" +
                 "💡 შეგიძლიათ ჰკითხოთ აქტივობებზე, ფასებზე, დაჯავშნაზე და სხვა სერვისებზე";
        case 'russian':
          return "👋 Привет!\n\n" +
                 "Рады видеть вас здесь! Как я могу помочь?\n\n" +
                 "💡 Вы можете спросить об активностях, ценах, бронировании и других услугах";
        case 'turkish':
          return "👋 Merhaba!\n\n" +
                 "Burada olduğunuz için mutluyuz! Size nasıl yardımcı olabilirim?\n\n" +
                 "💡 Aktiviteler, fiyatlar, rezervasyon ve diğer hizmetler hakkında sorabilirsiniz";
        case 'arabic':
          return "👋 مرحبا!\n\n" +
                 "سعيد لرؤيتك هنا! كيف يمكنني مساعدتك؟\n\n" +
                 "💡 يمكنك السؤال عن الأنشطة والأسعار والحجز والخدمات الأخرى";
        case 'hebrew':
          return "👋 שלום!\n\n" +
                 "אנחנו שמחים לראות אותך כאן! איך אני יכול לעזור?\n\n" +
                 "💡 אתה יכול לשאול על פעילויות, מחירים, הזמנות ושירותים אחרים";
        default: // English
          return "👋 Hello!\n\n" +
                 "Great to see you here! How can I help you?\n\n" +
                 "💡 You can ask about activities, prices, booking, and other services";
      }
    }
    
    if (hasContactKeywords) {
      switch (detectedLanguage) {
        case 'georgian':
          return "📞 კონტაქტი\n\n" +
                 "• ტელეფონი: +995 32 123 4567\n" +
                 "• ელ.ფოსტა: info@discount.ge\n" +
                 "• ვებ-საიტი: www.discount.ge";
        case 'russian':
          return "📞 Контакт\n\n" +
                 "• Телефон: +995 32 123 4567\n" +
                 "• Эл.почта: info@discount.ge\n" +
                 "• Сайт: www.discount.ge";
        case 'turkish':
          return "📞 İletişim\n\n" +
                 "• Telefon: +995 32 123 4567\n" +
                 "• E-posta: info@discount.ge\n" +
                 "• Web sitesi: www.discount.ge";
        case 'arabic':
          return "📞 اتصال\n\n" +
                 "• هاتف: +995 32 123 4567\n" +
                 "• بريد إلكتروني: info@discount.ge\n" +
                 "• الموقع: www.discount.ge";
        case 'hebrew':
          return "📞 קשר\n\n" +
                 "• טלפון: +995 32 123 4567\n" +
                 "• אימייל: info@discount.ge\n" +
                 "• אתר: www.discount.ge";
        default: // English
          return "📞 Contact\n\n" +
                 "• Phone: +995 32 123 4567\n" +
                 "• Email: info@discount.ge\n" +
                 "• Website: www.discount.ge";
      }
    }
    
    // Default response in detected language
    switch (detectedLanguage) {
      case 'georgian':
        return "🤖 ბოდიშს გიხდით, ჯერ არ შემიძლია ამ კითხვაზე სრული პასუხი.\n\n" +
               "გთხოვთ, დაუკავშირდით ჩვენს მხარდაჭერის გუნდს.";
      case 'russian':
        return "🤖 Извините, я пока не могу дать полный ответ на этот вопрос.\n\n" +
               "Пожалуйста, свяжитесь с нашей службой поддержки.";
      case 'turkish':
        return "🤖 Üzgünüm, bu soruya henüz tam bir cevap veremiyorum.\n\n" +
               "Lütfen destek ekibimizle iletişime geçin.";
      case 'arabic':
        return "🤖 آسف، لا أستطيع تقديم إجابة كاملة على هذا السؤال بعد.\n\n" +
               "يرجى الاتصال بفريق الدعم.";
      case 'hebrew':
        return "🤖 מצטער, אני עדיין לא יכול לתת תשובה מלאה לשאלה זו.\n\n" +
               "אנא פנה לצוות התמיכה שלנו.";
      default: // English
        return "🤖 Sorry, I can't provide a complete answer to this question yet.\n\n" +
               "Please contact our support team.";
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ka-GE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Button */}
      <Box
        data-fab-trigger="chat"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Fade in={!isOpen} timeout={300}>
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              backgroundColor: '#87003A',
              color: 'white',
              width: 60,
              height: 60,
              boxShadow: '0 4px 20px rgba(87, 0, 21, 0.3)',
              '&:hover': {
                backgroundColor: '#3d000f',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ChatIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Fade>
      </Box>

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} timeout={300}>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 380,
            height: 500,
            zIndex: 1001,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            borderRadius: 3
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#87003A',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ backgroundColor: 'rgb(87,0,21)', mr: 1 }}>
                <img src={logo} alt="logo" width={32} height={32} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Discount AI
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Online Help
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              backgroundColor: '#f8f9fa'
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: message.sender === 'user' ? '#87003A' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="body2">
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                      fontSize: '0.7rem'
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label="Typing..." 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#e0e0e0',
                        color: 'text.secondary',
                        fontSize: '0.7rem'
                      }} 
                    />
                  </Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2, backgroundColor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Enter your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                sx={{
                  backgroundColor: '#87003A',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#3d000f'
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: 'text.secondary'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default ClaudeChatBot;
