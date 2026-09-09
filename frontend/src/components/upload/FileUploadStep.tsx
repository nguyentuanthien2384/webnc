"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";

interface FileUploadStepProps {
  onFilesAccepted: (files: File[]) => void;
}

export default function FileUploadStep({ onFilesAccepted }: FileUploadStepProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 100 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
          isDragActive ? "bg-blue-100" : "bg-gray-100"
        }`}>
          <CloudArrowUpIcon className={`w-10 h-10 transition-colors ${
            isDragActive ? "text-blue-600" : "text-gray-400"
          }`} />
        </div>
        {isDragActive ? (
          <p className="text-lg font-semibold text-blue-600">Thả file vào đây...</p>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-700">
              Kéo thả file vào đây
            </p>
            <p className="mt-2 text-sm text-gray-500">
              hoặc{" "}
              <span className="text-blue-600 font-medium hover:underline">
                nhấn để chọn file
              </span>
            </p>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <DocumentIcon className="w-4 h-4" />
          <span>PDF, DOC, DOCX</span>
        </div>
        <span className="w-1 h-1 bg-gray-300 rounded-full" />
        <span>Tối đa 100MB mỗi file</span>
      </div>
    </div>
  );
}
