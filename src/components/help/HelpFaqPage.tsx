import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

export const HelpFaqPage: React.FC = () => {
  const { submitSupportTicket, currentLanguage, t } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Ticket Form state
  const [category, setCategory] = useState('Cadastral Discrepancy');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [ticketSubmittedId, setTicketSubmittedId] = useState<string | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      alert('Please fill out the ticket subject and details.');
      return;
    }
    const ticketId = `TICKET-${Math.floor(10000 + Math.random() * 90000)}`;
    submitSupportTicket({
      category,
      subject,
      message,
      contactEmail: contactEmail || 'citizen@tn.gov.in',
    });
    setTicketSubmittedId(ticketId);
    setSubject('');
    setMessage('');
    setContactEmail('');
  };

  const getFaqs = () => {
    if (currentLanguage === 'ta') {
      return [
        {
          q: 'நில வரைபடத்தில் (GIS) எனது நில எல்லையை எவ்வாறு பார்ப்பது?',
          a: 'பயனர் தளத்தில் "வரைபடத்தில் நிலம் காண" என்பதை கிளிக் செய்யவும். உங்கள் ஆவணத்தில் உள்ள சர்வே எண் மற்றும் கிராமத்தின் அடிப்படையில் வரைபடத்தில் நில எல்லை துல்லியமாக காட்டப்படும்.',
        },
        {
          q: '"பரிசீலனையில் உள்ளது" (Under Review) என்பதன் பொருள் என்ன?',
          a: 'உங்கள் ஆவணம் AI OCR மூலம் படிக்கப்பட்டு, கிராம நிர்வாக அலுவலர் (VAO) மற்றும் GIS நில எல்லை சரிபார்ப்பில் உள்ளது என்பதை இது குறிக்கிறது.',
        },
        {
          q: '"சரிபார்க்க வேண்டும்" (Action Needed) என்றால் என்ன செய்ய வேண்டும்?',
          a: 'ஆவண விவரங்களை திறந்து பார்க்கவும். சர்வே எல்லை அல்லது கையெழுத்து தெளிவின்மை போன்ற காரணங்கள் குறிப்பிடப்பட்டிருக்கும்.',
        },
        {
          q: 'டிஜிட்டல் முத்திரையிடப்பட்ட நில ஆவணத்தின் நம்பகத்தன்மையை எவ்வாறு உறுதி செய்வது?',
          a: 'அங்கீகரிக்கப்பட்ட ஒவ்வொரு ஆவணத்திலும் அதிகாரப்பூர்வ QR குறியீடு மற்றும் SHA-256 கிரிப்டோகிராஃபிக் பாதுகாப்பு குறியீடு இருக்கும். இதை ஸ்கேன் செய்து சரிபார்க்கலாம்.',
        },
        {
          q: 'பொது மக்கள், அலுவலர் மற்றும் மேலதிகாரி முறைகளை எவ்வாறு மாற்றுவது?',
          a: 'மேல் வலது மூலையில் உள்ள பயனர் பொத்தானை (Citizen / Officer / Approver) கிளிக் செய்து எந்த நேரத்திலும் நிலையை மாற்றிக்கொள்ளலாம்.',
        },
      ];
    }
    if (currentLanguage === 'hi') {
      return [
        {
          q: 'दस्तावेज के माध्यम से सरकारी GIS नक्शे पर अपनी जमीन कैसे देखें?',
          a: 'नागरिक डैशबोर्ड पर "नक्शे पर जमीन खोजें" पर क्लिक करें। आपके पट्टे या विलेख से खसरा नंबर स्वतः पढ़कर नक्शे पर सीमाएं प्रदर्शित की जाएंगी।',
        },
        {
          q: '"समीक्षाधीन है" (Under Review) स्थिति का क्या अर्थ है?',
          a: 'इसका अर्थ है कि आपके दस्तावेज का AI OCR द्वारा अध्ययन कर लिया गया है और अब राजस्व अधिकारी एवं GIS नक्शे द्वारा सत्यापन चल रहा है।',
        },
        {
          q: 'यदि स्थिति "जांच आवश्यक" (Action Needed) दिखाए तो क्या करें?',
          a: 'दस्तावेज विवरण देखें। वहां सीमा विवाद या अस्पष्ट हस्तलेख के संबंध में स्पष्ट कारण दर्शाया जाएगा।',
        },
        {
          q: 'डिजिटल रूप से हस्ताक्षरित दस्तावेज की सत्यता कैसे जांचें?',
          a: 'प्रत्येक स्वीकृत दस्तावेज में आधिकारिक QR कोड और SHA-256 हैश सुरक्षित रहता है, जिसे स्कैन करके तुरंत सत्यापित किया जा सकता है।',
        },
        {
          q: 'नागरिक, अधिकारी और उच्चाधिकारी मोड के बीच कैसे स्विच करें?',
          a: 'नेविगेशन हेडर के शीर्ष दाईं ओर स्थित भूमिका बटन पर क्लिक करके किसी भी समय मोड बदला जा सकता है।',
        },
      ];
    }
    return [
      {
        q: 'How do I locate my land parcel on the official GIS map using my document?',
        a: 'Navigate to "Find Land on Map" (or click "Find My Land" on the Citizen dashboard). Scanned deeds or Patta certificates automatically extract the survey number and village name to highlight your exact parcel boundary on the interactive map.',
      },
      {
        q: 'What does "Under Review" status mean?',
        a: 'This means your document has been read by the AI OCR engine and is currently undergoing verification: first, a revenue digitization officer verifies the extracted text against historical records; second, the cadastral GIS engine validates the boundaries and road access.',
      },
      {
        q: 'What should I do if my document shows "Action Needed"?',
        a: 'Click "View Details" on the document. A notification will explain the issue—such as faint handwriting or a survey boundary conflict. You can inspect the discrepancy or provide supporting survey documents if requested.',
      },
      {
        q: 'How do I verify the authenticity of a digitally signed land record?',
        a: 'Every approved record is cryptographically stamped with a Class 3 Digital Signature and an official QR code. Anyone can scan the QR code or verify the SHA-256 hash against the State Land Cadastre portal.',
      },
      {
        q: 'How can I switch between Citizen, Officer, and High Authority modes in this portal?',
        a: 'Click the colored role badge at the top right of the navigation header. You can switch between all three personas at any time to test the complete workflow.',
      },
    ];
  };

  const faqs = getFaqs();

  return (
    <div id="help-faq-page" className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
          <HelpCircle className="w-4 h-4" />
          <span>{t('helpCenter', 'Help Center & Guidance')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          {t('frequentlyAskedQuestions', 'Frequently Asked Questions & User Guides')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('helpSubtitle', 'Find answers, understand the land digitization workflow, and learn how to use Nila Thozhan.')}
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200 shadow-xs">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 sm:p-5">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between text-left font-semibold text-slate-900 text-sm sm:text-base gap-3"
            >
              <span>{faq.q}</span>
              {openIndex === idx ? (
                <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>

            {openIndex === idx && (
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100 animate-in fade-in">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Support Ticket Submission Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <MessageSquare className="w-5 h-5 text-blue-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submit a Support & Query Ticket
            </h3>
            <p className="text-xs text-slate-500">
              Need assistance with survey boundaries, document verification, or portal access? Send a query directly to the district support desk.
            </p>
          </div>
        </div>

        {ticketSubmittedId && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-950 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Support Ticket Created Successfully!</span>
                <span>Reference ID: <strong className="font-mono text-emerald-800">{ticketSubmittedId}</strong>. A response will be dispatched shortly.</span>
              </div>
            </div>
            <button
              onClick={() => setTicketSubmittedId(null)}
              className="text-xs text-emerald-700 underline font-semibold hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cadastral Discrepancy">Cadastral Discrepancy / Survey Alignment</option>
                <option value="Digital Certificate Verification">Digital Certificate Verification</option>
                <option value="OCR Extraction Inquiry">OCR & Document Text Reading</option>
                <option value="General Portal Support">General Portal Access Support</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Email / Phone</label>
              <input
                type="text"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. citizen@karnataka.gov.in"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-sans outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ticket Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your question or issue..."
              className="w-full p-2.5 rounded-lg border border-slate-300 font-sans outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Describe your survey number, deed details, or question..."
              className="w-full p-2.5 rounded-lg border border-slate-300 font-sans outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
