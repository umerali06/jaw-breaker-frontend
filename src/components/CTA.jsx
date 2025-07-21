const CTA = () => {
  return (
    <section
      id="contact"
      className="py-20 bg-primary-custom relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-secondary-custom/10 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your clinical documentation?
          </h2>
          <p className="text-xl mb-10 text-white/90">
            Join thousands of healthcare professionals who are saving time and
            improving quality with Jawbreaker.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn-custom btn-white-custom">
              Request a Demo
            </button>
            <button
              className="btn-custom btn-secondary-custom"
              onClick={() =>
                document
                  .getElementById("upload")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Try Jawbreaker Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
