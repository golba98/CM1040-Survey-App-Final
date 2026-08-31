import { useEffect, useState } from "react";
import { prototypes } from "../shared/survey";

export function PrototypeViewer({ prototypeKey }: { prototypeKey: string }) {
  const prototype = prototypes.find((item) => item.key === prototypeKey);
  const [layout, setLayout] = useState<"desktop" | "mobile">("desktop");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowLeft") setLayout("desktop");
      if (event.key === "ArrowRight") setLayout("mobile");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!prototype) return null;
  const image = layout === "desktop" ? prototype.desktop : prototype.mobile;
  const imageAlt = `${prototype.conceptName} ${prototype.eraLabel} ${layout} layout`;

  return (
    <section
      className="prototype-viewer"
      aria-label={`${prototype.conceptName}, ${prototype.eraLabel} prototype`}
    >
      <div className="viewer-header">
        <div>
          <p className="eyebrow">Prototype screen</p>
          <h2>{prototype.conceptName}</h2>
          <p>
            {prototype.eraLabel} · {prototype.title}
          </p>
        </div>
        <div className="layout-toggle" role="group" aria-label="Choose prototype layout">
          <button
            className={layout === "desktop" ? "active" : ""}
            onClick={() => setLayout("desktop")}
          >
            Desktop
          </button>
          <button
            className={layout === "mobile" ? "active" : ""}
            onClick={() => setLayout("mobile")}
          >
            Mobile
          </button>
        </div>
      </div>
      <figure className={`prototype-frame ${layout}`}>
        <img
          src={image}
          alt={imageAlt}
          onError={(event) => {
            event.currentTarget.alt = "This prototype image could not be loaded.";
          }}
        />
        <figcaption>
          <button
            onClick={() => setLayout("desktop")}
            disabled={layout === "desktop"}
            aria-label="Previous layout"
          >
            ← Previous
          </button>
          <span>{layout === "desktop" ? "Desktop layout" : "Mobile layout"}</span>
          <span className="caption-actions">
            <button onClick={() => setOpen(true)}>Enlarge image</button>
            <button
              onClick={() => setLayout("mobile")}
              disabled={layout === "mobile"}
              aria-label="Next layout"
            >
              Next →
            </button>
          </span>
        </figcaption>
      </figure>
      {open && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged prototype image"
          onClick={() => setOpen(false)}
        >
          <button
            className="lightbox-close"
            onClick={() => setOpen(false)}
            aria-label="Close enlarged image"
          >
            ×
          </button>
          <button
            className="lightbox-nav left"
            onClick={(event) => {
              event.stopPropagation();
              setLayout("desktop");
            }}
            aria-label="Previous layout"
          >
            ←
          </button>
          <img
            src={image}
            alt={`Enlarged ${imageAlt}`}
            onClick={(event) => event.stopPropagation()}
          />
          <button
            className="lightbox-nav right"
            onClick={(event) => {
              event.stopPropagation();
              setLayout("mobile");
            }}
            aria-label="Next layout"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
