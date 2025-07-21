import { Link } from "react-router-dom";

const SimpleApp = () => {
  const steps = [
    {
      title: "2 taps to start",
      description: "Using Jawbreaker is as easy as making a phone call",
    },
    {
      title: "Speak naturally",
      description: "Conduct the visit exactly as you normally would",
    },
    {
      title: "Review in your EHR",
      description: "Jawbreaker generates an OASIS directly in your EHR.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center">
            The simplest app for clinicians.
          </h2>

          {/* YouTube Video Embed */}
          <div className="aspect-w-16 aspect-h-9 mb-16">
            <iframe
              src="https://www.youtube.com/embed/ONUCZIEv4ek"
              title="Jawbreaker Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl shadow-lg"
            ></iframe>
          </div>

          <div className="flex justify-center mb-16">
            <Link
              to="/demo"
              className="inline-block px-8 py-4 text-lg font-medium rounded-full bg-primary-custom text-white hover:bg-opacity-90 transition-all duration-300 shadow-md"
            >
              See our demo
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleApp;
