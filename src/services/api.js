const API_URL = "http://localhost:5000/api";

// File Upload API
export const uploadFile = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add auto-analyze option if specified
    if (options.analyze !== undefined) {
      formData.append("analyze", options.analyze.toString());
    }

    // Add patient information if provided
    if (options.patientName) {
      formData.append("patientName", options.patientName);
    }
    if (options.patientId) {
      formData.append("patientId", options.patientId);
    }

    const token = localStorage.getItem("authToken");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error uploading file");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Get All Files API
export const getAllFiles = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/upload`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching files");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

// Get File By ID API
export const getFileById = async (fileId) => {
  try {
    const token = localStorage.getItem("authToken");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/upload/${fileId}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching file");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching file:", error);
    throw error;
  }
};

// Delete File API
export const deleteFile = async (fileId) => {
  try {
    const token = localStorage.getItem("authToken");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/upload/${fileId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error deleting file");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Analyze File API
export const analyzeFile = async (fileId) => {
  try {
    console.log("Analyzing file with ID:", fileId);

    const token = localStorage.getItem("authToken");
    console.log("Auth token exists:", !!token);

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${API_URL}/ai/analyze/${fileId}`;
    console.log("Making request to:", url);

    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      console.error("API error response:", errorData);
      throw new Error(
        errorData.message || `HTTP ${response.status}: Error analyzing file`
      );
    }

    const result = await response.json();
    console.log("Analysis API result:", result);
    return result;
  } catch (error) {
    console.error("Error analyzing file:", error);
    throw error;
  }
};

// Get Analysis API
export const getAnalysis = async (fileId) => {
  try {
    const token = localStorage.getItem("authToken");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/ai/analysis/${fileId}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching analysis");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
};

// Generate Custom Analysis API
export const generateCustomAnalysis = async (fileId, prompt) => {
  try {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/ai/custom/${fileId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error generating custom analysis");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating custom analysis:", error);
    throw error;
  }
};

// Regenerate Analysis API
export const regenerateAnalysis = async (fileId) => {
  try {
    console.log("Regenerating analysis for file:", fileId);

    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/ai/regenerate/${fileId}`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        errorData.message ||
          `HTTP ${response.status}: Error regenerating analysis`
      );
    }

    const result = await response.json();
    console.log("Regenerate analysis result:", result);
    return result;
  } catch (error) {
    console.error("Error regenerating analysis:", error);
    throw error;
  }
};
