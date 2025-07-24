import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10">
            The future of home health is here.
          </h2>

          <Link
            to="/auth"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full bg-primary-custom text-white hover:bg-opacity-90 transition-all duration-300 shadow-md"
          >
            Try Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
