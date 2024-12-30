import React, { useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai"; // Icon for file upload
import { FiDownload } from "react-icons/fi"; // Icon for download

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [preview, setPreview] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
  };

  const handleFileConvert = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", outputFormat);

    fetch("http://localhost:5000/convert", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleFileDownload = () => {
    fetch(result.url)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.url.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="App flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">
        Image to PDF Converter
      </h1>

      <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 w-full max-w-md">
        <label className="flex flex-col items-center mb-4 cursor-pointer">
          <AiOutlineCloudUpload className="text-5xl md:text-6xl text-blue-500 mb-2" />
          <span className="text-sm text-gray-600">Upload your file</span>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.jpg,.txt" // Limit accepted file types
          />
        </label>

        {file && (
          <div className="mb-4 text-center">
            <img
              src={preview}
              alt="Preview"
              className="mb-2 max-h-48 mx-auto"
            />
            <p className="text-green-600">
              File uploaded successfully: {file.name}
            </p>
          </div>
        )}

        <select
          onChange={(e) => setOutputFormat(e.target.value)}
          className="mb-4 block w-full text-sm text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="pdf">PDF</option>
          <option value="jpg">Image (JPG)</option>
          <option value="txt">Text</option>
        </select>

        <button
          onClick={handleFileConvert}
          disabled={!file || loading}
          className={`w-full py-3 rounded-lg text-white transition duration-200 ease-in-out ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-blue-300`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="text-gray-200"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                ></circle>
                <path
                  className="text-blue-600"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 12.87-5.1l-1.54 1.54A6 6 0 1 0 10.5 10H12v2H8v-4h2.5a8 8 0 0 1-6 5z"
                ></path>
              </svg>
              Converting...
            </span>
          ) : (
            "Convert"
          )}
        </button>

        {loading && <p className="mt-2 text-gray-600">Loading...</p>}

        {result && (
          <div className="mt-4 text-center">
            <p className="text-gray-700">
              Conversion successful! Download your file:
            </p>
            <button
              onClick={handleFileDownload}
              className="mt-2 flex items-center justify-center w-full py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <FiDownload className="mr-2" />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
