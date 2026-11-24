'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Job } from '@/types';

export type Language = 'en' | 'hi';

export interface CategoryInfo {
  id: string;
  en: string;
  hi: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'painting', en: 'Painting', hi: 'पेंटिंग / रंगाई', icon: '🎨' },
  { id: 'plumbing', en: 'Plumbing', hi: 'प्लंबर / नलसाज', icon: '🔧' },
  { id: 'electrical', en: 'Electrical', hi: 'इलेक्ट्रीशियन / बिजली', icon: '⚡' },
  { id: 'carpentry', en: 'Carpentry', hi: 'बढ़ई / लकड़ी का काम', icon: '🪚' },
  { id: 'gardening', en: 'Gardening', hi: 'माली / बागवानी', icon: '🌱' },
  { id: 'driving', en: 'Driving', hi: 'ड्राइवर / चालक', icon: '🚗' },
  { id: 'cooking', en: 'Cooking', hi: 'रसोइया / खाना बनाना', icon: '👨‍🍳' },
  { id: 'security', en: 'Security', hi: 'सुरक्षा गार्ड / चौकीदार', icon: '👮' },
  { id: 'cleaning', en: 'Cleaning', hi: 'सफाई कर्मचारी', icon: '🧹' },
  { id: 'construction', en: 'Construction', hi: 'निर्माण / मजदूरी', icon: '🏗️' },
];

