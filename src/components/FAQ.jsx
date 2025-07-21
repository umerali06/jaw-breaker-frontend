import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How does Jawbreaker ensure HIPAA compliance?",
      answer:
        "Jawbreaker implements multiple layers of security including data encryption, secure authentication, access controls, and audit logging. Our platform is designed with HIPAA compliance in mind, ensuring that all patient data is protected according to industry standards.",
    },
    {
      question: "What file formats does Jawbreaker support?",
      answer:
        "Jawbreaker currently supports PDF, DOCX, DOC, and TXT file formats for document upload and analysis. We're continuously working to expand our supported file types to accommodate various clinical documentation formats.",
    },
    {
      question: "How accurate is the AI in generating OASIS scores?",
      answer:
        "Our AI has been trained on thousands of clinical documents and OASIS assessments. While the AI provides highly accurate suggestions based on the uploaded documentation, we always recommend that healthcare professionals review and verify all AI-generated scores before finalizing documentation.",
    },
    {
      question: "Can I integrate Jawbreaker with my existing EHR system?",
      answer:
        "Yes, Jawbreaker offers API integration capabilities that allow for seamless connection with many popular EHR systems. Please contact our support team for specific integration details for your EHR system.",
    },
    {
      question: "How long does it take to process a document?",
      answer:
        "Most documents are processed within seconds to minutes, depending on the document size and complexity. Our AI quickly analyzes the content and generates structured clinical documentation, saving you valuable time.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about Jawbreaker's AI-powered
            clinical documentation platform.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className={`w-full text-left p-5 flex justify-between items-center transition-colors ${
                  openIndex === index
                    ? "bg-primary-custom text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-96 p-5 bg-white border-t border-gray-200"
                    : "max-h-0"
                }`}
              >
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
