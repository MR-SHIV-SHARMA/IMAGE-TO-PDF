import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [outputFormat, setOutputFormat] = useState("pdf");

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
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
    <div className="App">
      <h1>File Converter</h1>
      <input type="file" onChange={handleFileUpload} />
      <select onChange={(e) => setOutputFormat(e.target.value)}>
        <option value="pdf">PDF</option>
        <option value="jpg">Image (JPG)</option>
        <option value="txt">Text</option>
      </select>
      <button onClick={handleFileConvert} disabled={!file || loading}>
        {loading ? "Converting..." : "Convert"}
      </button>
      {loading && <p>Loading...</p>}
      {result && (
        <div>
          <p>Conversion successful! Download your file:</p>
          <button onClick={handleFileDownload}>Download</button>
        </div>
      )}
    </div>
  );
}

export default App;
