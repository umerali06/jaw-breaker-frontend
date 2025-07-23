import { useState, useEffect } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../../config/api";
import EditPatientModal from "../EditPatientModal";
import jsPDF from "jspdf";

const PatientsView = ({
  selectedPatient,
  onPatientSelect,
  viewMode: propViewMode,
}) => {
  const { patients, loading, error } = usePatientData();
  const { isDarkMode } = useTheme();

  // Debug logging
  console.log("PatientsView - patients:", patients);
  console.log("PatientsView - loading:", loading);
  console.log("PatientsView - error:", error);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterStatus, setFilterStatus] = useState("all");
  const [localViewMode, setLocalViewMode] = useState("grid");
  const viewMode = propViewMode || localViewMode;
  const [showEditModal, setShowEditModal] = useState(false);

  // SOAP modal state and logic
  const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);
  const [soapNote, setSoapNote] = useState(null);
  const [isSoapLoading, setIsSoapLoading] = useState(false);
  const [soapPatient, setSoapPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    id: "",
    status: "active",
  });

  const generateSOAPNote = (patient) => {
    alert(`Generate SOAP for ${patient.name}`);
  };

  const handleViewDocument = (file) => {
    alert(`View document: ${file.originalname}`);
  };

  const handleGenerateSOAPClick = async (patient) => {
    setSoapPatient(patient);
    setIsSoapModalOpen(true);
    setSoapNote(null);
    setIsSoapLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const file = (patient.files || [])[0];
      if (!file) {
        setSoapNote("No documents available for SOAP note generation.");
        setIsSoapLoading(false);
        return;
      }
      const response = await fetch(`/api/ai/custom/${file._id || file.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "soap" }),
      });
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setSoapNote("Error: Invalid response from server (not JSON)");
        setIsSoapLoading(false);
        return;
      }
      if (data.success && data.result) {
        const note =
          typeof data.result === "object"
            ? [
                `SUBJECTIVE:\n${data.result.subjective}`,
                `\n\nOBJECTIVE:\n${data.result.objective}`,
                `\n\nASSESSMENT:\n${data.result.assessment}`,
                `\n\nPLAN:\n${data.result.plan}`,
              ].join("")
            : data.result;
        setSoapNote(note);
      } else {
        setSoapNote("Failed to generate SOAP note.");
      }
    } catch (error) {
      setSoapNote("Error generating SOAP note.");
    } finally {
      setIsSoapLoading(false);
    }
  };

  const downloadSoapAsPDF = () => {
    if (!soapNote) return;
    const doc = new jsPDF();
    doc.text(soapNote, 10, 10);
    doc.save(`${soapPatient?.name || "patient"}-SOAP-note.pdf`);
  };

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
        return "bg-[#96be25] text-white";
      case "inactive":
        return isDarkMode
          ? "bg-gray-600 text-white"
          : "bg-gray-200 text-gray-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return isDarkMode
          ? "bg-gray-600 text-white"
          : "bg-gray-200 text-gray-800";
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPatient(null);
    setEditForm({
      name: "",
      id: "",
      status: "active",
    });
  };

  useEffect(() => {
    return () => {
      setShowEditModal(false);
      setEditingPatient(null);
    };
  }, []);

  const PatientCard = ({ patient }) => {
    const initial = patient.name ? patient.name.charAt(0).toUpperCase() : "?";
    return (
      <div
        className={`min-h-[320px] w-full max-w-sm rounded-2xl shadow-lg border border-[#e2e8f0] bg-white dark:bg-[#232b36] flex flex-col gap-3 p-4 sm:p-6 transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-[#2596be] duration-200 ease-in-out overflow-hidden`}
      >
        {/* Avatar and Status */}
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-md border-4 border-white dark:border-[#232b36]"
              style={{ background: "#2596be" }}
            >
              {initial}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-0.5 truncate text-gray-900 dark:text-white">
                {patient.name}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-300 break-all truncate">
                ID: {patient.id}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-400 text-white shadow min-w-[60px] text-center">
            {(patient.status || "").charAt(0).toUpperCase() +
              (patient.status || "").slice(1)}
          </span>
        </div>

        {/* Info Section */}
        <div className="flex justify-between items-center gap-4 border-b border-[#e2e8f0] pb-3">
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-gray-500">Documents</p>
            <p className="text-lg font-bold text-[#2596be]">
              {(patient.files || []).length}
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-gray-500">Last Updated</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {new Date(patient.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="mt-2">
          <p className="text-xs font-bold text-gray-500 mb-2">
            Recent Documents
          </p>
          <div className="space-y-2">
            {(patient.files || []).slice(0, 3).map((file) => (
              <div
                key={file._id || file.id || file.originalname}
                className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                <div className="p-1.5 mr-2 bg-[#2596be] rounded-lg">
                  <svg
                    className="w-3 h-3 text-white"
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
                </div>
                <span className="truncate">{file.originalname}</span>
              </div>
            ))}
            {(patient.files || []).length > 3 && (
              <p
                key="more-files"
                className="text-xs font-medium text-gray-400 dark:text-gray-400"
              >
                +{(patient.files || []).length - 3} more
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto pt-4">
          <button
            onClick={() => onPatientSelect && onPatientSelect(patient)}
            className="w-full sm:w-auto bg-[#2596be] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#1d7a9c] focus:outline-none focus:ring-2 focus:ring-[#2596be] transition-all shadow-md"
          >
            View Details
          </button>
          <button
            onClick={() => handleGenerateSOAPClick(patient)}
            className="w-full sm:w-auto border border-[#e2e8f0] text-[#2596be] bg-white dark:bg-[#232b36] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#f6fcf3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#96be25] transition-all shadow-md focus-visible:z-10"
            tabIndex={0}
          >
            Generate SOAP
          </button>
        </div>
      </div>
    );
  };

  if (selectedPatient) {
    return (
      <>
        <div className="p-3 sm:p-6 overflow-y-auto bg-[var(--color-bg-light)] min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => {
                  handleCloseEditModal();
                  onPatientSelect && onPatientSelect(null);
                }}
                className="flex items-center text-[#2596be] hover:text-[#1d7a9c] text-xs sm:text-sm font-bold"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Patients
              </button>
            </div>

            {/* Patient Details Header */}
            <div
              className={`rounded-xl ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-[var(--color-border)]"
              } border p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h2
                    className={`text-xl sm:text-2xl font-bold ${
                      isDarkMode
                        ? "text-white"
                        : "text-[var(--color-text-dark)]"
                    }`}
                  >
                    {selectedPatient.name}
                  </h2>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Patient ID: {selectedPatient.id}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:space-x-3">
                  <span
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold rounded-full ${getStatusColor(
                      selectedPatient.status
                    )}`}
                  >
                    {(selectedPatient.status || "").charAt(0).toUpperCase() +
                      (selectedPatient.status || "").slice(1)}
                  </span>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-[#2596be] text-white px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#1d7a9c] shadow-md"
                  >
                    Edit Patient
                  </button>
                  {showEditModal && (
                    <EditPatientModal
                      patient={selectedPatient}
                      onClose={() => setShowEditModal(false)}
                      onSuccess={() => setShowEditModal(false)}
                    />
                  )}
                </div>
              </div>

              {/* Patient Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-4 bg-[#2596be]/10 rounded-lg border border-[#2596be]/20">
                  <p className="text-lg sm:text-2xl font-bold text-[#2596be]">
                    {(selectedPatient.files || []).length}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#2596be]">
                    Total Documents
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-[#96be25]/10 rounded-lg border border-[#96be25]/20">
                  <p className="text-lg sm:text-2xl font-bold text-[#96be25]">
                    {
                      (selectedPatient.files || []).filter(
                        (f) => f.processingStatus === "completed"
                      ).length
                    }
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#96be25]">
                    Processed
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-amber-100/50 rounded-lg border border-amber-200">
                  <p className="text-lg sm:text-2xl font-bold text-amber-600">
                    {
                      (selectedPatient.files || []).filter(
                        (f) => f.processingStatus === "pending"
                      ).length
                    }
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-amber-600">
                    Pending
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-indigo-100/50 rounded-lg border border-indigo-200">
                  <p className="text-lg sm:text-2xl font-bold text-indigo-600">
                    {Math.floor(
                      (Date.now() - new Date(selectedPatient.lastUpdated)) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-indigo-600">
                    Days Since Update
                  </p>
                </div>
              </div>
            </div>

            {/* Documents List Header with Grid/List Toggle */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3
                className={`text-lg sm:text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-[var(--color-text-dark)]"
                }`}
              >
                Patient Documents
              </h3>
              <div className="flex items-center gap-2 sm:gap-4">
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {(selectedPatient.files || []).length} documents
                </p>
                {!propViewMode && (
                  <div
                    className={`flex border ${
                      isDarkMode
                        ? "border-gray-600"
                        : "border-[var(--color-border)]"
                    } rounded-xl`}
                  >
                    <button
                      onClick={() => setLocalViewMode("grid")}
                      className={`p-1.5 sm:p-2 ${
                        viewMode === "grid"
                          ? "bg-[#2596be] text-white"
                          : isDarkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      } rounded-l-xl`}
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setLocalViewMode("list")}
                      className={`p-1.5 sm:p-2 ${
                        viewMode === "list"
                          ? "bg-[#2596be] text-white"
                          : isDarkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      } rounded-r-xl`}
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Documents List */}
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredAndSortedPatients.map((patient) => (
                  <div key={patient._id || patient.id} className="h-full flex">
                    <PatientCard patient={patient} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-white border-[var(--color-border)] shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedPatient.files || []).map((file) => (
                      <tr key={file._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                          {file.originalname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {new Date(file.createdAt).toLocaleDateString()} •{" "}
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                          {file.processingStatus}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500">
                          {new Date(file.lastUpdated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                          <button
                            onClick={() => handleViewDocument(file)}
                            className="text-[#2596be] hover:text-[#1d7a9c]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SOAP Modal */}
        {isSoapModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <div
              className={`rounded-xl shadow-xl max-w-2xl w-full p-6 relative border-2 ${
                isDarkMode
                  ? "bg-gray-800 border-[#2596be]"
                  : "bg-white border-[#2596be]"
              }`}
            >
              <button
                onClick={() => setIsSoapModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
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
              <h2 className="text-xl font-bold mb-4">SOAP Note Preview</h2>
              {isSoapLoading ? (
                <div className="text-center py-8">Generating SOAP note...</div>
              ) : (
                <>
                  <pre className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm mb-4">
                    {soapNote}
                  </pre>
                  <button
                    onClick={downloadSoapAsPDF}
                    className="px-4 py-2 rounded bg-[#2596be] text-white font-bold hover:bg-[#1d7a9c]"
                  >
                    Download as PDF
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // Default view when no patient is selected
  return (
    <div className="p-3 sm:p-6 overflow-y-auto bg-[var(--color-bg-light)] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="lastUpdated">Sort by Last Updated</option>
              <option value="documents">Sort by Document Count</option>
            </select>
          </div>
        </div>

        {/* Patients Grid */}
        <div
          className="grid gap-1 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          }}
        >
          {filteredAndSortedPatients.map((patient) => (
            <div key={patient._id || patient.id} className="h-full flex">
              <PatientCard patient={patient} />
            </div>
          ))}
        </div>

        {filteredAndSortedPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsView;
