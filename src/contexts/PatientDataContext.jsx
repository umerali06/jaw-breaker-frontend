import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { API_ENDPOINTS } from "../config/api";

const PatientDataContext = createContext();

export const usePatientData = () => {
  const context = useContext(PatientDataContext);
  if (!context) {
    throw new Error("usePatientData must be used within a PatientDataProvider");
  }
  return context;
};

const PatientDataProvider = ({ children }) => {
  const [patientsFromApi, setPatientsFromApi] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detect environment
  const isDevEnvironment = () => {
    return import.meta.env.DEV || import.meta.env.VITE_ENV === "development";
  };

  // Generate sample data for testing
  const generateSampleData = () => {
    // Sample patients
    const samplePatients = [
      {
        _id: "1",
        id: "1",
        name: "John Doe",
        age: 45,
        gender: "Male",
        condition: "stable",
        phone: "555-1234",
        files: [],
      },
      {
        _id: "2",
        id: "2",
        name: "Jane Smith",
        age: 38,
        gender: "Female",
        condition: "improving",
        phone: "555-5678",
        files: [],
      },
      {
        _id: "3",
        id: "3",
        name: "Robert Johnson",
        age: 62,
        gender: "Male",
        condition: "chronic",
        phone: "555-9012",
        files: [],
      },
    ];

    // Sample files
    const sampleFiles = [
      {
        _id: "file1",
        originalname: "patient_record.pdf",
        mimetype: "application/pdf",
        createdAt: new Date().toISOString(),
        processingStatus: "completed",
        patientId: "1",
      },
      {
        _id: "file2",
        originalname: "medical_notes.docx",
        mimetype: "application/docx",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        processingStatus: "completed",
        patientId: "2",
      },
      {
        _id: "file3",
        originalname: "lab_results.pdf",
        mimetype: "application/pdf",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        processingStatus: "processing",
        patientId: "1",
      },
    ];

    return { patients: samplePatients, files: sampleFiles };
  };

  // Fetch all patient files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_ENDPOINTS.UPLOAD}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        throw new Error("Failed to fetch files");
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload new file
  const uploadFile = async (file, options = {}) => {
    try {
      setLoading(true);
      console.log("Uploading file with options:", options);

      const formData = new FormData();
      formData.append("file", file);

      // Add patient metadata if provided
      if (options.name) {
        formData.append("patientName", options.name);
      }
      if (options.id) {
        formData.append("patientId", options.id);
      }

      // Add auto-analyze option - explicitly set to true or false
      const shouldAnalyze =
        options.analyze === true || options.analyze === "true";
      formData.append("analyze", shouldAnalyze.toString());
      console.log("Auto-analyze set to:", shouldAnalyze);

      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("File upload successful:", data.file);

        // Refresh files after upload
        await fetchFiles();

        // Return the file with processing status for immediate UI feedback
        return {
          success: true,
          file: {
            ...data.file,
            processingStatus: shouldAnalyze ? "processing" : "pending",
          },
        };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete file
  const deleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_ENDPOINTS.UPLOAD}/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh files after deletion
        await fetchFiles(); // Refresh files, which will trigger useMemo
        return { success: true };
      } else {
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: error.message };
    }
  };

  // Update patient information
  const updatePatient = async (patientId, updatedInfo) => {
    try {
      const token = localStorage.getItem("authToken");

      // Find all files for this patient and update them
      const patientFiles = files.filter(
        (file) =>
          (file.patientId ||
            extractPatientId(file.originalname) ||
            file._id) === patientId
      );

      console.log("Found patient files to update:", patientFiles.length);

      if (patientFiles.length === 0) {
        return { success: false, error: "No files found for this patient" };
      }

      const updatePromises = patientFiles.map(async (file) => {
        const response = await fetch(`${API_ENDPOINTS.UPLOAD}/${file._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientName: updatedInfo.name,
            patientId: updatedInfo.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to update file ${file._id}: ${errorData.message}`
          );
        }

        return response.json();
      });

      const results = await Promise.all(updatePromises);
      console.log("Update results:", results);

      // Refresh files after update
      await Promise.all([fetchFiles(), fetchPatients()]); // Refresh both files and patients
      return { success: true };
    } catch (error) {
      console.error("Error updating patient:", error);
      return { success: false, error: error.message };
    }
  };

  // Get AI analysis for a file
  const getAIAnalysis = async (fileId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_ENDPOINTS.AI}/analyze/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, analysis: data.analysis };
      } else {
        throw new Error("Failed to get AI analysis");
      }
    } catch (error) {
      console.error("Error getting AI analysis:", error);
      return { success: false, error: error.message };
    }
  };

  // Fetch all patients from backend
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.PATIENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched patients data:", data); // Debug log

      // Handle the new API response format
      if (data.success && Array.isArray(data.patients)) {
        setPatientsFromApi(data.patients.map((p) => ({ ...p, id: p._id })));
      } else if (Array.isArray(data)) {
        // Fallback for old format
        setPatientsFromApi(data.map((p) => ({ ...p, id: p._id })));
      } else {
        console.error("Unexpected data format:", data);
        setPatientsFromApi([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients");
      setPatientsFromApi([]);
    } finally {
      setLoading(false);
    }
  };

  // Add a new patient to backend
  const addPatient = async (patientInfo) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.PATIENTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientInfo),
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to add patient");
      await fetchPatients();
      return data.patient;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Edit/update a patient in backend
  const editPatient = async (id, updatedInfo) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedInfo),
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to update patient");
      await fetchPatients();
      return data.patient;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a patient from backend
  const deletePatient = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to delete patient");
      await fetchPatients();
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get patient statistics
  const getPatientStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_ENDPOINTS.PATIENTS}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to fetch patient stats");
      return data.stats;
    } catch (error) {
      console.error("Error fetching patient stats:", error);
      throw error;
    }
  };

  // Search patients with filters
  const searchPatients = async (searchTerm, filters = {}) => {
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (filters.condition) params.append("condition", filters.condition);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await fetch(
        `${API_ENDPOINTS.PATIENTS}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to search patients");
      return data;
    } catch (error) {
      console.error("Error searching patients:", error);
      throw error;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    // Always try to fetch real data first
    fetchPatients();
    fetchFiles();

    // If we're in development and want to ensure we have sample data
    if (isDevEnvironment() && import.meta.env.VITE_USE_SAMPLE_DATA === "true") {
      const sampleData = generateSampleData();
      setPatientsFromApi(sampleData.patients);
      setFiles(sampleData.files);
      setLoading(false);
    }
  }, []);

  const patients = useMemo(() => {
    console.log("=== PATIENT DATA CONTEXT DEBUG ===");
    console.log("PatientsFromApi:", patientsFromApi);
    console.log("Files:", files);

    return patientsFromApi.map((p) => {
      const patientFiles = files.filter((f) => f.patientId === p.id);
      console.log(`Patient ${p.name} (ID: ${p.id}):`, {
        patientId: p.id,
        matchingFiles: patientFiles.length,
        filePatientIds: files.map((f) => ({
          name: f.originalname,
          patientId: f.patientId,
        })),
      });

      const lastUpdated =
        patientFiles.length > 0
          ? patientFiles.reduce((latest, file) =>
              new Date(file.createdAt) > new Date(latest.createdAt)
                ? file
                : latest
            ).createdAt
          : p.updatedAt;

      return {
        ...p,
        files: patientFiles,
        lastUpdated,
      };
    });
  }, [patientsFromApi, files]);

  const value = {
    patients,
    files,
    loading,
    error,
    fetchPatients,
    addPatient,
    editPatient,
    deletePatient,
    fetchFiles,
    uploadFile,
    deleteFile,
    updatePatient,
    getAIAnalysis,
    getPatientStats,
    searchPatients,
  };

  return (
    <PatientDataContext.Provider value={value}>
      {children}
    </PatientDataContext.Provider>
  );
};

export default PatientDataProvider;
