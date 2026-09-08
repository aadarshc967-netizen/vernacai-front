
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Languages,
  Sparkles,
  Trash2,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import { fetchLanguages, type Language } from "../data/languages";

const API_URL = "http://127.0.0.1:8000/translate";

function TextTranslation() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  const [fromLanguage, setFromLanguage] = useState("English");
  const [toLanguage, setToLanguage] = useState("Hindi");

  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");

  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Load languages from backend
  useEffect(() => {
    const loadLanguages = async () => {
      setLoadingLanguages(true);

      const data = await fetchLanguages();

      setLanguages(data);
      setLoadingLanguages(false);

      // Make sure default languages exist
      if (data.length > 0) {
        const english = data.find((lang) => lang.name === "English");
        const hindi = data.find((lang) => lang.name === "Hindi");

        if (english) {
          setFromLanguage(english.name);
        }

        if (hindi) {
          setToLanguage(hindi.name);
        }
      }
    };

    loadLanguages();
  }, []);

  const filteredFromLanguages = useMemo(() => {
    const search = fromSearch.trim().toLowerCase();

    if (!search) return languages;

    return languages.filter((language) =>
      language.name.toLowerCase().includes(search)
    );
  }, [languages, fromSearch]);

  const filteredToLanguages = useMemo(() => {
    const search = toSearch.trim().toLowerCase();

    if (!search) return languages;

    return languages.filter((language) =>
      language.name.toLowerCase().includes(search)
    );
  }, [languages, toSearch]);

  const translateText = async () => {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    setError("");
    setTranslatedText("");
    setTranslating(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          source_language: fromLanguage,
          target_language: toLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || data.error || "Translation failed.");
        return;
      }

      setTranslatedText(data.translated_text || "");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to VernacAI server. Please make sure the API is running."
      );
    } finally {
      setTranslating(false);
    }
  };

  const swapLanguages = () => {
    const oldFrom = fromLanguage;

    setFromLanguage(toLanguage);
    setToLanguage(oldFrom);

    const oldText = text;

    setText(translatedText);
    setTranslatedText(oldText);
  };

  const clearAll = () => {
    setText("");
    setTranslatedText("");
    setError("");
  };

  const copyTranslation = async () => {
    if (!translatedText) return;

    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        color: "white",
        padding: "30px 20px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            marginBottom: "25px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#cbd5e1",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        {/* HEADER */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "70px",
              height: "70px",
              borderRadius: "20px",
              background: "rgba(99,102,241,0.2)",
              marginBottom: "15px",
            }}
          >
            <Languages size={38} />
          </div>

          <h1
            style={{
              fontSize: "36px",
              margin: "0 0 8px",
            }}
          >
            VernacAI
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "16px",
              margin: 0,
            }}
          >
            Simple Text Translation
          </p>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "18px",
            padding: "18px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* FROM */}
            <div style={{ flex: 1, minWidth: "250px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                TRANSLATE FROM
              </label>

              {/* Search */}
              <div
                style={{
                  position: "relative",
                  marginBottom: "8px",
                }}
              >
                <Search
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b",
                  }}
                />

                <input
                  value={fromSearch}
                  onChange={(e) => setFromSearch(e.target.value)}
                  placeholder="Search language..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px 11px 38px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "#0f172a",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <select
                value={fromLanguage}
                onChange={(e) => setFromLanguage(e.target.value)}
                disabled={loadingLanguages}
                size={1}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "#1e293b",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                }}
              >
                {loadingLanguages ? (
                  <option>Loading languages...</option>
                ) : filteredFromLanguages.length === 0 ? (
                  <option>No language found</option>
                ) : (
                  filteredFromLanguages.map((language) => (
                    <option key={language.code} value={language.name}>
                      {language.name}
                    </option>
                  ))
                )}
              </select>

              {!loadingLanguages && (
                <div
                  style={{
                    marginTop: "7px",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  {filteredFromLanguages.length} languages
                </div>
              )}
            </div>

            {/* SWAP */}
            <button
              onClick={swapLanguages}
              title="Swap languages"
              disabled={loadingLanguages}
              style={{
                width: "48px",
                height: "48px",
                marginBottom: "0",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(99,102,241,0.25)",
                color: "white",
                cursor: loadingLanguages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: loadingLanguages ? 0.5 : 1,
              }}
            >
              <ArrowLeft size={20} />
            </button>

            {/* TO */}
            <div style={{ flex: 1, minWidth: "250px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                TRANSLATE TO
              </label>

              {/* Search */}
              <div
                style={{
                  position: "relative",
                  marginBottom: "8px",
                }}
              >
                <Search
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b",
                  }}
                />

                <input
                  value={toSearch}
                  onChange={(e) => setToSearch(e.target.value)}
                  placeholder="Search language..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px 11px 38px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "#0f172a",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <select
                value={toLanguage}
                onChange={(e) => setToLanguage(e.target.value)}
                disabled={loadingLanguages}
                size={1}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "#1e293b",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                }}
              >
                {loadingLanguages ? (
                  <option>Loading languages...</option>
                ) : filteredToLanguages.length === 0 ? (
                  <option>No language found</option>
                ) : (
                  filteredToLanguages.map((language) => (
                    <option key={language.code} value={language.name}>
                      {language.name}
                    </option>
                  ))
                )}
              </select>

              {!loadingLanguages && (
                <div
                  style={{
                    marginTop: "7px",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  {filteredToLanguages.length} languages
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TRANSLATION BOXES */}
        <div
          className="translation-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* INPUT */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  color: "#cbd5e1",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {fromLanguage}
              </span>

              <span
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {text.length}/2000
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setText(e.target.value);
                }
              }}
              placeholder={`Type something in ${fromLanguage}...`}
              style={{
                width: "100%",
                minHeight: "280px",
                resize: "vertical",
                boxSizing: "border-box",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(15,23,42,0.7)",
                color: "white",
                fontSize: "17px",
                lineHeight: "1.6",
                outline: "none",
              }}
            />
          </div>

          {/* OUTPUT */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  color: "#cbd5e1",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {toLanguage}
              </span>

              {translatedText && (
                <button
                  onClick={copyTranslation}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#a5b4fc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            <div
              style={{
                minHeight: "280px",
                boxSizing: "border-box",
                padding: "15px",
                borderRadius: "12px",
                background: "rgba(15,23,42,0.7)",
                color: translatedText ? "white" : "#64748b",
                fontSize: "17px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {translating ? (
                <div
                  style={{
                    height: "280px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Translating...
                </div>
              ) : (
                translatedText || "Your translation will appear here..."
              )}
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#fca5a5",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={translateText}
            disabled={translating || loadingLanguages}
            style={{
              minWidth: "220px",
              padding: "15px 25px",
              border: "none",
              borderRadius: "12px",
              background:
                translating || loadingLanguages ? "#475569" : "#4f46e5",
              color: "white",
              fontSize: "17px",
              fontWeight: "bold",
              cursor:
                translating || loadingLanguages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {translating ? (
              <>
                <Loader2
                  size={20}
                  style={{
                    animation: "spin 1s linear infinite",
                  }}
                />
                Translating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Translate
              </>
            )}
          </button>

          <button
            onClick={clearAll}
            style={{
              padding: "15px 25px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Trash2 size={19} />
            Clear
          </button>
        </div>

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            marginTop: "35px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          <p>
            <Sparkles
              size={14}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: "5px",
              }}
            />
            Powered by VernacAI Translation API
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 700px) {
            .translation-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default TextTranslation;

