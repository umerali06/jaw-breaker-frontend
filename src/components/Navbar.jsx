import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white py-4 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center mr-8">
            <Link to="/" className="flex items-center">
              <img
                src="/jawbreaker-black.png"
                alt="Jawbreaker Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="font-medium text-gray-700 hover:text-primary-custom transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="font-medium text-gray-700 hover:text-primary-custom transition-colors text-sm"
            >
              About Us
            </Link>
            <Link
              to="/careers"
              className="font-medium text-gray-700 hover:text-primary-custom transition-colors text-sm"
            >
              Careers
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
