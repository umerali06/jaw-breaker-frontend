import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-28 pb-16 sm:pt-32 md:pt-40 md:pb-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Chart an OASIS in{" "}
            <span className="text-primary-custom block mt-2">
              under 15 minutes
            </span>
          </h1>
          <h3 className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-normal px-4">
            Improve accuracy, boost productivity, and{" "}
            <strong>end clinician burnout</strong> with Jawbreaker.
          </h3>
          <Link
            to="/auth"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full bg-primary-custom text-white hover:bg-opacity-90 transition-all duration-300 shadow-md"
          >
            Try Demo
          </Link>
        </div>
      </div>

      {/* Trusted by section with custom color background */}
      <div
        className="mt-12 sm:mt-16 py-16 sm:py-20 bg-blue-50"
        style={{ backgroundColor: "#f0f7ff" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-16">
            <div className="flex items-center">
              <span className="text-base sm:text-lg font-medium text-gray-900">
                ✓ Trusted by{" "}
              </span>
              <span className="text-base sm:text-lg font-medium text-primary-custom ml-1">
                5 star agencies
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-base sm:text-lg font-medium text-gray-900">
                ✓ Accurate and{" "}
              </span>
              <span className="text-base sm:text-lg font-medium text-primary-custom ml-1">
                easy to use
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-base sm:text-lg font-medium text-gray-900">
                ✓ Enabling{" "}
              </span>
              <span className="text-base sm:text-lg font-medium text-primary-custom ml-1">
                better patient care
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
