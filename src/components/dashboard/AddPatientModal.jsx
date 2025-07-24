import { useState } from "react";
import { usePatientData } from "../../contexts/PatientDataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";

const AddPatientModal = ({ onClose, onSuccess }) => {
  const { addPatient, loading } = usePatientData();
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();

  // Branding colors
  const primaryBlue = "#2596be";

  // Dynamic styles
  const modalStyles = {
    backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
    borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
  };

  const textStyles = {
    color: isDarkMode ? "#e2e8f0" : "#4a5568",
  };

  const secondaryTextStyles = {
    color: isDarkMode ? "#a0aec0" : "#718096",
  };

  const inputStyles = {
    backgroundColor: isDarkMode ? "#4a5568" : "#ffffff",
    borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
    color: isDarkMode ? "#e2e8f0" : "#4a5568",
  };

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    condition: "stable",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!patientInfo.name.trim()) {
      showToast("error", "Patient name is required.");
      return;
    }
    if (
      !patientInfo.age ||
      isNaN(Number(patientInfo.age)) ||
      Number(patientInfo.age) <= 0
    ) {
      showToast("error", "Valid age is required.");
      return;
    }
    if (!patientInfo.gender) {
      showToast("error", "Gender is required.");
      return;
    }
    if (!patientInfo.phone.trim()) {
      showToast("error", "Phone is required.");
      return;
    }
    try {
      const result = await addPatient(patientInfo);
      if (result) {
        showToast("success", "Patient added successfully!");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        showToast("error", "Failed to add patient. Please try again.");
      }
    } catch (error) {
      showToast(
        "error",
        error.message || "Failed to add patient. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm font-sans p-3 sm:p-4">
      <div
        className="rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={modalStyles}
      >
        {/* Header */}
        <div
          className="p-3 sm:p-4 md:p-6 border-b flex items-center justify-between"
          style={{ borderColor: isDarkMode ? "#4a5568" : "#e2e8f0" }}
        >
          <h2
            className="text-lg sm:text-xl md:text-2xl font-bold"
            style={{ color: primaryBlue }}
          >
            Add New Patient
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:opacity-80 transition-opacity`}
            style={{ color: isDarkMode ? "#a0aec0" : "#718096" }}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Patient Name */}
              <div>
                <label
                  className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                  style={secondaryTextStyles}
                >
                  Patient Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={patientInfo.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 font-medium text-xs sm:text-sm"
                  style={{
                    ...inputStyles,
                    focusRingColor: primaryBlue,
                  }}
                  placeholder="Enter patient name"
                />
              </div>

              {/* Age */}
              <div>
                <label
                  className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                  style={secondaryTextStyles}
                >
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={patientInfo.age}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 font-medium text-xs sm:text-sm"
                  style={{
                    ...inputStyles,
                    focusRingColor: primaryBlue,
                  }}
                  placeholder="Enter age"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                  style={secondaryTextStyles}
                >
                  Gender
                </label>
                <select
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 font-medium text-xs sm:text-sm"
                  style={{
                    ...inputStyles,
                    focusRingColor: primaryBlue,
                  }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label
                  className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                  style={secondaryTextStyles}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={patientInfo.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 font-medium text-xs sm:text-sm"
                  style={{
                    ...inputStyles,
                    focusRingColor: primaryBlue,
                  }}
                  placeholder="Enter phone number"
                />
              </div>



              {/* Condition */}
              <div>
                <label
                  className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                  style={secondaryTextStyles}
                >
                  Condition
                </label>
                <select
                  name="condition"
                  value={patientInfo.condition}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 font-medium text-xs sm:text-sm"
                  style={{
                    ...inputStyles,
                    focusRingColor: primaryBlue,
                  }}
                >
                  <option value="stable">Stable</option>
                  <option value="improving">Improving</option>
                  <option value="critical">Critical</option>
                  <option value="chronic">Chronic</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-3 sm:mt-4 md:mt-6">
              <label
                className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                style={secondaryTextStyles}
              >
                Medical Notes
              </label>
              <textarea
                name="notes"
                value={patientInfo.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 font-medium text-xs sm:text-sm"
                style={{
                  ...inputStyles,
                  focusRingColor: primaryBlue,
                }}
                placeholder="Enter any medical notes, allergies, or special conditions"
              ></textarea>
            </div>

            {/* Privacy Notice */}
            <div
              className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 rounded-lg border flex items-start"
              style={{
                backgroundColor: isDarkMode
                  ? `${primaryBlue}20`
                  : `${primaryBlue}10`,
                borderColor: isDarkMode
                  ? `${primaryBlue}30`
                  : `${primaryBlue}20`,
              }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke={primaryBlue}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div>
                <h5
                  className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1"
                  style={{ color: primaryBlue }}
                >
                  HIPAA Compliance Notice
                </h5>
                <p
                  className="text-[10px] sm:text-xs font-medium"
                  style={secondaryTextStyles}
                >
                  All patient information is encrypted and stored securely in
                  compliance with HIPAA regulations. Ensure you have proper
                  consent before entering protected health information.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="p-3 sm:p-4 md:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3"
            style={{ borderColor: isDarkMode ? "#4a5568" : "#e2e8f0" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border font-medium text-xs sm:text-sm hover:opacity-80 transition-opacity w-full sm:w-auto"
              style={{
                backgroundColor: isDarkMode ? "#4a5568" : "#f8fafc",
                borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
                color: textStyles.color,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !patientInfo.name}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              style={{ backgroundColor: primaryBlue }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                "Add Patient"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
