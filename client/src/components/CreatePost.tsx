import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";
import { colors, textareaStyle, buttonPrimaryStyle, errorTextStyle } from "../styles";

export const CreatePost = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption);

      const response = await fetch(apiUrl("/api/posts"), {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create post");
      }

      navigate("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Create Post
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Image picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%",
            aspectRatio: "1",
            border: `2px dashed ${colors.border}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            backgroundColor: colors.bgSecondary,
            marginBottom: "1rem",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: colors.textSecondary, fontSize: "1rem" }}>
              Click to select an image
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
          style={{ ...textareaStyle, marginBottom: "1rem" }}
        />

        {error && <p style={errorTextStyle}>{error}</p>}

        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !file}
          style={{
            ...buttonPrimaryStyle,
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            opacity: isSubmitting || !file ? 0.5 : 1,
            cursor: isSubmitting || !file ? "default" : "pointer",
          }}
        >
          {isSubmitting ? "Posting..." : "Share"}
        </button>
      </form>
    </div>
  );
};
