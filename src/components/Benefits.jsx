const Benefits = () => {
  const benefits = [
    {
      title: "Save 1 hour per SOC",
      description:
        "Accurately document the most complex patients in under 15 minutes",
    },
    {
      title: "OASIS submitted in 24 hours",
      description: "Accurate documentation done on time. No more backlog.",
    },
    {
      title: "Double productivity",
      description:
        "With documentation out of the way, clinicians request 2x as many SOCs.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            Independent agencies thrive with Jawbreaker.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-bold text-primary-custom mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
