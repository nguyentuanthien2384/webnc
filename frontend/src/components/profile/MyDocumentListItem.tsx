// src/components/profile/MyDocumentListItem.tsx
import { Document } from "@/@types/document.type";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

interface MyDocumentListItemProps {
  doc: Document;
}

export default function MyDocumentListItem({ doc }: MyDocumentListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h3 className="text-lg font-semibold text-blue-700">{doc.title}</h3>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span>{doc.subject?.name || "Uncategorized"}</span>
          <span>•</span>
          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>{doc.downloadCount} downloads</span>
        </div>
      </div>
      <div className="flex gap-4">
        {/* TODO: Thêm onClick cho các nút này */}
        <button className="p-2 rounded-full hover:bg-gray-100">
          <PencilIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <TrashIcon className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </div>
  );
}
