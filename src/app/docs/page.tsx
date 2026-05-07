export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
      <p className="text-gray-400 mb-10">
        Complete API reference for FileToURL. All uploaded files get permanent
        URLs with no expiration.
      </p>

      {/* Base URL */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Base URL</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <code className="text-green-400 text-sm">
            https://your-domain.com
          </code>
          <p className="text-gray-500 text-sm mt-2">
            Replace with your actual deployment URL.
          </p>
        </div>
      </section>

      {/* Upload Endpoint */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">
          Upload File
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-800 flex items-center gap-3">
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
              POST
            </span>
            <code className="text-sm text-gray-300">/api/upload</code>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Request
              </h3>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>
                  Content-Type:{" "}
                  <code className="text-yellow-400">multipart/form-data</code>
                </li>
                <li>
                  Field name: <code className="text-yellow-400">file</code>
                </li>
                <li>Max size: 100MB</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                cURL Example
              </h3>
              <pre className="bg-gray-950 rounded p-3 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {`curl -X POST \\
  https://your-domain.com/api/upload \\
  -F "file=@/path/to/your/file.png"`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                JavaScript/Fetch Example
              </h3>
              <pre className="bg-gray-950 rounded p-3 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {`const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result.data.directUrl);`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Python Example
              </h3>
              <pre className="bg-gray-950 rounded p-3 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {`import requests

with open("file.png", "rb") as f:
    response = requests.post(
        "https://your-domain.com/api/upload",
        files={"file": f}
    )

data = response.json()
print(data["data"]["directUrl"])`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Success Response{" "}
                <span className="text-green-400">(201 Created)</span>
              </h3>
              <pre className="bg-gray-950 rounded p-3 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {JSON.stringify(
                    {
                      success: true,
                      data: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        originalName: "photo.png",
                        mimeType: "image/png",
                        size: 245632,
                        uploadedAt: "2025-01-15T10:30:00.000Z",
                        url: "https://your-domain.com/api/files/550e8400-e29b-41d4-a716-446655440000",
                        directUrl:
                          "https://your-domain.com/api/files/550e8400-e29b-41d4-a716-446655440000",
                        noExpiration: true,
                      },
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Error Responses
              </h3>
              <div className="space-y-2">
                <div className="bg-gray-950 rounded p-3">
                  <p className="text-xs text-red-400 mb-1">
                    400 Bad Request - No file
                  </p>
                  <code className="text-sm text-gray-400">
                    {`{"success": false, "error": "No file provided. Use field name \\"file\\""}`}
                  </code>
                </div>
                <div className="bg-gray-950 rounded p-3">
                  <p className="text-xs text-red-400 mb-1">
                    413 Payload Too Large
                  </p>
                  <code className="text-sm text-gray-400">
                    {`{"success": false, "error": "File too large. Maximum size is 100MB"}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get File */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">
          Get File (Direct URL)
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-800 flex items-center gap-3">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
              GET
            </span>
            <code className="text-sm text-gray-300">
              /api/files/:id
            </code>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-400">
                Returns the raw file with proper Content-Type header. Use this
                URL to embed images, videos, or link files directly. URLs never
                expire.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Response Headers
              </h3>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>
                  <code className="text-yellow-400">Content-Type</code>: File
                  MIME type
                </li>
                <li>
                  <code className="text-yellow-400">Content-Length</code>: File
                  size in bytes
                </li>
                <li>
                  <code className="text-yellow-400">Cache-Control</code>:
                  public, max-age=31536000, immutable
                </li>
                <li>
                  <code className="text-yellow-400">Content-Disposition</code>:
                  inline
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Usage in HTML
              </h3>
              <pre className="bg-gray-950 rounded p-3 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {`<!-- Embed image -->
<img src="https://your-domain.com/api/files/FILE_ID" />

<!-- Embed video -->
<video src="https://your-domain.com/api/files/FILE_ID" controls />

<!-- Download link -->
<a href="https://your-domain.com/api/files/FILE_ID">Download</a>`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* List Files */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">
          List All Files
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-800 flex items-center gap-3">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
              GET
            </span>
            <code className="text-sm text-gray-300">/api/files</code>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                cURL Example
              </h3>
              <pre className="bg-gray-950 rounded p-3 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {`curl https://your-domain.com/api/files`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Success Response <span className="text-green-400">(200 OK)</span>
              </h3>
              <pre className="bg-gray-950 rounded p-3 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {JSON.stringify(
                    {
                      success: true,
                      count: 2,
                      data: [
                        {
                          id: "550e8400-...",
                          originalName: "photo.png",
                          mimeType: "image/png",
                          size: 245632,
                          uploadedAt: "2025-01-15T10:30:00.000Z",
                          url: "https://your-domain.com/api/files/550e8400-...",
                          directUrl:
                            "https://your-domain.com/api/files/550e8400-...",
                          noExpiration: true,
                        },
                      ],
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Notes</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
            <li>All uploaded files are stored permanently with no expiration</li>
            <li>Maximum file size is 100MB per upload</li>
            <li>All file types are accepted</li>
            <li>
              Files are served with appropriate Content-Type headers for
              inline viewing
            </li>
            <li>
              Cache-Control headers are set to immutable for optimal
              performance
            </li>
            <li>
              Each file gets a unique UUID-based URL
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
