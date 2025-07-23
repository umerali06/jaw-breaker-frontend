const Integration = () => {
  const ehrLogos = [
    {
      name: "Homecare Homebase",
      logo: "https://via.placeholder.com/150x50?text=Homecare+Homebase",
    },
    { name: "Axxess", logo: "https://via.placeholder.com/150x50?text=Axxess" },
    {
      name: "MatrixCare",
      logo: "https://via.placeholder.com/150x50?text=MatrixCare",
    },
    {
      name: "Wellsky",
      logo: "https://via.placeholder.com/150x50?text=Wellsky",
    },
  ];

  return (
    <section
      className="py-14 sm:py-16 bg-blue-50"
      style={{ backgroundColor: "#f0f7ff" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 sm:mb-16 text-gray-900">
            Clinicians can use Jawbreaker with leading EHRs
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center px-4 sm:px-8">
            {ehrLogos.map((ehr, index) => (
              <div key={index} className="flex justify-center py-2">
                <img
                  src={ehr.logo}
                  alt={ehr.name}
                  className="h-10 sm:h-12 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
