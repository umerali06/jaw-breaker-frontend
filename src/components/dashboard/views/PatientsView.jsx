import { useState, useEffect } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../../config/api";

const PatientsView = ({ selectedPatient, onPatientSelect }) => {
  const { patients, loading, deleteFile, updatePatient } = usePatientData();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    id: "",
    status: "active",
  });
  // Removed unused forceUpdate

  const filteredAndSortedPatients = patients
    .filter((patient) => {
      const matchesSearch = patient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || patient.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "lastUpdated":
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case "documents":
          return b.files.length - a.files.length;
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return isDarkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return isDarkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-800";
    }
  };

  const handleEditPatient = (patient) => {
    setShowEditModal(false); // Force close first
    setTimeout(() => {
      setEditingPatient(patient);
      setEditForm({
        name: patient.name,
        id: patient.id,
        status: patient.status,
      });
      setShowEditModal(true); // Then open
    }, 0);
  };

  const handleCloseEditModal = () => {
    console.log("Closing modal");
    setShowEditModal(false);
    setEditingPatient(null);
    setEditForm({
      name: "",
      id: "",
      status: "active",
    });
  };

  // Cleanup modal state when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setShowEditModal(false);
      setEditingPatient(null);
    };
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log("Edit Modal State Changed:", {
      showEditModal,
      editingPatient: editingPatient?.name,
      selectedPatient: selectedPatient?.name,
    });
  }, [showEditModal, editingPatient, selectedPatient]);

  // Track showEditModal changes specifically
  useEffect(() => {
    console.log("showEditModal changed to:", showEditModal);
    if (showEditModal) {
      console.log("Modal should be visible now");
    } else {
      console.log("Modal should be hidden now");
    }
  }, [showEditModal]);

  const handleDownloadDocument = async (file) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/upload/download/${file._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.originalname;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    }
  };

  const handleViewDocument = async (file) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/upload/download/${file._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Open in new tab for viewing
        const newWindow = window.open(url, "_blank");
        if (!newWindow) {
          // If popup blocked, download instead
          const a = document.createElement("a");
          a.href = url;
          a.download = file.originalname;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          alert("Popup blocked. File downloaded instead.");
        }

        // Clean up the URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        alert("Failed to view file");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Error viewing file: " + error.message);
    }
  };

  const generateSOAPNote = async (patient) => {
    try {
      const token = localStorage.getItem("authToken");
      // Find the most recent file for this patient
      const recentFile = patient.files.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      if (!recentFile) {
        alert("No documents found for this patient");
        return;
      }

      const response = await fetch(
        `${API_ENDPOINTS.AI}/custom/${recentFile._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "soap",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("SOAP note response:", data);
        alert("SOAP note generated successfully!");
        // You might want to show the SOAP note in a modal or navigate to it
      } else {
        console.error(
          "SOAP note generation failed:",
          response.status,
          response.statusText
        );
        let errorMessage = "Unknown error";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        alert("Failed to generate SOAP note: " + errorMessage);
      }
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      alert("Error generating SOAP note: " + error.message);
    }
  };

  const PatientCard = ({ patient }) => (
    <div
      className={`${
        isDarkMode
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200"
      } rounded-lg border p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-1`}
          >
            {patient.name}
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            ID: {patient.id}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            patient.status
          )}`}
        >
          {patient.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Documents
          </p>
          <p
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {patient.files.length}
          </p>
        </div>
        <div>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Last Updated
          </p>
          <p
            className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {new Date(patient.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          } mb-2`}
        >
          Recent Documents
        </p>
        <div className="space-y-1">
          {patient.files.slice(0, 3).map((file, index) => (
            <div
              key={index}
              className={`flex items-center text-xs ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <svg
                className="w-3 h-3 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="truncate">{file.originalname}</span>
            </div>
          ))}
          {patient.files.length > 3 && (
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              +{patient.files.length - 3} more documents
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onPatientSelect && onPatientSelect(patient)}
          className="flex-1 bg-primary-custom text-white px-3 py-2 rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => generateSOAPNote(patient)}
          className={`px-3 py-2 border ${
            isDarkMode
              ? "border-gray-600 text-gray-300 hover:bg-gray-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          } rounded text-sm font-medium transition-colors`}
        >
          Generate SOAP
        </button>
      </div>
    </div>
  );

  if (selectedPatient) {
    return (
      <div className="p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                // Close any open modals first
                handleCloseEditModal();
                // Then navigate back
                onPatientSelect && onPatientSelect(null);
              }}
              className="flex items-center text-primary-custom hover:text-opacity-80 text-sm font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Patients
            </button>
          </div>

          {/* Patient Details Header */}
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg border p-6 mb-6`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedPatient.name}
                </h2>
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Patient ID: {selectedPatient.id}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    selectedPatient.status
                  )}`}
                >
                  {selectedPatient.status}
                </span>
                <button
                  onClick={() => handleEditPatient(selectedPatient)}
                  className="bg-primary-custom text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90"
                >
                  Edit Patient
                </button>
              </div>
            </div>

            {/* Patient Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedPatient.files.length}
                </p>
                <p className="text-sm text-blue-800">Total Documents</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {
                    selectedPatient.files.filter(
                      (f) => f.processingStatus === "completed"
                    ).length
                  }
                </p>
                <p className="text-sm text-green-800">Processed</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    selectedPatient.files.filter(
                      (f) => f.processingStatus === "pending"
                    ).length
                  }
                </p>
                <p className="text-sm text-yellow-800">Pending</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.floor(
                    (Date.now() - new Date(selectedPatient.lastUpdated)) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
                <p className="text-sm text-purple-800">Days Since Update</p>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg border p-6`}
          >
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              Patient Documents
            </h3>
            <div className="space-y-3">
              {selectedPatient.files.map((file) => (
                <div
                  key={file._id}
                  className={`flex items-center justify-between p-4 border ${
                    isDarkMode
                      ? "border-gray-600 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  } rounded-lg transition-colors`}
                >
                  <div className="flex items-center">
                    <svg
                      className={`w-6 h-6 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      } mr-3`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {file.originalname}
                      </p>
                      <p
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }
                      >
                        {file.size} bytes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadDocument(file)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleViewDocument(file)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          } mb-4`}
        >
          Patients
        </h1>
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients..."
              className={`${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-200"
              } pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-transparent`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className={`${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-200"
              } pl-4 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-transparent`}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className={`${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-200"
              } pl-4 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-transparent`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="lastUpdated">Sort by Last Updated</option>
              <option value="documents">Sort by Documents</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">Loading patients...</p>
          </div>
        ) : filteredAndSortedPatients.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">No patients found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAndSortedPatients.map((patient) => (
              <PatientCard key={patient._id} patient={patient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsView;
