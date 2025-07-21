const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Upload",
      description:
        "Upload patient documents (PDF, DOCX, TXT) securely to our HIPAA-compliant platform.",
    },
    {
      number: "02",
      title: "Analyze",
      description:
        "Our AI analyzes the document, extracting key clinical information and identifying patterns.",
    },
    {
      number: "03",
      title: "Summarize",
      description:
        "Get structured summaries, SOAP notes, OASIS scores, and care recommendations.",
    },
    {
      number: "04",
      title: "Use & Export",
      description:
        "Use the insights in your workflow or export formatted documentation for your records.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Jawbreaker streamlines your clinical documentation workflow in four
            simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-8 rounded-lg border border-gray-200 h-full hover:border-primary-custom hover:shadow-md transition-all duration-300">
                <div className="text-4xl font-bold text-primary-custom mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg
                    className="w-8 h-8 text-primary-custom"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