export const TRANSLATIONS = {
  en: {
    // Brand & Header
    brandName: 'Sahayak',
    tagline: 'Local Job Match for India',
    toggleToLang: 'हिंदी',
    postJob: '+ Post Job',
    myProfile: 'Profile & Portal',

    // Home
    heroTitle: 'Find Nearby Work & Local Opportunities',
    heroSubtitle: 'Accessible, AI-powered hyper-local job matching for informal & semi-skilled workers across Delhi NCR 🇮🇳',
    searchPlaceholder: 'Search jobs (e.g., painting, plumber, electrician, driver...)',
    searchButton: 'Search',
    voiceSearchIdle: '🎙 Search by voice (Hindi)',
    voiceSearchActive: '🎙 Listening... speak now',
    voiceSearchError: 'Voice search could not hear that. Please try again or type.',
    voiceUnsupported: 'Voice search is not supported in this browser. Try Chrome.',
    allCategories: 'All Skill Categories',
    locationFilterPlaceholder: 'Filter by locality (e.g., Lajpat Nagar, Rohini, Okhla)',
    clearFilters: 'Clear filters',
    jobsFound: 'jobs available',
    allJobsHeading: 'Available Local Jobs',
    searchResultsHeading: 'Search Results for',
    noJobsFound: 'No jobs found',
    noJobsFoundDesc: 'Try a different skill keyword, switch category, or clear your location filter.',
    feature1Title: 'Hyper-Local Matching',
    feature1Desc: 'Find genuine work within walking or short transit distance in Delhi NCR.',
    feature2Title: 'Bilingual & Voice Ready',
    feature2Desc: 'Search in Hindi or English using text or natural voice speech recognition.',
    feature3Title: 'Direct Employer Contact',
    feature3Desc: 'Call employers directly on their phone with zero middleman commissions.',

    // Job Card
    employer: 'Employer',
    location: 'Location',
    pay: 'Pay',
    viewDetails: 'View Details',
    call: 'Call',

    // Job Detail
    backToJobs: '← Back to all jobs',
    jobDescription: 'Job Description & Work Details',
    contactEmployer: 'Contact Employer',
    contact: 'Contact Phone Number',
    callNow: '📞 Call Employer Directly',
    callNotice: 'Direct phone call. No intermediary fees or deductions.',
    markContacted: '✓ Save to Contacted Jobs',
    markedContacted: '✓ Saved in Your Profile',
    locationOnMap: 'Location on Map',
    editJobListing: '✏️ Edit Listing (Owner)',

    // Create Job
    createJobTitle: 'Post a New Job Opportunity',
    createJobSubtitle: 'Reach trustworthy local informal and semi-skilled workers immediately',
    jobTitleEn: 'Job Title (English)*',
    jobTitleEnPlaceholder: 'e.g., House Painting Specialist',
    jobTitleHi: 'Job Title in Hindi (Optional)',
    jobTitleHiPlaceholder: 'उदा. घर की पुताई कारीगर',
    categoryLabel: 'Skill Category*',
    selectCategoryPlaceholder: '-- Select a skill category --',
    employerNameEn: 'Employer / Business Name*',
    employerNameEnPlaceholder: 'e.g., Ramesh Sharma or Sharma Electricals',
    employerNameHi: 'Employer Name in Hindi (Optional)',
    employerNameHiPlaceholder: 'उदा. रमेश शर्मा',
    locationEn: 'Locality & City*',
    locationEnPlaceholder: 'e.g., Lajpat Nagar, New Delhi',
    locationHi: 'Locality in Hindi (Optional)',
    locationHiPlaceholder: 'उदा. लाजपत नगर, नई दिल्ली',
    salaryEn: 'Pay / Daily Wage*',
    salaryEnPlaceholder: 'e.g., ₹600/day or ₹18,000/month',
    salaryHi: 'Pay in Hindi (Optional)',
    salaryHiPlaceholder: 'उदा. ₹600/प्रतिदिन',
    phoneLabel: 'Contact Phone Number*',
    phonePlaceholder: 'e.g., +91 98765 43210',
    pinLabel: 'Employer 4-Digit Security PIN*',
    pinHint: 'Choose a PIN (e.g., 1234) so only you can edit or delete this listing later.',
    descriptionEn: 'Job Details & Requirements*',
    descriptionEnPlaceholder: 'Explain the work, timings, tools required, and any experience needed...',
    descriptionHi: 'Job Details in Hindi (Optional)',
    descriptionHiPlaceholder: 'काम का समय, औजार और आवश्यक अनुभव का विवरण लिखें...',
    submitJobButton: 'Publish Job Listing',
    publishingJob: 'Publishing listing...',
    jobCreatedSuccess: 'Job posted successfully! Redirecting...',

    // Edit Job
    editJobTitle: 'Edit Job Listing',
    editJobSubtitle: 'Update requirements, location, pay, or details',
    verifyPinLabel: 'Employer PIN for Authorization*',
    verifyPinPlaceholder: 'Enter your 4-digit PIN (default demo PIN: 1234)',
    saveChangesButton: 'Save Changes',
    savingChanges: 'Saving changes...',
    changesSavedSuccess: 'Changes saved successfully! Redirecting...',

    // Profile & Portal
    portalTitle: 'Sahayak User Portal',
    portalSubtitle: 'Track your job inquiries as a worker or manage listings as an employer',
    workerTab: '👷 Worker: My Inquiries',
    employerTab: '🏢 Employer: Manage Listings',
    workerSectionTitle: 'Jobs You Have Contacted / Applied For',
    workerSectionSubtitle: 'Quick history of employers you called through Sahayak',
    noInquiriesTitle: 'No Contacted Jobs Yet',
    noInquiriesDesc: 'When you tap "Call Employer" on any job listing, it will be automatically saved here for your records.',
    browseJobsCta: 'Browse Jobs Now',
    calledOn: 'Called on',
    employerSectionTitle: 'Employer Job Management',
    employerSectionSubtitle: 'Sign in with your name and PIN to securely view, edit, or remove your listings',
    employerNameInput: 'Your Name or Business',
    employerPinInput: '4-Digit PIN (Demo default: 1234)',
    accessListingsBtn: 'Access My Listings',
    authenticating: 'Verifying...',
    authenticatedBadge: 'Verified Employer',
    signOutEmployer: 'Sign out',
    postedJobsHeading: 'Listings posted by',
    noEmployerJobs: 'No listings found under this name.',
    createJobPrompt: 'Ready to hire? Post your first job listing.',
    deleteBtn: '🗑 Delete',
    editBtn: '✏️ Edit',
    deleteConfirm: 'Are you sure you want to delete this listing? This action cannot be undone.',

    // Common
    loading: 'Loading...',
    errorTitle: 'Notice',
    backHome: '← Back to Home',
  },
  hi: {
    // Brand & Header
    brandName: 'सहायक',
    tagline: 'भारत के लिए स्थानीय रोज़गार',
    toggleToLang: 'English',
    postJob: '+ नौकरी पोस्ट करें',
    myProfile: 'प्रोफ़ाइल व पोर्टल',

    // Home
    heroTitle: 'अपने नज़दीक काम और रोज़गार खोजें',
    heroSubtitle: 'दिल्ली एनसीआर में असंगठित और अर्ध-कुशल कामगारों के लिए सरल, सीधा और स्थानीय रोज़गार मंच 🇮🇳',
    searchPlaceholder: 'काम खोजें (जैसे: पेंटर, प्लंबर, बिजली मिस्त्री, बढ़ई, ड्राइवर...)',
    searchButton: 'खोजें',
    voiceSearchIdle: '🎙 बोलकर खोजें (हिंदी)',
    voiceSearchActive: '🎙 सुन रहे हैं... अभी बोलें',
    voiceSearchError: 'आपकी आवाज़ स्पष्ट नहीं आई। कृपया दोबारा बोलें या लिखकर खोजें।',
    voiceUnsupported: 'इस ब्राउज़र में वॉइस सर्च उपलब्ध नहीं है। कृपया क्रोम इस्तेमाल करें।',
    allCategories: 'सभी काम श्रेणियां',
    locationFilterPlaceholder: 'इलाका चुनें (जैसे: लाजपत नगर, रोहिणी, ओखला)',
    clearFilters: 'फ़िल्टर हटाएं',
    jobsFound: 'नौकरियां उपलब्ध हैं',
    allJobsHeading: 'उपलब्ध स्थानीय नौकरियां',
    searchResultsHeading: 'इसके लिए परिणाम:',
    noJobsFound: 'कोई नौकरी नहीं मिली',
    noJobsFoundDesc: 'कृपया कोई अन्य काम खोजें, श्रेणी बदलें या इलाका फ़िल्टर हटाएं।',
    feature1Title: 'स्थानीय रोज़गार',
    feature1Desc: 'अपने घर या इलाके के नज़दीक सीधे काम देने वालों से जुड़ें।',
    feature2Title: 'द्विभाषी व वॉइस सर्च',
    feature2Desc: 'हिंदी या अंग्रेज़ी में आसानी से लिखकर या बोलकर खोजें।',
    feature3Title: 'सीधा फ़ोन संपर्क',
    feature3Desc: 'बिना किसी दलाल या बिचौलिये के सीधे मालिक से बात करें।',

    // Job Card
    employer: 'नियोक्ता / मालिक',
    location: 'स्थान',
    pay: 'वेतन / दिहाड़ी',
    viewDetails: 'विवरण देखें',
    call: 'कॉल करें',

    // Job Detail
    backToJobs: '← सभी नौकरियों पर वापस जाएं',
    jobDescription: 'काम का विवरण और शर्तें',
    contactEmployer: 'मालिक से संपर्क करें',
    contact: 'संपर्क फ़ोन नंबर',
    callNow: '📞 सीधे मालिक को कॉल करें',
    callNotice: 'सीधा फ़ोन कॉल। कोई बिचौलिया या कमीशन शुल्क नहीं।',
    markContacted: '✓ मैंने संपर्क किया (सहेजें)',
    markedContacted: '✓ सहेजा गया — आपकी प्रोफ़ाइल में मौजूद',
    locationOnMap: 'मानचित्र पर स्थान',
    editJobListing: '✏️ लिस्टिंग बदलें (मालिक हेतु)',

    // Create Job
    createJobTitle: 'नई नौकरी का विज्ञापन दें',
    createJobSubtitle: 'स्थानीय और भरोसेमंद कामगारों तक अपनी ज़रूरत तुरंत पहुंचाएं',
    jobTitleEn: 'काम का नाम (अंग्रेज़ी में)*',
    jobTitleEnPlaceholder: 'उदा. House Painting Specialist',
    jobTitleHi: 'काम का नाम (हिंदी में - वैकल्पिक)',
    jobTitleHiPlaceholder: 'उदा. घर की पुताई के लिए पेंटर',
    categoryLabel: 'काम की श्रेणी*',
    selectCategoryPlaceholder: '-- काम की श्रेणी चुनें --',
    employerNameEn: 'आपका नाम या व्यापार (अंग्रेज़ी)*',
    employerNameEnPlaceholder: 'उदा. Ramesh Sharma',
    employerNameHi: 'मालिक का नाम (हिंदी में - वैकल्पिक)',
    employerNameHiPlaceholder: 'उदा. रमेश शर्मा',
    locationEn: 'स्थान / इलाका (अंग्रेज़ी)*',
    locationEnPlaceholder: 'उदा. Lajpat Nagar, Delhi',
    locationHi: 'स्थान / इलाका (हिंदी में - वैकल्पिक)',
    locationHiPlaceholder: 'उदा. लाजपत नगर, नई दिल्ली',
    salaryEn: 'वेतन / दिहाड़ी (अंग्रेज़ी)*',
    salaryEnPlaceholder: 'उदा. ₹600/day या ₹18,000/month',
    salaryHi: 'वेतन / दिहाड़ी (हिंदी में - वैकल्पिक)',
    salaryHiPlaceholder: 'उदा. ₹600/प्रतिदिन',
    phoneLabel: 'संपर्क फ़ोन नंबर*',
    phonePlaceholder: 'उदा. +91 98765 43210',
    pinLabel: 'नियोक्ता 4-अंकीय सुरक्षा पिन*',
    pinHint: 'कोई भी 4 अंक (जैसे: 1234) चुनें ताकि केवल आप ही इस लिस्टिंग को बदल या हटा सकें।',
    descriptionEn: 'काम का विवरण व शर्तें (अंग्रेज़ी)*',
    descriptionEnPlaceholder: 'काम के घंटे, औजार और आवश्यक अनुभव का विवरण दें...',
    descriptionHi: 'काम का विवरण व शर्तें (हिंदी में - वैकल्पिक)',
    descriptionHiPlaceholder: 'काम का समय, औजार और आवश्यक अनुभव लिखें...',
    submitJobButton: 'नौकरी प्रकाशित करें',
    publishingJob: 'प्रकाशित हो रहा है...',
    jobCreatedSuccess: 'नौकरी सफलतापूर्वक पोस्ट हो गई! पेज लोड हो रहा है...',

    // Edit Job
    editJobTitle: 'नौकरी लिस्टिंग में बदलाव करें',
    editJobSubtitle: 'काम की शर्तें, स्थान या वेतन अपडेट करें',
    verifyPinLabel: 'नियोक्ता सुरक्षा पिन*',
    verifyPinPlaceholder: 'अपना 4-अंकीय पिन दर्ज करें (डेमो डिफॉल्ट: 1234)',
    saveChangesButton: 'बदलाव सहेजें',
    savingChanges: 'सहेजा जा रहा है...',
    changesSavedSuccess: 'बदलाव सफलतापूर्वक सहेजे गए! लोड हो रहा है...',

    // Profile & Portal
    portalTitle: 'सहायक यूज़र पोर्टल व प्रोफ़ाइल',
    portalSubtitle: 'कामगार के रूप में संपर्क की गई नौकरियां देखें या नियोक्ता के रूप में लिस्टिंग प्रबंधित करें',
    workerTab: '👷 कामगार: संपर्क की गई नौकरियां',
    employerTab: '🏢 नियोक्ता: मेरी लिस्टिंग',
    workerSectionTitle: 'जिन नौकरियों के लिए आपने कॉल किया',
    workerSectionSubtitle: 'सहायक के ज़रिये संपर्क किए गए नियोक्ताओं का सुरक्षित इतिहास',
    noInquiriesTitle: 'अभी तक कोई नौकरी संपर्क में नहीं',
    noInquiriesDesc: 'जब आप किसी भी नौकरी पर "मालिक को कॉल करें" दबाएंगे, वह यहाँ स्वतः सहेज ली जाएगी।',
    browseJobsCta: 'अभी काम खोजें',
    calledOn: 'कॉल किया गया:',
    employerSectionTitle: 'नियोक्ता लिस्टिंग प्रबंधन',
    employerSectionSubtitle: 'अपनी नौकरियों को सुरक्षित रूप से देखने, बदलने या हटाने के लिए नाम और पिन दर्ज करें',
    employerNameInput: 'आपका नाम या प्रतिष्ठान',
    employerPinInput: '4-अंकीय पिन (डेमो डिफॉल्ट: 1234)',
    accessListingsBtn: 'मेरी लिस्टिंग देखें',
    authenticating: 'सत्यापित हो रहा है...',
    authenticatedBadge: 'सत्यापित नियोक्ता',
    signOutEmployer: 'लॉग आउट',
    postedJobsHeading: 'नियोक्ता द्वारा पोस्ट की गई नौकरियां:',
    noEmployerJobs: 'इस नाम से कोई लिस्टिंग नहीं मिली।',
    createJobPrompt: 'नया कामगार चाहिए? अपनी पहली नौकरी पोस्ट करें।',
    deleteBtn: '🗑 हटाएं',
    editBtn: '✏️ बदलें',
    deleteConfirm: 'क्या आप वाकई इस नौकरी को हटाना चाहते हैं? यह वापस नहीं लाया जा सकता।',

    // Common
    loading: 'लोड हो रहा है...',
    errorTitle: 'सूचना',
    backHome: '← होम पर वापस जाएं',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  getLocalizedJobText: (
    job: Job,
    field: 'title' | 'employer' | 'location' | 'salary' | 'description'
  ) => string;
  getLocalizedCategory: (category: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'sahayak_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
      if (saved === 'en' || saved === 'hi') {
        setLanguageState(saved);
      }
    } catch {
      // localStorage unavailable or restricted
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // ignore storage failure
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  const getLocalizedJobText = (
    job: Job,
    field: 'title' | 'employer' | 'location' | 'salary' | 'description'
  ): string => {
    if (language === 'hi') {
      const hiVal = job[`${field}_hi` as keyof Job];
      if (typeof hiVal === 'string' && hiVal.trim()) {
        return hiVal.trim();
      }
    }
    const val = job[field];
    return typeof val === 'string' ? val : '';
  };

  const getLocalizedCategory = (category: string): string => {
    const norm = category.toLowerCase().trim();
    const found = CATEGORIES.find(c => c.id === norm || norm.includes(c.id));
    if (found) {
      return language === 'hi' ? found.hi : found.en;
    }
    return category;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getLocalizedJobText,
        getLocalizedCategory,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
