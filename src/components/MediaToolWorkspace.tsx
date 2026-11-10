"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, FileImage, FileText, Image as ImageIcon, Loader2, RotateCcw, ShieldCheck } from "lucide-react";

type MediaKind = "image" | "pdf";
type MediaTool = { name: string; description: string; kind: MediaKind };
const mediaTools: Record<string, MediaTool> = {
  "image-compressor": { name: "Image Compressor", description: "Reduce image file size in your browser and download the optimized image.", kind: "image" },
  "image-resizer": { name: "Image Resizer", description: "Resize an image to a chosen width while preserving its aspect ratio.", kind: "image" },
  "image-converter": { name: "Image Format Converter", description: "Convert images between PNG, JPEG and WebP formats.", kind: "image" },
  "image-to-pdf": { name: "Image to PDF", description: "Turn one or more images into a downloadable PDF document.", kind: "pdf" },
  "pdf-merge": { name: "Merge PDF", description: "Combine multiple PDF files into one document locally in your browser.", kind: "pdf" },
  "pdf-split": { name: "Split PDF", description: "Extract selected pages from a PDF into a new document.", kind: "pdf" },
};

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function MediaToolWorkspace({ slug }: { slug: string }) {
  const tool = mediaTools[slug];
  const [files, setFiles] = useState<File[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [width, setWidth] = useState("1200");
  const [quality, setQuality] = useState(82);
  const [format, setFormat] = useState("image/webp");
  const [pageRange, setPageRange] = useState("1");
  const [preview, setPreview] = useState("");
  const [outputName, setOutputName] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  if (!tool) return <div className="not-found"><h1>Tool not found</h1><Link href="/">Back to SmartToolHub</Link></div>;

  function reset() {
    setFiles([]); setNotice(""); setOutputBlob(null); setOutputName("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    if (fileInput.current) fileInput.current.value = "";
  }

  function onFilesChange(list: FileList | null) {
    const selected = Array.from(list || []);
    if (!selected.length) return;
    const valid = selected.filter((file) => tool.kind === "image" || slug === "image-to-pdf" ? file.type.startsWith("image/") : file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (valid.length !== selected.length) {
      setNotice(tool.kind === "image" || slug === "image-to-pdf" ? "Please choose supported image files." : "Please choose PDF files only.");
    } else setNotice("");
    setFiles(valid);
    setOutputBlob(null);
    setOutputName("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(valid[0] && valid[0].type.startsWith("image/") ? URL.createObjectURL(valid[0]) : "");
  }

  async function processFiles() {
    if (!files.length) { setNotice("Choose a file first."); return; }
    setBusy(true); setNotice(""); setOutputBlob(null); setOutputName("");
    try {
      if (["image-compressor", "image-resizer", "image-converter"].includes(slug)) {
        const file = files[0];
        const bitmap = await createImageBitmap(file);
        const requestedWidth = slug === "image-resizer" ? Math.max(1, Number(width) || bitmap.width) : bitmap.width;
        const scale = slug === "image-resizer" ? Math.min(12000, requestedWidth) / bitmap.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not start image processing.");
        if (format === "image/jpeg") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); }
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const mime = slug === "image-converter" ? format : "image/webp";
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not export this image format.")), mime, quality / 100));
        const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
        const base = file.name.replace(/\.[^.]+$/, "");
        setOutputBlob(blob); setOutputName(`${base}-${slug === "image-resizer" ? "resized" : slug === "image-compressor" ? "compressed" : "converted"}.${ext}`);
        setNotice(`Done. Original: ${(file.size / 1024).toFixed(1)} KB · New: ${(blob.size / 1024).toFixed(1)} KB · ${canvas.width} × ${canvas.height}px.`);
      } else {
        const { PDFDocument } = await import("pdf-lib");
        if (slug === "image-to-pdf") {
          const pdf = await PDFDocument.create();
          for (const file of files) {
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error(`Could not process ${file.name}.`);
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bitmap, 0, 0);
            bitmap.close();
            const imageBytes = await new Promise<ArrayBuffer>((resolve, reject) => canvas.toBlob(async (blob) => {
              if (!blob) { reject(new Error(`Could not convert ${file.name}.`)); return; }
              resolve(await blob.arrayBuffer());
            }, "image/jpeg", 0.92));
            const embedded = await pdf.embedJpg(imageBytes);
            const page = pdf.addPage([embedded.width * 0.75, embedded.height * 0.75]);
            page.drawImage(embedded, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
          }
          const bytes = await pdf.save();
          setOutputBlob(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" })); setOutputName("images-to-pdf.pdf");
          setNotice(`Created a PDF with ${files.length} image(s).`);
        } else if (slug === "pdf-merge") {
          if (files.length < 2) throw new Error("Select at least two PDF files to merge.");
          const merged = await PDFDocument.create();
          for (const file of files) {
            const source = await PDFDocument.load(await file.arrayBuffer());
            const pages = await merged.copyPages(source, source.getPageIndices());
            pages.forEach((page) => merged.addPage(page));
          }
          const bytes = await merged.save();
          setOutputBlob(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" })); setOutputName("merged-document.pdf");
          setNotice(`Merged ${files.length} PDF files into one document.`);
        } else if (slug === "pdf-split") {
          if (files.length !== 1) throw new Error("Select exactly one PDF file to extract pages.");
          const source = await PDFDocument.load(await files[0].arrayBuffer());
          const total = source.getPageCount();
          const indices = new Set<number>();
          for (const part of pageRange.split(",").map((value) => value.trim()).filter(Boolean)) {
            const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
            if (!match) throw new Error("Use page numbers like 1,3-5.");
            const start = Number(match[1]); const end = Number(match[2] || match[1]);
            if (start < 1 || end < start || end > total) throw new Error(`Page range must be between 1 and ${total}.`);
            for (let page = start; page <= end; page++) indices.add(page - 1);
          }
          if (!indices.size) throw new Error("Enter at least one page number.");
          const extracted = await PDFDocument.create();
          const pages = await extracted.copyPages(source, Array.from(indices).sort((a,b) => a-b));
          pages.forEach((page) => extracted.addPage(page));
          const bytes = await extracted.save();
          setOutputBlob(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" })); setOutputName("extracted-pages.pdf");
          setNotice(`Extracted ${indices.size} page(s) from a ${total}-page PDF.`);
        }
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not process these files. Check that they are valid and try again.");
    } finally { setBusy(false); }
  }

  const accept = tool.kind === "image" || slug === "image-to-pdf" ? "image/png,image/jpeg,image/webp" : "application/pdf,.pdf";
  const isImageTool = ["image-compressor", "image-resizer", "image-converter"].includes(slug);
  return (
    <div className="workspace">
      <Link href="/" className="back-link"><ArrowLeft size={16}/> Back to all tools</Link>
      <div className="workspace-heading"><div><div className="section-kicker">{tool.kind.toUpperCase()} TOOL</div><h1>{tool.name}</h1><p>{tool.description}</p></div></div>
      <div className="workspace-layout media-workspace-layout">
        <section className="tool-panel">
          <div className="panel-heading"><div><span className="panel-step">01</span><b>Select your files</b></div><button className="text-action" onClick={reset}><RotateCcw size={14}/> Reset</button></div>
          <label className="field-label">{slug === "pdf-merge" || slug === "image-to-pdf" ? "Choose multiple files" : "Choose a file"}</label>
          <input ref={fileInput} className="media-file-input" type="file" accept={accept} multiple={slug === "pdf-merge" || slug === "image-to-pdf"} onChange={(event) => onFilesChange(event.target.files)}/>
          <div className="field-hint">{files.length ? `${files.length} file(s) selected: ${files.map((file) => file.name).join(", ")}` : "Your files stay in this browser; they are not uploaded to SmartToolHub."}</div>
          {preview && <div className="media-preview"><img src={preview} alt="Selected image preview"/></div>}
          {isImageTool && <>
            {slug === "image-resizer" && <label className="field-label">Target width (pixels)<input className="tool-input" type="number" min="1" max="12000" value={width} onChange={(event) => setWidth(event.target.value)}/></label>}
            {slug === "image-converter" && <label className="field-label">Output format<select className="tool-input" value={format} onChange={(event) => setFormat(event.target.value)}><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></label>}
            <label className="field-label">Quality: {quality}%<input type="range" min="20" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))}/></label>
          </>}
          {slug === "pdf-split" && <label className="field-label">Pages to extract (e.g. 1,3-5)<input className="tool-input" value={pageRange} onChange={(event) => setPageRange(event.target.value)} placeholder="1,3-5"/></label>}
          <button className="primary-btn run-btn" onClick={processFiles} disabled={busy || !files.length}>{busy ? <><Loader2 size={16} className="spin"/> Processing…</> : <>Process files <Download size={16}/></>}</button>
          {notice && <div className={`notice ${outputBlob ? "success" : "error"}`}>{notice}</div>}
          {outputBlob && <button className="secondary-btn" onClick={() => saveBlob(outputBlob, outputName)}><Download size={16}/> Download {outputName}</button>}
        </section>
        <section className="tool-panel output-panel"><div className="panel-heading"><div><span className="panel-step">02</span><b>How it works</b></div></div>
          <div className="output-empty"><div className="output-empty-icon">{tool.kind === "image" ? <ImageIcon size={30}/> : <FileText size={30}/>}</div><b>Private, in-browser processing</b><span>{tool.kind === "image" ? "Images are decoded and processed with the browser Canvas API." : "PDF files are read and modified locally in your browser using PDF-Lib."}</span></div>
          <div className="privacy-note"><ShieldCheck size={14}/> Files are processed locally in your browser. Do not close this tab until processing and download are complete.</div>
        </section>
      </div>
      <div className="workspace-footnote"><ShieldCheck size={16}/><span><b>Your files stay private.</b> Processing happens on your device; no file upload endpoint is used.</span></div>
    </div>
  );
}
