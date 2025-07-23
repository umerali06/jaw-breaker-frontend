import { useState, useRef, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useTheme } from "../../contexts/ThemeContext";
import DocumentInfoPanel from "./DocumentInfoPanel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Brand color definitions
const BRAND = {
  primary: "#1a73e8", // Professional blue
  primaryLight: "#e8f0fe",
  primaryDark: "#0d47a1",
  secondary: "#34a853", // Healthy green
  secondaryLight: "#e6f4ea",
  accent: "#fbbc04", // Attention yellow
  accentLight: "#fff8e1",
  danger: "#d32f2f", // Alert red
  dangerLight: "#ffebee",
  dark: "#202124", // Dark background
  light: "#f8f9fa", // Light background
  neutral: "#5f6368", // Neutral gray
  white: "#ffffff",
};

const ChatPanel = ({ selectedPatient, onClose }) => {
  // Helper: Get localStorage key for patient
  const getStorageKey = () =>
    selectedPatient
      ? `chatHistory_${selectedPatient.id}`
      : "chatHistory_global";

  // Helper: Get latest summary from patient files
  const getLatestSummary = () => {
    if (!selectedPatient || !selectedPatient.files) return null;
    // Find the latest file with a summary/analysis
    const filesWithSummary = selectedPatient.files.filter(
      (f) => f.analysis && f.analysis.summary
    );
    if (filesWithSummary.length === 0) return null;
    // Sort by upload date if available
    filesWithSummary.sort((a, b) => {
      const aDate = new Date(a.uploadedAt || a.createdAt || 0);
      const bDate = new Date(b.uploadedAt || b.createdAt || 0);
      return bDate - aDate;
    });
    return filesWithSummary[0].analysis.summary;
  };

  // Select a document to use as context for the chat
  const selectDocumentContext = (file) => {
    setSelectedDocumentContext(file);
    setShowDocumentSelector(false);
  };

  // Fetch and display detailed document information
  const fetchDocumentDetails = async (fileId) => {
    if (!fileId) return;

    try {
      const token = localStorage.getItem("authToken");

      // Use the FILES endpoint (which is an alias for UPLOAD)
      const response = await fetch(`${API_ENDPOINTS.FILES}/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data && data.file) {
            setDocumentDetails(data.file);
            setShowDocumentInfo(true);
          } else {
            console.error("Invalid response format: missing file data");
          }
        } else {
          console.error("Response is not JSON format");
          const text = await response.text();
          console.error("Response content:", text.substring(0, 100) + "...");
        }
      } else {
        console.error(
          `Failed to fetch document details: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error fetching document details:", error);

      // If the document is already selected, use it directly
      if (selectedDocumentContext && selectedDocumentContext._id === fileId) {
        setDocumentDetails(selectedDocumentContext);
        setShowDocumentInfo(true);
      }
    }
  };

  // Helper: Get document context from selected document
  const getSelectedDocumentContext = () => {
    if (!selectedDocumentContext) return null;

    return {
      fileId: selectedDocumentContext._id,
      filename: selectedDocumentContext.originalname,
      type: selectedDocumentContext.mimetype,
      date:
        selectedDocumentContext.createdAt || selectedDocumentContext.uploadedAt,
    };
  };

  // Helper: Analyze user message to determine if they're asking about a specific document
  const getDocumentContext = (message) => {
    if (!selectedPatient || !selectedPatient.files || !message) return null;

    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();

    // Keywords that might indicate the user is asking about a document
    const documentKeywords = [
      "document",
      "file",
      "pdf",
      "report",
      "note",
      "assessment",
      "record",
      "chart",
      "scan",
      "result",
      "test",
      "lab",
    ];

    // Check if the message contains document-related keywords
    const containsDocumentKeywords = documentKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    if (containsDocumentKeywords) {
      // Look for document names in the message
      for (const file of selectedPatient.files) {
        const filename = file.originalname.toLowerCase();
        // Check if the filename or parts of it are mentioned in the message
        const filenameParts = filename.split(/[_\-\s.]/);

        if (
          lowerMessage.includes(filename) ||
          filenameParts.some(
            (part) => part.length > 3 && lowerMessage.includes(part)
          )
        ) {
          // Found a document the user is likely asking about
          return {
            filename: file.originalname,
            fileId: file._id,
            type: file.mimetype,
            date: file.createdAt || file.uploadedAt,
          };
        }
      }

      // If no specific document was found but keywords suggest document interest,
      // return the most recent document as context
      const sortedFiles = [...selectedPatient.files].sort((a, b) => {
        const aDate = new Date(a.uploadedAt || a.createdAt || 0);
        const bDate = new Date(b.uploadedAt || b.createdAt || 0);
        return bDate - aDate;
      });

      if (sortedFiles.length > 0) {
        return {
          filename: sortedFiles[0].originalname,
          fileId: sortedFiles[0]._id,
          type: sortedFiles[0].mimetype,
          date: sortedFiles[0].createdAt || sortedFiles[0].uploadedAt,
          note: "Most recent document provided as context",
        };
      }
    }

    return null;
  };

  const { isDarkMode } = useTheme();
  // Load chat history from localStorage
  const [messages, setMessages] = useState(() => {
    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch {
        // fallback to default
      }
    }
    return [
      {
        id: 1,
        type: "ai",
        content:
          "Hello! I'm your AI clinical assistant. I can help you with OASIS scoring, SOAP note generation, clinical insights, and documentation analysis. How can I assist you today?",
        timestamp: new Date(),
      },
    ];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocumentContext, setSelectedDocumentContext] = useState(null);
  const [showDocumentInfo, setShowDocumentInfo] = useState(false);
  const [documentDetails, setDocumentDetails] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    const key = getStorageKey();
    localStorage.setItem(
      key,
      JSON.stringify(
        messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        }))
      )
    );
    // eslint-disable-next-line
  }, [messages, selectedPatient?.id]);

  // Reset chat and document info when patient changes
  useEffect(() => {
    setMessages([]);
    setSelectedDocumentContext(null);
    setShowDocumentSelector(false);
    setShowDocumentInfo(false);
    setDocumentDetails(null);
  }, [selectedPatient]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // Get latest summary and other context information
      const latestSummary = getLatestSummary();

      // Get document context from either selected document or message analysis
      const selectedContext = getSelectedDocumentContext();
      const messageContext = getDocumentContext(inputMessage);

      // Prioritize explicitly selected document over message analysis
      const documentContext = selectedContext || messageContext;

      // Create enhanced context object with rich information
      const enhancedContext = selectedPatient
        ? {
            patientName: selectedPatient.name,
            documents: selectedPatient.files.map((f) => f.originalname),
            latestSummary,
            documentContext,
            // Include any specific document the user might be asking about
            focusedDocument: documentContext ? documentContext.filename : null,
          }
        : null;

      const response = await fetch(`${API_ENDPOINTS.AI}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          patientId: selectedPatient?.id,
          context: enhancedContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Create a more informative AI message with context awareness indicators
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: data.response,
          timestamp: new Date(),
          contextInfo: data.context || {},
        };

        // Add a visual indicator if the response was based on document context
        if (
          data.context &&
          (data.context.hasDocumentContent ||
            data.context.insightsIncluded > 0 ||
            data.context.focusedDocument)
        ) {
          const contextNote = [];

          if (data.context.focusedDocument) {
            contextNote.push("focused document analysis");

            // If we have a focused document, fetch its details
            if (data.context.focusedDocument) {
              // Only fetch if we don't already have details or if it's a different document
              if (
                !documentDetails ||
                (documentDetails &&
                  documentDetails._id !== data.context.focusedDocument)
              ) {
                fetchDocumentDetails(data.context.focusedDocument);

                // If we have the document in the patient's files, use it as a fallback
                if (selectedPatient && selectedPatient.files) {
                  const fallbackDoc = selectedPatient.files.find(
                    (file) => file._id === data.context.focusedDocument
                  );
                  if (fallbackDoc) {
                    setDocumentDetails(fallbackDoc);
                    setShowDocumentInfo(true);
                  }
                }
              }
            }
          } else if (data.context.hasDocumentContent) {
            contextNote.push("document content");
          }

          if (data.context.insightsIncluded > 0) {
            contextNote.push(
              `${data.context.insightsIncluded} clinical insights`
            );
          }

          if (data.context.hasOasisScores) {
            contextNote.push("OASIS scores");
          }

          if (data.context.hasSoapNote) {
            contextNote.push("SOAP notes");
          }

          if (contextNote.length > 0) {
            aiMessage.contextNote = `Response based on ${contextNote.join(
              ", "
            )}`;
          }
        }

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "Generate SOAP note for this patient",
    "Complete OASIS M1830 assessment",
    "Summarize recent documentation",
    "Identify potential care gaps",
    "Suggest intervention strategies",
    "Analyze latest document",
    "Explain clinical insights",
    "Compare with previous assessment",
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  // Export/copy chat transcript helpers
  const copyChatTranscript = () => {
    const text = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toLocaleString()}] ${
            msg.type === "user" ? "You" : "AI"
          }: ${msg.content}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const exportChatTranscript = () => {
    const text = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toLocaleString()}] ${
            msg.type === "user" ? "You" : "AI"
          }: ${msg.content}`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedPatient
      ? `${selectedPatient.name}-chat.txt`
      : "chat.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`w-full sm:w-80 md:w-96 h-screen max-h-screen flex flex-col ${
        isDarkMode ? "bg-gray-800 dark-mode" : "bg-white"
      } border-l ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      } shadow-xl`}
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      {/* Header */}
      <div
        className={`p-3 sm:p-4 border-b ${
          isDarkMode
            ? "border-gray-700 bg-gray-900"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
              }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h3
                className={`font-semibold text-sm sm:text-base truncate ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Clinical AI Assistant
              </h3>
              <p
                className={`text-[10px] sm:text-xs truncate ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Documentation & Clinical Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors flex-shrink-0 ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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

        {selectedPatient && (
          <div
            className={`mt-2 sm:mt-3 p-1.5 sm:p-2 rounded-lg flex items-center ${
              isDarkMode
                ? "bg-gray-700 border border-gray-600"
                : "bg-blue-50 border border-blue-100"
            }`}
          >
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 ${
                isDarkMode ? "text-blue-300" : "text-blue-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p
              className={`text-[10px] sm:text-xs truncate ${
                isDarkMode ? "text-blue-300" : "text-blue-800"
              }`}
            >
              <span className="font-medium">Patient Context:</span>{" "}
              {selectedPatient.name}
            </p>
          </div>
        )}
      </div>

      {/* Messages + Export/Copy */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-end gap-1 sm:gap-2 mb-2">
          <button
            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[#2596be] text-white text-[10px] sm:text-xs font-bold hover:bg-[#1d7a9c]"
            onClick={copyChatTranscript}
            title="Copy chat transcript"
          >
            Copy
          </button>
          <button
            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[#96be25] text-white text-[10px] sm:text-xs font-bold hover:bg-[#7a9c1d]"
            onClick={exportChatTranscript}
            title="Export chat transcript"
          >
            Export
          </button>
        </div>

        {/* Document Info Panel */}
        {showDocumentInfo && documentDetails && (
          <DocumentInfoPanel
            document={documentDetails}
            onClose={() => setShowDocumentInfo(false)}
          />
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-xl ${
                message.type === "user"
                  ? `bg-gradient-to-r from-blue-600 to-blue-500 text-white`
                  : message.isError
                  ? `${
                      isDarkMode
                        ? "bg-red-900 bg-opacity-30 text-red-200 border border-red-800"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`
                  : `${
                      isDarkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-100 text-gray-800"
                    }`
              } shadow-sm break-words`}
            >
              <div className="text-xs sm:text-sm whitespace-pre-wrap break-words markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
              <div className="flex flex-wrap items-center justify-between mt-1 sm:mt-2">
                <div className="flex items-center">
                  <p
                    className={`text-[10px] sm:text-xs ${
                      message.type === "user"
                        ? "text-blue-100"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Show document info button if this message has document context */}
                  {message.type === "ai" &&
                    message.contextInfo &&
                    message.contextInfo.focusedDocument && (
                      <button
                        onClick={() => {
                          if (
                            message.contextInfo &&
                            message.contextInfo.focusedDocument
                          ) {
                            fetchDocumentDetails(
                              message.contextInfo.focusedDocument
                            );

                            // If we have the document in the patient's files, use it as a fallback
                            if (selectedPatient && selectedPatient.files) {
                              const fallbackDoc = selectedPatient.files.find(
                                (file) =>
                                  file._id ===
                                  message.contextInfo.focusedDocument
                              );
                              if (fallbackDoc) {
                                setDocumentDetails(fallbackDoc);
                                setShowDocumentInfo(true);
                              }
                            }
                          }
                        }}
                        className={`ml-2 p-0.5 rounded-full ${
                          isDarkMode
                            ? "hover:bg-gray-700 text-blue-300"
                            : "hover:bg-gray-100 text-blue-600"
                        }`}
                        title="View document details"
                      >
                        <svg
                          className="w-3 h-3"
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
                      </button>
                    )}
                </div>

                {message.contextNote && (
                  <p
                    className={`text-[8px] sm:text-[10px] italic ml-2 ${
                      isDarkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    {message.contextNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`px-4 py-3 rounded-xl ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isDarkMode
                        ? BRAND.primary
                        : BRAND.primaryDark,
                      animation: "bounce 1.4s infinite",
                    }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isDarkMode
                        ? BRAND.primary
                        : BRAND.primaryDark,
                      animation: "bounce 1.4s infinite 0.2s",
                    }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isDarkMode
                        ? BRAND.primary
                        : BRAND.primaryDark,
                      animation: "bounce 1.4s infinite 0.4s",
                    }}
                  ></div>
                </div>
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Analyzing request...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts or Document Context */}
      {messages.length <= 1 ? (
        <div
          className={`p-4 border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-900"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <p
            className={`text-xs font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Try asking:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className={`text-left text-xs p-2 rounded-lg transition-all truncate ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
                    : "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
                } border hover:shadow-sm`}
                title={prompt}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : selectedPatient &&
        selectedPatient.files &&
        selectedPatient.files.length > 0 ? (
        <div
          className={`p-3 sm:p-4 border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-900"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className={`text-xs font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Document Context
            </p>
            <button
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setShowDocumentSelector((prev) => !prev)}
            >
              {showDocumentSelector ? "Hide" : "Change"}
            </button>
          </div>

          {showDocumentSelector ? (
            <div className="max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {selectedPatient.files.slice(0, 5).map((file, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      onClick={() => selectDocumentContext(file)}
                      className={`flex-grow text-left text-[10px] sm:text-xs p-1.5 rounded-l-md transition-all truncate flex items-center ${
                        selectedDocumentContext &&
                        selectedDocumentContext._id === file._id
                          ? isDarkMode
                            ? "bg-blue-900 bg-opacity-30 text-blue-300 border border-blue-800"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                          : isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          : "bg-white hover:bg-gray-50 text-gray-700"
                      } ${
                        selectedDocumentContext &&
                        selectedDocumentContext._id === file._id
                          ? "border-r-0"
                          : ""
                      }`}
                    >
                      <svg
                        className="w-3 h-3 mr-1.5 flex-shrink-0"
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
                    </button>
                    <button
                      onClick={() => {
                        setDocumentDetails(file);
                        setShowDocumentInfo(true);
                      }}
                      className={`p-1.5 rounded-r-md transition-all ${
                        selectedDocumentContext &&
                        selectedDocumentContext._id === file._id
                          ? isDarkMode
                            ? "bg-blue-900 bg-opacity-30 text-blue-300 border border-blue-800 border-l-0"
                            : "bg-blue-50 text-blue-800 border border-blue-200 border-l-0"
                          : isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border-l border-gray-700"
                          : "bg-white hover:bg-gray-50 text-gray-700 border-l border-gray-200"
                      }`}
                      title="View document details"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedDocumentContext ? (
            <div
              className={`text-[10px] sm:text-xs p-2 rounded-md ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 mr-1.5 flex-shrink-0"
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
                  <span className="font-medium truncate">
                    {selectedDocumentContext.originalname}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDocumentDetails(selectedDocumentContext);
                    setShowDocumentInfo(true);
                  }}
                  className={`p-1 rounded-full ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                  title="View document details"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
              <p
                className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } italic`}
              >
                Ask questions about this document
              </p>
            </div>
          ) : (
            <div
              className={`text-[10px] sm:text-xs p-2 rounded-md ${
                isDarkMode
                  ? "bg-gray-800 text-gray-400 border border-gray-700"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              No specific document selected. AI will use the most recent
              document for context.
            </div>
          )}
        </div>
      ) : null}

      {/* Input Area */}
      <div
        className={`p-4 border-t ${
          isDarkMode
            ? "border-gray-700 bg-gray-900"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about OASIS scoring, SOAP notes..."
            className={`w-full resize-none border rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            }`}
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1 sm:p-1.5 rounded-full transition-colors ${
              !inputMessage.trim() || isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-opacity-90"
            }`}
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
            }}
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Add some global styles for the animation and markdown */}
      <style>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        /* Markdown styles */
        .markdown-content strong {
          font-weight: 700;
        }
        
        .markdown-content em {
          font-style: italic;
        }
        
        .markdown-content h1, .markdown-content h2, .markdown-content h3, 
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          font-weight: 700;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .markdown-content h1 {
          font-size: 1.25rem;
        }
        
        .markdown-content h2 {
          font-size: 1.15rem;
        }
        
        .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          font-size: 1.05rem;
        }
        
        .markdown-content ul, .markdown-content ol {
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .markdown-content ul {
          list-style-type: disc;
        }
        
        .markdown-content ol {
          list-style-type: decimal;
        }
        
        .markdown-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .markdown-content blockquote {
          border-left: 3px solid #9ca3af;
          padding-left: 0.75rem;
          font-style: italic;
          margin: 0.5rem 0;
        }
        
        .markdown-content code {
          font-family: monospace;
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.1rem 0.2rem;
          border-radius: 3px;
        }
        
        .markdown-content pre {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          border-radius: 3px;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
        }
        
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
        
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        
        /* Table styles */
        .markdown-content table {
          border-collapse: collapse;
          margin: 0.5rem 0;
          width: 100%;
          font-size: 0.75rem;
        }
        
        .markdown-content table th,
        .markdown-content table td {
          border: 1px solid #d1d5db;
          padding: 0.25rem 0.5rem;
          text-align: left;
        }
        
        .markdown-content table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        /* Dark mode specific markdown styles */
        .dark-mode .markdown-content a {
          color: #60a5fa;
        }
        
        .dark-mode .markdown-content blockquote {
          border-left-color: #6b7280;
        }
        
        .dark-mode .markdown-content code {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .dark-mode .markdown-content pre {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .dark-mode .markdown-content table th,
        .dark-mode .markdown-content table td {
          border-color: #4b5563;
        }
        
        .dark-mode .markdown-content table th {
          background-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
