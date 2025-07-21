import { createContext, useContext, useState, useEffect } from "react";
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
  const [patients, setPatients] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

        // Group files by patient (using filename or metadata)
        const patientGroups = groupFilesByPatient(data.files || []);
        setPatients(patientGroups);
      } else {
        throw new Error("Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  // Group files by patient (basic implementation)
  const groupFilesByPatient = (files) => {
    const groups = {};

    files.forEach((file) => {
      // Use patient info from file metadata first, then fallback to filename extraction
      const patientId =
        file.patientId || extractPatientId(file.originalname) || file._id;
      const patientName =
        file.patientName ||
        extractPatientName(file.originalname) ||
        `Patient ${patientId.toString().slice(-4)}`;

      if (!groups[patientId]) {
        groups[patientId] = {
          id: patientId,
          name: patientName,
          files: [],
          lastUpdated: file.createdAt,
          status: "active",
        };
      }

      groups[patientId].files.push(file);

      // Update last updated date
      if (new Date(file.createdAt) > new Date(groups[patientId].lastUpdated)) {
        groups[patientId].lastUpdated = file.createdAt;
      }
    });

    return Object.values(groups);
  };

  // Extract patient ID from filename (basic pattern matching)
  const extractPatientId = (filename) => {
    // Look for patterns like "Patient_123", "ID_456", etc.
    const patterns = [/patient[_-]?(\d+)/i, /id[_-]?(\d+)/i, /(\d{3,})/];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  // Extract patient name from filename
  const extractPatientName = (filename) => {
    // Remove file extension and common prefixes
    let name = filename.replace(/\.[^/.]+$/, "");
    name = name.replace(/^(patient[_-]?|id[_-]?)/i, "");

    // Capitalize first letter of each word
    return name
      .split(/[_-\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Upload new file
  const uploadFile = async (file, options = {}) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Add patient metadata if provided
      if (options.name) {
        formData.append("patientName", options.name);
      }
      if (options.id) {
        formData.append("patientId", options.id);
      }

      // Add auto-analyze option
      if (options.analyze !== undefined) {
        formData.append("analyze", options.analyze.toString());
      }

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
        // Refresh files after upload
        await fetchFiles();
        return { success: true, file: data.file };
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
        await fetchFiles();
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
      await fetchFiles();
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

  // Initialize data on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const value = {
    patients,
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
    updatePatient,
    getAIAnalysis,
  };

  return (
    <PatientDataContext.Provider value={value}>
      {children}
    </PatientDataContext.Provider>
  );
};

export default PatientDataProvider;
