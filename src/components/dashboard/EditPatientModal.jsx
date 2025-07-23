import { useState, useEffect } from "react";
import { usePatientData } from "../../contexts/PatientDataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";

const EditPatientModal = ({ patient, onClose, onSuccess }) => {
  const { editPatient, deletePatient, loading } = usePatientData();
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();

  // Branding colors
  const primaryBlue = "#2596be";
  const accentGreen = "#96be25";

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
    email: "",
    condition: "stable",
    notes: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form with patient data
  useEffect(() => {
    if (patient) {
      setPatientInfo({
        name: patient.name || "",
        age: patient.age || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        condition: patient.condition || "stable",
        notes: patient.notes || "",
      });
    }
  }, [patient]);

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
    if (
      !patientInfo.email.trim() ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(patientInfo.email)
    ) {
      showToast("error", "Valid email is required.");
      return;
    }

    try {
      const result = await editPatient(patient._id, patientInfo);
      if (result) {
        showToast("success", "Patient updated successfully!");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        showToast("error", "Failed to update patient. Please try again.");
      }
    } catch (error) {
      showToast(
        "error",
        error.message || "Failed to update patient. Please try again."
      );
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deletePatient(patient._id);
      if (result) {
        showToast("success", "Patient deleted successfully!");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        showToast("error", "Failed to delete patient. Please try again.");
      }
    } catch (error) {
      showToast(
        "error",
        error.message || "Failed to delete patient. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm font-sans">
      <div
        className="rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={modalStyles}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: isDarkMode ? "#4a5568" : "#e2e8f0" }}
        >
          <h2 className="text-2xl font-bold" style={{ color: primaryBlue }}>
            Edit Patient
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:opacity-80 transition-opacity`}
            style={{ color: isDarkMode ? "#a0aec0" : "#718096" }}
          >
            <svg
              className="w-6 h-6"
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
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Name */}
              <div>
                <label
                  className="block text-sm font-bold mb-2"
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
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
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
                  className="block text-sm font-bold mb-2"
                  style={secondaryTextStyles}
                >
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={patientInfo.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
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
                  className="block text-sm font-bold mb-2"
                  style={secondaryTextStyles}
                >
                  Gender
                </label>
                <select
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
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
                  className="block text-sm font-bold mb-2"
                  style={secondaryTextStyles}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={patientInfo.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
                  style={{
                    ...inputStyles,
                    focusRingColor: primaryBlue,
                  }}
                  placeholder="Enter phone number"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  style={secondaryTextStyles}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={patientInfo.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
                  style={{
                    ...inputStyles,
                    focusRingColor: primaryBlue,
                  }}
                  placeholder="Enter email address"
                />
              </div>

              {/* Condition */}
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  style={secondaryTextStyles}
                >
                  Condition
                </label>
                <select
                  name="condition"
                  value={patientInfo.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
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
            <div className="mt-6">
              <label
                className="block text-sm font-bold mb-2"
                style={secondaryTextStyles}
              >
                Medical Notes
              </label>
              <textarea
                name="notes"
                value={patientInfo.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
                style={{
                  ...inputStyles,
                  focusRingColor: primaryBlue,
                }}
                placeholder="Enter any medical notes, allergies, or special conditions"
              ></textarea>
            </div>

            {/* Privacy Notice */}
            <div
              className="mt-6 p-4 rounded-lg border flex items-start"
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
                className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
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
                  className="text-sm font-bold mb-1"
                  style={{ color: primaryBlue }}
                >
                  HIPAA Compliance Notice
                </h5>
                <p className="text-xs font-bold" style={secondaryTextStyles}>
                  All patient information is encrypted and stored securely in
                  compliance with HIPAA regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="p-6 border-t flex justify-between"
            style={{ borderColor: isDarkMode ? "#4a5568" : "#e2e8f0" }}
          >
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2.5 rounded-lg border font-bold text-red-600 border-red-300 hover:bg-red-50 transition-colors"
            >
              Delete Patient
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border font-bold hover:opacity-80 transition-opacity"
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
                className="px-6 py-2.5 rounded-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryBlue }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Updating...
                  </span>
                ) : (
                  "Update Patient"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 backdrop-blur-sm">
          <div
            className="rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
            style={modalStyles}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete Patient
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete {patient?.name}? This action
                cannot be undone and will remove all associated data.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPatientModal;
