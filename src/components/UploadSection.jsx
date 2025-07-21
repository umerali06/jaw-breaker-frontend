import FileUpload from "./FileUpload";

const UploadSection = () => {
  return (
    <section
      id="upload"
      className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Upload Patient Document
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your patient document and let our AI analyze it to generate
            structured clinical documentation.
          </p>
        </div>

        <FileUpload />

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Your documents are securely processed and stored in compliance with
            HIPAA guidelines.
          </p>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
