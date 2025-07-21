import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 bg-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <p className="text-gray-600 text-sm">
                © Jawbreaker AI, Inc. {new Date().getFullYear()}
              </p>
              <div className="mt-4 space-y-1 text-gray-600 text-sm">
                <p>380 Alabama St</p>
                <p>San Francisco, CA 94110</p>
                <p>(415) 213-2803</p>
                <p>hello@jawbreaker.ai</p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Link
                to="/privacy"
                className="text-primary-custom hover:text-primary-custom/80 text-sm"
              >
                Privacy policy
              </Link>
              <Link
                to="/support"
                className="text-primary-custom hover:text-primary-custom/80 text-sm"
              >
                Support page
              </Link>
              <Link
                to="/data"
                className="text-primary-custom hover:text-primary-custom/80 text-sm"
              >
                Data rights
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
