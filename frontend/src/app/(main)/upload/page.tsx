"use client";

import { useState } from "react";
import { UploadDocumentDto } from "@/@types/document.type";
import FileUploadStep from "@/components/upload/FileUploadStep";
import FileDetailsStep from "@/components/upload/FileDetailsStep";
import UploadDoneStep from "@/components/upload/UploadDoneStep";
import { toast } from "react-hot-toast";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const steps = [
  { id: 1, name: "Chọn file", icon: CloudArrowUpIcon },
  { id: 2, name: "Thông tin", icon: DocumentTextIcon },
  { id: 3, name: "Hoàn tất", icon: CheckCircleIcon },
];

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<Partial<UploadDocumentDto>[]>([]);

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setMetadata(Array(acceptedFiles.length).fill({}));
    setStep(2);
  };

  const handleDetailsSubmit = () => {
    for (const meta of metadata) {
      if (!meta.title || !meta.subject) {
        toast.error(
          "Vui lòng điền đầy đủ Môn học và Tiêu đề cho tất cả các file!",
        );
        return;
      }
    }
    setStep(3);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <FileUploadStep onFilesAccepted={handleFilesAccepted} />;
      case 2:
        return (
          <FileDetailsStep
            files={files}
            metadata={metadata}
            setMetadata={setMetadata}
            onSubmit={handleDetailsSubmit}
          />
        );
      case 3:
        return (
          <UploadDoneStep
            files={files}
            metadata={metadata as UploadDocumentDto[]}
          />
        );
      default:
        return <FileUploadStep onFilesAccepted={handleFilesAccepted} />;
    }
  };

  return (
    <main className="flex-1 bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chia sẻ tài liệu</h1>
          <p className="mt-2 text-gray-500">
            Tải lên tài liệu học tập để chia sẻ với cộng đồng sinh viên
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-24 h-0.5 mx-4 mb-6 transition-colors ${
                        step > s.id ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {renderStep()}
        </div>
      </div>
    </main>
  );
}
