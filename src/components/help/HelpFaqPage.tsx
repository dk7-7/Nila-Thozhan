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
  const { submitSupportTicket } = useApp();
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
      contactEmail: contactEmail || 'citizen@karnataka.gov.in',
    });
    setTicketSubmittedId(ticketId);
    setSubject('');
    setMessage('');
    setContactEmail('');
  };

  const faqs = [
    {
      q: 'How do I locate my land parcel on the official GIS map using my document?',
      a: 'Navigate to "File → GIS Location" (or click "Find My Land" on the Citizen dashboard). Scanned deeds or Patta certificates automatically extract the survey number and village name to highlight your exact parcel boundary on the interactive map.',
    },
    {
      q: 'What does "Under Verification" status mean?',
      a: 'This means your document has been read by the AI OCR engine and is currently undergoing two-step verification: first, a revenue digitization officer verifies the extracted text against historical physical archive volumes; second, the cadastral GIS engine validates the boundaries and road access.',
    },
    {
      q: 'What should I do if my document shows "Needs Attention"?',
      a: 'Click "View Details" on the document. A clear, plain-language notification box will explain the issue—such as faint handwriting or a survey boundary conflict. You can inspect the discrepancy or provide supporting survey documents if requested by the department.',
    },
    {
      q: 'How do I verify the authenticity of a digitally signed land record?',
      a: 'Every approved record is cryptographically stamped with a Class 3 Digital Signature and an official QR code. Anyone can scan the QR code or verify the SHA-256 hash against the State Land Cadastre verification portal to confirm the certified title.',
    },
    {
      q: 'How can I switch between Citizen, Officer, and High Authority modes in this portal?',
      a: 'Click the colored role badge at the top right of the navigation header (e.g., "Citizen", "Officer", or "Approver"). You can switch between all three personas at any time to test the complete end-to-end workflow and role-based permissions.',
    },
  ];

  return (
    <div id="help-faq-page" className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
          <HelpCircle className="w-4 h-4" />
          <span>User Assistance & Citizen Guides</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Help & Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Everything you need to know about digitized land records, cadastral maps, and digital certification.
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
