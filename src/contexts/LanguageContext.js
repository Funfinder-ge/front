import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

const LanguageContext = createContext(null);

const SUPPORTED_LANGUAGES = ["en", "he", "hi", "ru"];

const translations = {
  en: {
    "app.name": "Fun Finder",
    "app.tagline": "Emotions, Adventures, Benefits",
    "app.subtagline": "Discover Unforgettable Sea and Land Adventures",

    // Footer
    "footer.getCard": "GET A CARD NOW",
    "footer.more": "MORE",
    "footer.rights": "Discount © {year} | All rights reserved",
    "footer.visitors": "{count} visitors",

    // Sidebar / navigation
    "nav.waterHeader": "Water Activities",
    "nav.landHeader": "Land Activities",
    "nav.mainHeader": "Main",
    "nav.nearby": "Nearby Activities",
    "nav.tickets": "Tickets",
    "nav.rules": "Rules",
    "nav.touristLaw": "Tourist Law",
    "nav.touristLawBadge": "Official",
    "nav.contact": "Contact",
    "nav.profile": "Profile",
    "nav.login": "Log in",
    "nav.register": "Register",
    "nav.guest": "Guest",
    "nav.language": "Language",
    "nav.allWaterActivities": "All Water Activities",
    "nav.allLandActivities": "All Land Activities",
    "nav.logout": "Logout",

    // Home – hero slider
    "home.hero.bestPrices": "Best Prices in Georgia",
    "home.hero.localPrice": "We sell Every Card With Local Price",
    "home.hero.extremalTitle": "Extremal and VIP Entertainment in Georgia",
    "home.hero.extremalSub":
      "Experience the thrill of zipline, paragliding, quad tours and more",
    "home.hero.securityTitle": "Security Standards",
    "home.hero.securitySub":
      "Security is at the highest stage - Certified guides, premium safety equipment, and comprehensive insurance coverage",

    // Home – sections
    "home.chooseActivity": "Choose Your Activity",
    "home.touristEssentials": "Tourist Essentials",
    "home.touristEssentials.sub":
      "Everything you need to make your visit to Georgia unforgettable",

    // Tourist tools
    "home.card.currency.title": "Currency",
    "home.card.currency.subtitle": "Live Exchange Rate",
    "home.card.currency.cta": "View Rates →",
    "home.card.weather.title": "Weather",
    "home.card.weather.subtitle": "Check Batumi Forecast",
    "home.card.weather.cta": "View Forecast →",
    "home.card.language.title": "Language",
    "home.card.language.subtitle": "Georgian Phrases",
    "home.card.language.cta": "Learn Phrases →",
    "home.card.language.phrases":
      "Common phrases:\n\nHello - გამარჯობა (Gamarjoba)\nThank you - გმადლობთ (Gmadlobt)\nYes - კი (Ki)\nNo - არა (Ara)\nPlease - გთხოვთ (Gtxovt)\nGoodbye - ნახვამდის (Nakhvamdis)",
    "home.card.emergency.title": "Emergency",
    "home.card.emergency.number": "112",
    "home.card.emergency.subtitle": "24/7 Emergency Services",
    "home.card.emergency.cta": "Call Now →",

    // Home – popular / featured
    "home.popular.notFound": "Activities not found",
    "home.featured.title": "Recommended Activities",
    "home.featured.notFound": "Recommended Activities Not Found",
    "home.bookNow": "Book Now",
    "home.seeMore": "See More →",
    "home.locationNotSpecified": "Location not specified",
    "home.activity": "Activity",

    // Category names
    "category.parachute": "Parachute",
    "category.yacht": "Yacht",
    "category.rafting": "Rafting",
    "category.seaMoto": "Sea Moto",
    "category.seaOther": "Sea Other",
    "category.quadTours": "Quad Tours",
    "category.motoTours": "Moto Tours",
    "category.jeepTours": "Jeep Tours",
    "category.hiking": "Hiking",
    "category.bicycles": "Bicycles",
    "category.zipline": "Zipline",
    "category.paragliding": "Paragliding",
    "category.karting": "Karting",
    "category.airsoft": "Airsoft",
    "category.buran": "snowmobile",
    "category.jetcar": "Jetcar",
    "category.cutter": "Cutter",
    "category.hydrocycle": "Hydrocycle",
    "category.other": "Other",

    // Home – about
    "home.about.title": "About Us – FunFinder",
    "home.about.quote": "A journey begins when you find the right experience.",
    "home.about.p1":
      "FunFinder is a place where Georgia comes alive — with adventures, emotions, and experiences that make travel unforgettable.",
    "home.about.p2":
      "We unite activities and entertainment services from different corners of the country, so travelers can easily find what attracts them most — sea or mountains, extreme or culture, tranquility or adrenaline.",
    "home.about.missionTitle": "Our mission is simple:",
    "home.about.missionText":
      "You spend less time searching and more — experiencing.",
    "home.about.p3":
      "FunFinder gives you the opportunity to plan your journey in one place, with verified partners and transparent conditions.",
    "home.about.final": "Find your adventure with FunFinder.",

    // Home – contacts
    "home.contacts.title": "Contacts",
    "home.contacts.phone": "Phone",
    "home.contacts.email": "Email",
    "home.contacts.address": "Address",
    "home.contacts.addressText": "Batumi, Adjara, Georgia",

    // Home – testimonials
    "home.testimonials.title": "Customer Reviews",
    "home.testimonials.review1.name": "Katerina K. - Batumi",
    "home.testimonials.review1.text": "The best entertainment! Sailing on the yacht in the Black Sea was top quality. Experienced team and guaranteed safety.",
    "home.testimonials.review2.name": "Giorgi G. - Tbilisi",
    "home.testimonials.review2.text": "The quad tour was top-notch. Amazing landscapes and high-quality equipment guaranteed a completely positive experience.",
    "home.testimonials.review3.name": "Nino K. - Kutaisi",
    "home.testimonials.review3.text": "VIP Beach was excellent. Premium services and comfortable sunbeds guaranteed a wonderful time at the sea.",

    // Home – FAQ
    "home.faq.title": "Frequently Asked Questions",
    "home.faq.q1": "1. How long are the tours?",
    "home.faq.a1": "Our tours last between 2 to 6 hours. Each tour has the following duration: - Yacht Ride: 2–3 hours - Quad Tour: 3–4 hours - VIP Beach: full day",
    "home.faq.q2": "2. How many people can join each tour?",
    "home.faq.a2": "The maximum number of participants per tour is as follows: - Yacht Ride: 8 people - Quad Tour: 4 people - VIP Beach: unlimited",
    "home.faq.q3": "3. What is required for the tours?",
    "home.faq.a3": "Requirements for each tour: - Yacht Ride: optional requirements - Quad Tour: quad vehicle and safety equipment - VIP Beach: optional requirements",
    "home.faq.q4": "4. What is the minimum age for the tours?",
    "home.faq.a4": "The minimum age for each tour is as follows: - Yacht Ride: 6 years old - Quad Tour: 18 years old - VIP Beach: unlimited",

    // Language switcher
    "lang.english": "English",
    "lang.hebrew": "Hebrew",
    "lang.hindi": "Hindi",
    "lang.russian": "Russian",

    // Payment rules
    "payment.rules.title": "Safety Rules & Conditions",
    "payment.rules.accepted": "Terms & Conditions Accepted",
    "payment.rules.p1": "The platform is an intermediary service. Participation in activities is at your own risk. The platform is not responsible for damages, injuries, or deterioration of health.",
    "payment.rules.p2": "The user is obliged to familiarize themselves with the provider's safety rules and ensure that their health condition is suitable for the activity.",
    "payment.rules.agreeContext": "I have read and agree to the ",
    "payment.rules.agreeLink": "Terms and Conditions",
    "payment.rules.warningCheck": "Mandatory! Please read and agree to the terms and conditions before purchasing a ticket!",
    "payment.rules.errorAccept": "Please read and accept the terms and conditions before placing an order."
  },
  he: {
    "app.name": "פאן פיינדר",
    "app.tagline": "רגשות, הרפתקאות, יתרונות",
    "app.subtagline": "גלו חוויות ים ויבשה בלתי נשכחות",

    "footer.getCard": "קבלו כרטיס עכשיו",
    "footer.more": "עוד",
    "footer.rights": "Discount © {year} | כל הזכויות שמורות",
    "footer.visitors": "{count} מבקרים",

    "nav.waterHeader": "אטרקציות מים",
    "nav.landHeader": "אטרקציות יבשה",
    "nav.mainHeader": "ראשי",
    "nav.nearby": "אטרקציות קרובות",
    "nav.tickets": "כרטיסים",
    "nav.rules": "כללים",
    "nav.touristLaw": "חוק התיירות",
    "nav.touristLawBadge": "רשמי",
    "nav.contact": "צור קשר",
    "nav.profile": "פרופיל",
    "nav.login": "התחברות",
    "nav.register": "הרשמה",
    "nav.guest": "אורח",
    "nav.language": "שפה",
    "nav.allWaterActivities": "כל אטרקציות המים",
    "nav.allLandActivities": "כל אטרקציות היבשה",
    "nav.logout": "התנתקות",

    "home.hero.bestPrices": "המחירים הטובים ביותר בגאורגיה",
    "home.hero.localPrice": "אנחנו מוכרים כל כרטיס במחיר מקומי",
    "home.hero.extremalTitle": "בילויים אקסטרים ו־VIP בגאורגיה",
    "home.hero.extremalSub":
      "חוו את הריגוש של זיפליין, מצנחי רחיפה, טיולי טרקטורונים ועוד",
    "home.hero.securityTitle": "סטנדרטים של בטיחות",
    "home.hero.securitySub":
      "הבטיחות ברמה הגבוהה ביותר – מדריכים מוסמכים, ציוד בטיחות איכותי וביטוח מקיף",

    "home.chooseActivity": "בחרו את האטרקציה שלכם",
    "home.touristEssentials": "כלים חשובים לתייר",
    "home.touristEssentials.sub":
      "הכול כדי שהביקור שלכם בגאורגיה יהיה בלתי נשכח",

    "home.card.currency.title": "מטבע",
    "home.card.currency.subtitle": "שער חליפין בזמן אמת",
    "home.card.currency.cta": "צפו בשערים →",
    "home.card.weather.title": "מזג אוויר",
    "home.card.weather.subtitle": "בדקו את התחזית בבטומי",
    "home.card.weather.cta": "צפו בתחזית →",
    "home.card.language.title": "שפה",
    "home.card.language.subtitle": "ביטויים בגאורגית",
    "home.card.language.cta": "למדו ביטויים →",
    "home.card.language.phrases":
      "ביטויים נפוצים:\n\nHello - გამარჯობა (Gamarjoba)\nThank you - გმადლობთ (Gmadlobt)\nYes - კი (Ki)\nNo - არა (Ara)\nPlease - გთხოვთ (Gtxovt)\nGoodbye - ნახვამდის (Nakhvamdis)",
    "home.card.emergency.title": "חירום",
    "home.card.emergency.number": "112",
    "home.card.emergency.subtitle": "שירותי חירום 24/7",
    "home.card.emergency.cta": "התקשרו עכשיו →",

    "home.popular.notFound": "לא נמצאו אטרקציות",
    "home.featured.title": "אטרקציות מומלצות",
    "home.featured.notFound": "לא נמצאו אטרקציות מומלצות",
    "home.bookNow": "הזמינו עכשיו",
    "home.seeMore": "ראו עוד →",
    "home.locationNotSpecified": "מיקום לא צוין",
    "home.activity": "אטרקציה",

    "category.parachute": "מצנח",
    "category.yacht": "יאכטה",
    "category.rafting": "רפטינג",
    "category.seaMoto": "סירות ים",
    "category.seaOther": "אחר",
    "category.quadTours": "טיולי טרקטורונים",
    "category.motoTours": "טיולי אופנועים",
    "category.jeepTours": "טיולי ג'יפים",
    "category.hiking": "טיולי רגל",
    "category.bicycles": "אופניים",
    "category.zipline": "זיפליין",
    "category.paragliding": "מצנחי רחיפה",
    "category.karting": "קרטינג",
    "category.airsoft": "אייר סופט",
    "category.buran": "בוראן",
    "category.jetcar": "ג'טקאר",
    "category.cutter": "קוטר",
    "category.hydrocycle": "הידרוציקל",
    "category.other": "אחר",

    "home.about.title": "עלינו – FunFinder",
    "home.about.quote": "מסע אמיתי מתחיל כשמוצאים את החוויה הנכונה.",
    "home.about.p1":
      "FunFinder הוא המקום שבו גאורגיה מתעוררת לחיים – עם חוויות, רגשות ואטרקציות שהופכות את הטיול לבלתי נשכח.",
    "home.about.p2":
      "אנחנו מאחדים פעילויות ושירותי בילוי מכל רחבי המדינה, כדי שתוכלו למצוא בקלות מה שמדבר אליכם – ים או הרים, אקסטרים או תרבות, רוגע או אדרנלין.",
    "home.about.missionTitle": "המשימה שלנו פשוטה:",
    "home.about.missionText":
      "שתבלו פחות זמן בחיפוש ויותר זמן בחוויה.",
    "home.about.p3":
      "FunFinder מאפשר לכם לתכנן את הטיול במקום אחד, עם שותפים מאומתים ותנאים שקופים.",
    "home.about.final": "מצאו את ההרפתקה שלכם עם FunFinder.",

    "home.contacts.title": "צור קשר",
    "home.contacts.phone": "טלפון",
    "home.contacts.email": "אימייל",
    "home.contacts.address": "כתובת",
    "home.contacts.addressText": "בטומי, אזור אדג'רה, גאורגיה",

    "home.testimonials.title": "חוות דעת לקוחות",
    "home.testimonials.review1.name": "קתרינה ק. - בטומי",
    "home.testimonials.review1.text": "הבילוי הטוב ביותר! שייט על היאכטה בים השחור היה באיכות גבוהה. צוות מנוסה ובטיחות מובטחת.",
    "home.testimonials.review2.name": "גיורגי ג. - טביליסי",
    "home.testimonials.review2.text": "טיול הטרקטורונים היה מעולה. נופים מדהימים וציוד איכותי הבטיחו חוויה חיובית לחלוטין.",
    "home.testimonials.review3.name": "נינו ק. - כותאיסי",
    "home.testimonials.review3.text": "חוף VIP היה מצוין. שירותים פרמיים ומיטות שיזוף נוחות הבטיחו זמן נפלא בים.",

    "home.faq.title": "שאלות נפוצות",
    "home.faq.q1": "1. כמה זמן נמשכים הטיולים?",
    "home.faq.a1": "הטיולים שלנו נמשכים בין 2 ל-6 שעות. לכל טיול יש את משך הזמן הבא: - שייט יאכטה: 2–3 שעות - טיול טרקטורונים: 3–4 שעות - חוף VIP: יום מלא",
    "home.faq.q2": "2. כמה אנשים יכולים להצטרף לכל טיול?",
    "home.faq.a2": "מספר המשתתפים המקסימלי לכל טיול הוא כדלקמן: - שייט יאכטה: 8 אנשים - טיול טרקטורונים: 4 אנשים - חוף VIP: ללא הגבלה",
    "home.faq.q3": "3. מה נדרש לטיולים?",
    "home.faq.a3": "דרישות לכל טיול: - שייט יאכטה: דרישות אופציונליות - טיול טרקטורונים: רכב טרקטורונים וציוד בטיחות - חוף VIP: דרישות אופציונליות",
    "home.faq.q4": "4. מה הגיל המינימלי לטיולים?",
    "home.faq.a4": "הגיל המינימלי לכל טיול הוא כדלקמן: - שייט יאכטה: 6 שנים - טיול טרקטורונים: 18 שנים - חוף VIP: ללא הגבלה",

    "lang.english": "אנגלית",
    "lang.hebrew": "עברית",
    "lang.hindi": "הינדי",
    "lang.russian": "רוסית",

    // Payment rules
    "payment.rules.title": "כללי בטיחות ותנאים",
    "payment.rules.accepted": "כללים ותנאים התקבלו",
    "payment.rules.p1": "הפלטפורמה היא שירות תיווך. ההשתתפות בפעילויות היא על אחריותך בלבד. הפלטפורמה אינה אחראית לנזקים, פציעות או הידרדרות במצב הבריאותי.",
    "payment.rules.p2": "על המשתמש להכיר את כללי הבטיחות של הספק ולוודא שמצבו הבריאותי מתאים לפעילות.",
    "payment.rules.agreeContext": "קראתי ואני מסכים/ה ל",
    "payment.rules.agreeLink": "כללים ותנאים",
    "payment.rules.warningCheck": "חובה! אנא קראו והסכימו לכללים והתנאים לפני רכישת כרטיס!",
    "payment.rules.errorAccept": "אנא קראו והסכימו לכללים ולהתנאים לפני ביצוע ההזמנה."
  },
  hi: {
    "app.name": "फ़न फाइंडर",
    "app.tagline": "भावनाएँ, रोमांच, लाभ",
    "app.subtagline": "अविस्मरणीय समुद्री और स्थलीय अनुभव खोजें",

    "footer.getCard": "कार्ड अभी प्राप्त करें",
    "footer.more": "और देखें",
    "footer.rights": "Discount © {year} | सर्वाधिकार सुरक्षित",
    "footer.visitors": "{count} आगंतुक",

    "nav.waterHeader": "वॉटर एक्टिविटीज़",
    "nav.landHeader": "लैंड एक्टिविटीज़",
    "nav.mainHeader": "मुख्य",
    "nav.nearby": "नज़दीकी गतिविधियाँ",
    "nav.tickets": "टिकट",
    "nav.rules": "नियम",
    "nav.touristLaw": "पर्यटक कानून",
    "nav.touristLawBadge": "आधिकारिक",
    "nav.contact": "संपर्क",
    "nav.profile": "प्रोफ़ाइल",
    "nav.login": "लॉगिन",
    "nav.register": "रजिस्टर",
    "nav.guest": "मेहमान",
    "nav.language": "भाषा",
    "nav.allWaterActivities": "सभी वॉटर एक्टिविटीज़",
    "nav.allLandActivities": "सभी लैंड एक्टिविटीज़",
    "nav.logout": "लॉगआउट",

    "home.hero.bestPrices": "जॉर्जिया में सबसे बेहतरीन कीमतें",
    "home.hero.localPrice": "हम हर कार्ड को लोकल प्राइस पर बेचते हैं",
    "home.hero.extremalTitle": "जॉर्जिया में एक्स्ट्रीम और VIP मनोरंजन",
    "home.hero.extremalSub":
      "ज़िपलाइन, पैराग्लाइडिंग, क्वाड टूर और बहुत कुछ का रोमांच महसूस करें",
    "home.hero.securityTitle": "सुरक्षा मानक",
    "home.hero.securitySub":
      "सुरक्षा सर्वोच्च स्तर पर – प्रमाणित गाइड, प्रीमियम सुरक्षा उपकरण और पूर्ण बीमा कवरेज",

    "home.chooseActivity": "अपनी गतिविधि चुनें",
    "home.touristEssentials": "टूरिस्ट के लिए ज़रूरी जानकारी",
    "home.touristEssentials.sub":
      "जॉर्जिया की आपकी यात्रा को अविस्मरणीय बनाने के लिए सब कुछ",

    "home.card.currency.title": "करेंसी",
    "home.card.currency.subtitle": "लाइव एक्सचेंज रेट",
    "home.card.currency.cta": "रेट देखें →",
    "home.card.weather.title": "मौसम",
    "home.card.weather.subtitle": "बटूमी का मौसम देखें",
    "home.card.weather.cta": "फोरकास्ट देखें →",
    "home.card.language.title": "भाषा",
    "home.card.language.subtitle": "जॉर्जियन वाक्यांश",
    "home.card.language.cta": "वाक्यांश सीखें →",
    "home.card.language.phrases":
      "आम वाक्यांश:\n\nHello - გამარჯობა (Gamarjoba)\nThank you - გმადლობთ (Gmadlobt)\nYes - კი (Ki)\nNo - არა (Ara)\nPlease - გთხოვთ (Gtxovt)\nGoodbye - ნახვამდის (Nakhvamdis)",
    "home.card.emergency.title": "आपातकाल",
    "home.card.emergency.number": "112",
    "home.card.emergency.subtitle": "24/7 आपातकालीन सेवाएँ",
    "home.card.emergency.cta": "अभी कॉल करें →",

    "home.popular.notFound": "कोई गतिविधि नहीं मिली",
    "home.featured.title": "सिफारिश की गई गतिविधियाँ",
    "home.featured.notFound": "सिफारिश की गई गतिविधियाँ नहीं मिलीं",
    "home.bookNow": "अभी बुक करें",
    "home.seeMore": "और देखें →",
    "home.locationNotSpecified": "स्थान निर्दिष्ट नहीं",
    "home.activity": "गतिविधि",

    "category.parachute": "पैराशूट",
    "category.yacht": "यॉट",
    "category.rafting": "राफ्टिंग",
    "category.seaMoto": "समुद्री मोटो",
    "category.seaOther": "अन्य",
    "category.quadTours": "क्वाड टूर",
    "category.motoTours": "मोटो टूर",
    "category.jeepTours": "जीप टूर",
    "category.hiking": "हाइकिंग",
    "category.bicycles": "साइकिल",
    "category.zipline": "ज़िपलाइन",
    "category.paragliding": "पैराग्लाइडिंग",
    "category.karting": "कार्टिंग",
    "category.airsoft": "एयरसॉफ्ट",
    "category.buran": "बुरान",
    "category.jetcar": "जेटकार",
    "category.cutter": "कटर",
    "category.hydrocycle": "हाइड्रोसाइकिल",
    "category.other": "अन्य",

    "home.about.title": "हमारे बारे में – FunFinder",
    "home.about.quote": "सफ़र तब शुरू होता है जब आप सही अनुभव पाते हैं।",
    "home.about.p1":
      "FunFinder वह जगह है जहाँ जॉर्जिया ज़िंदा हो उठता है – रोमांच, भावनाएँ और अनुभवों के साथ जो यात्रा को अविस्मरणीय बना देते हैं।",
    "home.about.p2":
      "हम देश के अलग-अलग हिस्सों से गतिविधियों और मनोरंजन सेवाओं को एक साथ लाते हैं, ताकि यात्री आसानी से वह ढूँढ सकें जो उन्हें आकर्षित करता है – समुद्र या पहाड़, एक्स्ट्रीम या संस्कृति, शांति या एड्रेनालिन।",
    "home.about.missionTitle": "हमारा मिशन सरल है:",
    "home.about.missionText":
      "आप कम समय खोज में और ज़्यादा समय अनुभव में बिताएँ।",
    "home.about.p3":
      "FunFinder आपको एक ही जगह पर अपने सफ़र की योजना बनाने देता है, भरोसेमंद पार्टनर्स और पारदर्शी शर्तों के साथ।",
    "home.about.final": "अपना एडवेंचर FunFinder के साथ खोजें।",

    "home.contacts.title": "संपर्क",
    "home.contacts.phone": "फ़ोन",
    "home.contacts.email": "ईमेल",
    "home.contacts.address": "पता",
    "home.contacts.addressText": "बटूमी, अजारा, जॉर्जिया",

    "home.testimonials.title": "ग्राहक समीक्षा",
    "home.testimonials.review1.name": "कैटरीना के. - बटूमी",
    "home.testimonials.review1.text": "सबसे बेहतरीन मनोरंजन! काला सागर में यॉट पर नौकायन शीर्ष गुणवत्ता का था। अनुभवी टीम और गारंटीकृत सुरक्षा।",
    "home.testimonials.review2.name": "गियोर्गी जी. - त्बिलिसी",
    "home.testimonials.review2.text": "क्वाड टूर शीर्ष स्तर का था। अद्भुत परिदृश्य और उच्च गुणवत्ता वाले उपकरण ने पूरी तरह से सकारात्मक अनुभव की गारंटी दी।",
    "home.testimonials.review3.name": "निनो के. - कुतैसी",
    "home.testimonials.review3.text": "VIP बीच उत्कृष्ट था। प्रीमियम सेवाएँ और आरामदायक सनबेड ने समुद्र पर एक अद्भुत समय की गारंटी दी।",

    "home.faq.title": "अक्सर पूछे जाने वाले सवाल",
    "home.faq.q1": "1. टूर कितने समय तक चलते हैं?",
    "home.faq.a1": "हमारे टूर 2 से 6 घंटे तक चलते हैं। प्रत्येक टूर की अवधि इस प्रकार है: - यॉट राइड: 2–3 घंटे - क्वाड टूर: 3–4 घंटे - VIP बीच: पूरा दिन",
    "home.faq.q2": "2. प्रत्येक टूर में कितने लोग शामिल हो सकते हैं?",
    "home.faq.a2": "प्रत्येक टूर में प्रतिभागियों की अधिकतम संख्या इस प्रकार है: - यॉट राइड: 8 लोग - क्वाड टूर: 4 लोग - VIP बीच: असीमित",
    "home.faq.q3": "3. टूर के लिए क्या आवश्यक है?",
    "home.faq.a3": "प्रत्येक टूर के लिए आवश्यकताएँ: - यॉट राइड: वैकल्पिक आवश्यकताएँ - क्वाड टूर: क्वाड वाहन और सुरक्षा उपकरण - VIP बीच: वैकल्पिक आवश्यकताएँ",
    "home.faq.q4": "4. टूर के लिए न्यूनतम आयु क्या है?",
    "home.faq.a4": "प्रत्येक टूर के लिए न्यूनतम आयु इस प्रकार है: - यॉट राइड: 6 वर्ष - क्वाड टूर: 18 वर्ष - VIP बीच: असीमित",

    "lang.english": "अंग्रेज़ी",
    "lang.hebrew": "हिब्रू",
    "lang.hindi": "हिंदी",
    "lang.russian": "रूसी",

    // Payment rules
    "payment.rules.title": "सुरक्षा नियम और शर्तें",
    "payment.rules.accepted": "नियम और शर्तें स्वीकार की गईं",
    "payment.rules.p1": "मंच एक मध्यस्थ सेवा है। गतिविधियों में भाग लेना आपके अपने जोखिम पर है। मंच किसी भी नुकसान, चोट, या स्वास्थ्य में गिरावट के लिए ज़िम्मेदार नहीं है।",
    "payment.rules.p2": "उपयोगकर्ता प्रदाता के सुरक्षा नियमों से परिचित होने और यह सुनिश्चित करने के लिए बाध्य है कि उनकी स्वास्थ्य स्थिति गतिविधि के लिए उपयुक्त है।",
    "payment.rules.agreeContext": "मैंने पढ़ लिया है और मैं सहमत हूँ ",
    "payment.rules.agreeLink": "नियमों और शर्तों से",
    "payment.rules.warningCheck": "अनिवार्य! कृपया टिकट खरीदने से पहले नियमों और शर्तों को पढ़ें और स्वीकार करें!",
    "payment.rules.errorAccept": "आदेश देने से पहले कृपया नियमों और शर्तों को पढ़ें और स्वीकार करें।"
  },
  ru: {
    "app.name": "Fun Finder",
    "app.tagline": "Эмоции, Приключения, Выгода",
    "app.subtagline": "Откройте для себя незабываемые морские и наземные приключения",

    "footer.getCard": "ПОЛУЧИТЬ КАРТУ СЕЙЧАС",
    "footer.more": "БОЛЬШЕ",
    "footer.rights": "Скидка © {year} | Все права защищены",
    "footer.visitors": "{count} посетителей",

    "nav.waterHeader": "Водные развлечения",
    "nav.landHeader": "Наземные развлечения",
    "nav.mainHeader": "Главная",
    "nav.nearby": "Развлечения поблизости",
    "nav.tickets": "Билеты",
    "nav.rules": "Правила",
    "nav.touristLaw": "Закон о туристах",
    "nav.touristLawBadge": "Официально",
    "nav.contact": "Контакты",
    "nav.profile": "Профиль",
    "nav.login": "Войти",
    "nav.register": "Регистрация",
    "nav.guest": "Гость",
    "nav.language": "Язык",
    "nav.allWaterActivities": "Все водные развлечения",
    "nav.allLandActivities": "Все наземные развлечения",
    "nav.logout": "Выйти",

    "home.hero.bestPrices": "Лучшие цены в Грузии",
    "home.hero.localPrice": "Мы продаем каждую карту по местной цене",
    "home.hero.extremalTitle": "Экстремальные и VIP развлечения в Грузии",
    "home.hero.extremalSub": "Испытайте острые ощущения от зиплайна, парапланеризма, квадроциклов и многого другого",
    "home.hero.securityTitle": "Стандарты безопасности",
    "home.hero.securitySub": "Безопасность на высшем уровне - Сертифицированные гиды, премиальное оборудование и полная страховка",

    "home.chooseActivity": "Выберите развлечение",
    "home.touristEssentials": "Памятка туристу",
    "home.touristEssentials.sub": "Всё, что сделает ваш визит в Грузию незабываемым",

    "home.card.currency.title": "Валюта",
    "home.card.currency.subtitle": "Текущий курс обмена",
    "home.card.currency.cta": "Посмотреть курсы →",
    "home.card.weather.title": "Погода",
    "home.card.weather.subtitle": "Прогноз в Батуми",
    "home.card.weather.cta": "Посмотреть прогноз →",
    "home.card.language.title": "Язык",
    "home.card.language.subtitle": "Грузинские фразы",
    "home.card.language.cta": "Учить фразы →",
    "home.card.language.phrases": "Популярные фразы:\n\nПривет - გამარჯობა (Гамарджоба)\nСпасибо - გმადლობთ (Гмадлобт)\nДа - კი (Ки)\nНет - არა (Ара)\nПожалуйста - გთხოვთ (Гтховт)\nДо свидания - ნახვამდის (Нахвамдис)",
    "home.card.emergency.title": "Экстренные службы",
    "home.card.emergency.number": "112",
    "home.card.emergency.subtitle": "Службы 24/7",
    "home.card.emergency.cta": "Позвонить сейчас →",

    "home.popular.notFound": "Развлечения не найдены",
    "home.featured.title": "Рекомендуемые развлечения",
    "home.featured.notFound": "Рекомендуемые развлечения не найдены",
    "home.bookNow": "Забронировать",
    "home.seeMore": "Смотреть больше →",
    "home.locationNotSpecified": "Локация не указана",
    "home.activity": "Активность",

    "category.parachute": "Парашют",
    "category.yacht": "Яхта",
    "category.rafting": "Рафтинг",
    "category.seaMoto": "Гидроцикл",
    "category.seaOther": "Другое (Море)",
    "category.quadTours": "Квадроциклы",
    "category.motoTours": "Мототуры",
    "category.jeepTours": "Джип-туры",
    "category.hiking": "Пешие походы",
    "category.bicycles": "Велосипеды",
    "category.zipline": "Зиплайн",
    "category.paragliding": "Параплан",
    "category.karting": "Картинг",
    "category.airsoft": "Страйкбол",
    "category.buran": "Буран",
    "category.jetcar": "Джеткар",
    "category.cutter": "Катер",
    "category.hydrocycle": "Водный мотоцикл",
    "category.other": "Другое",

    "home.about.title": "О нас – FunFinder",
    "home.about.quote": "Путешествие начинается, когда вы находите правильный опыт.",
    "home.about.p1": "FunFinder — это место, где Грузия оживает — с приключениями, эмоциями и впечатлениями, которые делают путешествие незабываемым.",
    "home.about.p2": "Мы объединяем активности и развлекательные услуги со всех уголков страны, чтобы путешественники могли легко найти то, что им по душе — море или горы, экстрим или культуру, покой или адреналин.",
    "home.about.missionTitle": "Наша миссия проста:",
    "home.about.missionText": "Вы тратите меньше времени на поиск и больше — на впечатления.",
    "home.about.p3": "FunFinder дает вам возможность спланировать свое путешествие в одном месте, с проверенными партнерами и прозрачными условиями.",
    "home.about.final": "Найдите свое приключение с FunFinder.",

    "home.contacts.title": "Контакты",
    "home.contacts.phone": "Телефон",
    "home.contacts.email": "Email",
    "home.contacts.address": "Адрес",
    "home.contacts.addressText": "Батуми, Аджария, Грузия",

    "home.testimonials.title": "Отзывы клиентов",
    "home.testimonials.review1.name": "Катерина К. - Батуми",
    "home.testimonials.review1.text": "Лучшее развлечение! Прогулка на яхте по Черному морю была на высшем уровне. Опытная команда и гарантированная безопасность.",
    "home.testimonials.review2.name": "Гиорги Г. - Тбилиси",
    "home.testimonials.review2.text": "Тур на квадроциклах был первоклассным. Потрясающие пейзажи и высококачественное оборудование обеспечили полностью положительный опыт.",
    "home.testimonials.review3.name": "Нино К. - Кутаиси",
    "home.testimonials.review3.text": "VIP-пляж был превосходным. Премиальные услуги и комфортные шезлонги гарантировали прекрасное время на море.",

    "home.faq.title": "Часто задаваемые вопросы",
    "home.faq.q1": "1. Как долго длятся туры?",
    "home.faq.a1": "Наши туры длятся от 2 до 6 часов. У каждого тура следующая продолжительность: - Прогулка на яхте: 2–3 часа - Тур на квадроцикле: 3–4 часа - VIP-пляж: полный день",
    "home.faq.q2": "2. Сколько человек может присоединиться к каждому туру?",
    "home.faq.a2": "Максимальное количество участников на тур следующее: - Прогулка на яхте: 8 человек - Тур на квадроцикле: 4 человека - VIP-пляж: не ограничено",
    "home.faq.q3": "3. Что требуется для туров?",
    "home.faq.a3": "Требования к каждому туру: - Прогулка на яхте: дополнительные требования - Тур на квадроцикле: транспортное средство и средства безопасности предоставляются - VIP-пляж: дополнительные требования",
    "home.faq.q4": "4. Каков минимальный возраст для туров?",
    "home.faq.a4": "Минимальный возраст для каждого тура: - Прогулка на яхте: 6 лет - Тур на квадроцикле: 18 лет - VIP-пляж: не ограничено",

    "lang.english": "Английский",
    "lang.hebrew": "Иврит",
    "lang.hindi": "Хинди",
    "lang.russian": "Русский",

    "payment.rules.title": "Правила и условия безопасности",
    "payment.rules.accepted": "Правила и условия приняты",
    "payment.rules.p1": "Платформа является посредническим сервисом. Участие в мероприятиях происходит на ваш страх и риск. Платформа не несет ответственности за ущерб, травмы или ухудшение здоровья.",
    "payment.rules.p2": "Пользователь обязан ознакомиться с правилами безопасности провайдера и убедиться, что его состояние здоровья соответствует активности.",
    "payment.rules.agreeContext": "Я прочитал(а) и согласен(на) с ",
    "payment.rules.agreeLink": "Правилами и Условиями",
    "payment.rules.warningCheck": "Обязательно! Пожалуйста, прочитайте и согласитесь с правилами и условиями перед покупкой билета!",
    "payment.rules.errorAccept": "Пожалуйста, прочтите и примите правила и условия перед оформлением заказа."
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("ff_language") : null;
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ff_language", language);
    }
    // Update document direction for RTL support
    if (typeof document !== "undefined") {
      const isRtl = language === "he";
      document.documentElement.lang = language;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => {
        const langTable = translations[language] || translations.en;
        let str = langTable[key] || translations.en[key] || key;
        if (vars && typeof str === "string") {
          Object.entries(vars).forEach(([k, v]) => {
            str = str.replace(new RegExp(`{${k}}`, "g"), String(v));
          });
        }
        return str;
      },
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export const supportedLanguages = SUPPORTED_LANGUAGES;

