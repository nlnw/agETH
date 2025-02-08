import { useState } from "react";

export default function StreamingText() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const fetchStream = async () => {
    if (!inputValue.trim()) return;

    setText("");
    setLoading(true);

    try {
      console.log("Sending prompt:", inputValue);

      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputValue }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let resultText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resultText += decoder.decode(value) + "\n";
        setText(resultText);
      }
    } catch (error) {
      console.error("Error fetching stream:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <input
        type="text"
        placeholder="Enter a prompt..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="p-2 border rounded w-full"
      />
      <button
        onClick={fetchStream}
        disabled={loading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "Loading..." : "Start Streaming"}
      </button>
      <p className="font-mono text-lg mt-4">{text || "Waiting for input..."}</p>
    </div>
  );
}
