import { Link } from "react-router-dom";
import Meta from "../components/Meta";

// Import investor and company logos
import combinatorLogo from "../assets/images/combinator.png";
import southParkLogo from "../assets/images/south-park.png";
import googleLogo from "../assets/images/google.png";
import appleLogo from "../assets/images/apple.png";
import verilyLogo from "../assets/images/verily.png";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "John Smith",
      title: "Cofounder and CEO",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      linkedin: "https://linkedin.com/in/johnsmith",
      bio: [
        "Prior to Jawbreaker, John spent 8 years at Google building productivity tools for public health workers. When the pandemic hit, his team stood up 400 Covid test sites in 16 states, powered by Google's software.",
        "Home healthcare is critical to our public health. Yet, clinician burnout is at an all time high. Jawbreaker is our way to restore joy and connection in home health.",
      ],
    },
    {
      name: "Sarah Johnson",
      title: "Cofounder and CTO",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      linkedin: "https://linkedin.com/in/sarahjohnson",
      bio: [
        "Sarah is a physicist-turned-AI-engineer. At Apple, she led the development of health AI on the Apple Watch, including the passive detection of atrial fibrillation.",
        "As a technical expert, Sarah looks for big problems that can be solved with the latest technology. In home health, we saw a huge opportunity to improve the lives of clinicians—and therefore patients.",
      ],
    },
  ];

  return (
    <>
      <Meta
        title="About Us - Jawbreaker"
        description="Learn about the Jawbreaker team and our mission to transform clinical documentation."
      />

      {/* Our Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-medium text-primary-custom mb-4">
              Our mission
            </h3>

            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Bringing joy back to home health
            </h2>

            <p className="text-xl text-gray-700 mb-4">
              Clinicians choose home health to connect with patients, not with
              their laptops. At Jawbreaker, we believe that excellent patient
              care and stellar quality ratings{" "}
              <strong>begin with happy clinicians</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            Meet the team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-gray-600">{member.title}</p>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-custom"
                    >
                      <svg
                        className="w-5 h-5 inline-block"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  {member.bio.map((paragraph, i) => (
                    <p key={i} className="text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors and Prior Work Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <span className="text-gray-700 font-medium mr-4">
                Our investors
              </span>
              <div className="flex items-center gap-6">
                <img src={combinatorLogo} alt="Y Combinator" className="h-8" />
                <img
                  src={southParkLogo}
                  alt="South Park Commons"
                  className="h-8"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-gray-700 font-medium mr-4">
                Prior work at
              </span>
              <div className="flex items-center gap-6">
                <img src={googleLogo} alt="Google" className="h-8" />
                <img src={appleLogo} alt="Apple" className="h-8" />
                <img src={verilyLogo} alt="Verily" className="h-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future of Home Health Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-10">
              The future of home health is here.
            </h2>

            <Link
              to="/demo"
              className="inline-block px-8 py-4 text-lg font-medium rounded-full bg-primary-custom text-white hover:bg-opacity-90 transition-all duration-300 shadow-md"
            >
              See our demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
