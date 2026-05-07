"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface FileItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
  directUrl: string;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function GalleryPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFiles(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const isImage = (mime: string) => mime.startsWith("image/");
  const isVideo = (mime: string) => mime.startsWith("video/");
  const isAudio = (mime: string) => mime.startsWith("audio/");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">File Gallery</h1>
      <p className="text-gray-400 mb-8">
        All uploaded files. URLs never expire.
      </p>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No files uploaded yet.</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
          >
            Upload a file
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Preview */}
              <div className="h-40 bg-gray-800 flex items-center justify-center overflow-hidden">
                {isImage(file.mimeType) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.directUrl}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : isVideo(file.mimeType) ? (
                  <video
                    src={file.directUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : isAudio(file.mimeType) ? (
                  <div className="text-4xl">&#9835;</div>
                ) : (
                  <div className="text-4xl text-gray-600">&#128196;</div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p
                  className="font-medium text-sm truncate text-white"
                  title={file.originalName}
                >
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatSize(file.size)} &middot; {formatDate(file.uploadedAt)}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => copyToClipboard(file.directUrl, file.id)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white transition-colors"
                  >
                    {copied === file.id ? "Copied!" : "Copy URL"}
                  </button>
                  <a
                    href={file.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
