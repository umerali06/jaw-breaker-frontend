import { Link } from "react-router-dom";
import image1 from "../assets/images/image1.png";
import image2 from "../assets/images/image2.png";
import image3 from "../assets/images/image3.png";

const Accuracy = () => {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center">
            Superhuman accuracy.
          </h2>

          <div className="flex justify-center mb-16 sm:mb-20">
            <Link
              to="/auth"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-full bg-primary-custom text-white hover:bg-opacity-90 transition-all duration-300 shadow-md"
            >
              Try Demo
            </Link>
          </div>

          {/* Capture every detail section - Image | Content */}
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-10 mb-20 sm:mb-32 px-2">
            <div className="w-full md:w-1/2 mb-6 md:mb-0">
              <img
                src={image1}
                alt="Capture every detail"
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=Capture+Every+Detail";
                }}
              />
            </div>
            <div className="w-full md:w-1/2 px-2 sm:px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-primary-custom">
                Capture every detail
              </h2>
              <p className="text-lg sm:text-xl font-normal text-gray-700">
                Jawbreaker is in the patient's home, and remembers 24% more data
                than a typical clinician.
              </p>
            </div>
          </div>

          {/* Document their entire history section - Content | Image */}
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-10 mb-20 sm:mb-32 px-2">
            <div className="w-full md:w-1/2 md:order-1 px-2 sm:px-4 mb-6 md:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-primary-custom">
                Document their entire history
              </h2>
              <p className="text-lg sm:text-xl font-normal text-gray-700">
                Using medical records, Jawbreaker is able to find 45% more
                conditions compared to a clinician.
              </p>
            </div>
            <div className="w-full md:w-1/2 md:order-2">
              <img
                src={image2}
                alt="Document history"
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=Document+History";
                }}
              />
            </div>
          </div>

          {/* Trained in OASIS section - Image | Content */}
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-10 px-2">
            <div className="w-full md:w-1/2 mb-6 md:mb-0">
              <img
                src={image3}
                alt="Trained in OASIS"
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=Trained+In+OASIS";
                }}
              />
            </div>
            <div className="w-full md:w-1/2 px-2 sm:px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-primary-custom">
                Trained in OASIS
              </h2>
              <p className="text-lg sm:text-xl font-normal text-gray-700">
                Jawbreaker understands that M1800's ask what is <em>safe</em>{" "}
                for the patient, <em>not</em> what they're doing today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Accuracy;
