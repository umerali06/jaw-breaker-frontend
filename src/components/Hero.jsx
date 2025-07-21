import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Chart an OASIS in{" "}
            <span className="text-primary-custom block">under 15 minutes</span>
          </h1>
          <h3 className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-normal">
            Improve accuracy, boost productivity, and{" "}
            <strong>end clinician burnout</strong> with Jawbreaker.
          </h3>
          <Link
            to="/auth"
            className="inline-block px-8 py-4 text-lg font-medium rounded-full bg-primary-custom text-white hover:bg-opacity-90 transition-all duration-300 shadow-md"
          >
            See our demo
          </Link>
        </div>
      </div>

      {/* Trusted by section with custom color background */}
      <div className="mt-16 py-20 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center">
              <span className="text-lg font-medium">✓ Trusted by </span>
              <span className="text-lg font-medium text-primary-custom ml-1">
                5 star agencies
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-medium">✓ Accurate and </span>
              <span className="text-lg font-medium text-primary-custom ml-1">
                easy to use
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-medium">✓ Enabling </span>
              <span className="text-lg font-medium text-primary-custom ml-1">
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
