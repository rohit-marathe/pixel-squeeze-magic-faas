import { useState } from 'react';

function App() {
  const [preview, setPreview] = useState('');
  const [quality, setQuality] = useState(80);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', String(quality));

    const response = await fetch("http://13.52.190.63:31112/function/compress-image-node", {
      method: "POST",
      body: formData,
    });

    const base64 = await response.text();
    const imgUrl = `data:image/jpeg;base64,${base64}`;
    setPreview(imgUrl);

    // optional: auto-download
    const link = document.createElement("a");
    link.href = imgUrl;
    link.download = "compressed.jpg";
    link.click();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pixel Squeeze (FaaS Edition)</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <br /><br />
      <label>Quality: </label>
      <input
        type="number"
        value={quality}
        min={1}
        max={100}
        onChange={(e) => setQuality(Number(e.target.value))}
      />
      <br /><br />
      {preview && (
        <>
          <img src={preview} alt="compressed" width="300" />
          <p>Preview of compressed image</p>
        </>
      )}
    </div>
  );
}

export default App;
