import { useEffect } from "react";

const Meta = ({ title, description }) => {
  useEffect(() => {
    // Update the document title
    document.title =
      title || "Jawbreaker - AI-Powered Clinical Insight Platform";

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        description ||
          "Smarter AI for Clinical Documentation. Upload patient notes. Generate SOAP, OASIS summaries. Let AI help."
      );
    }
  }, [title, description]);

  return null; // This component doesn't render anything
};

export default Meta;
