import React, { useEffect, useState } from "react";

const API_KEY = "38476031c5d31bdfd4ee2404488db136"; // Get from https://gnews.io/

const FinanceNewsIndia = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(
      `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=business&lang=en&country=in&max=9`
    )
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
      });
  }, []);

  return (
    <div id="root" style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
      <h1 className="mb-8 font-extrabold text-4xl text-gray-900 flex items-center justify-center">
        <span className="logo react" style={{ marginRight: "0.5em", height: "6em", padding: "1.5em", transition: "filter 300ms" }}>
        </span>
        📰 Latest News and Articles
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem",
          paddingBottom: "2rem",
        }}
      >
        {articles.map((article, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: "1.5em",
              background: "#fff",
              borderRadius: "20px",
              border: "1.5px solid #646cffaa",
              boxShadow: "0 6px 18px #b0c5ff44",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "420px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              marginBottom: "2rem",
            }}
          >
            {article.image && (
              <img
                alt="News"
                src={article.image}
                style={{
                  borderRadius: "16px",
                  width: "100%",
                  maxHeight: "140px",
                  objectFit: "cover",
                  marginBottom: "1em",
                }}
              />
            )}
            <div>
              <div
                style={{
                  color: "#646cffaa",
                  fontSize: "0.8em",
                  fontWeight: "bold",
                  marginBottom: "0.5em",
                }}
              >
                {article.source?.name || "Unknown Source"}
              </div>
              <div
                style={{ fontWeight: "bold", fontSize: "1.25em", marginBottom: "0.5em" }}
              >
                {article.title}
              </div>
              <div style={{ color: "#888", marginBottom: "1.25em", fontSize: "0.92em" }}>
                {article.description}
              </div>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="logo"
              style={{
                display: "inline-block",
                color: "#61dafbaa",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "1.04em",
                willChange: "filter",
                transition: "filter 300ms",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.filter = "drop-shadow(0 0 2em #646cffaa)")
              }
              onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
            >
              Read More &rarr;
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinanceNewsIndia;
