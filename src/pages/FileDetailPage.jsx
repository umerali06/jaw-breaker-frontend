import FileDetail from "../components/FileDetail";
import Meta from "../components/Meta";

const FileDetailPage = () => {
  return (
    <>
      <Meta
        title="File Details - Jawbreaker"
        description="View file details and AI analysis"
      />
      <div className="pt-20">
        <FileDetail />
      </div>
    </>
  );
};

export default FileDetailPage;
