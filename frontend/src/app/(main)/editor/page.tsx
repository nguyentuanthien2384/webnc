import JsonBlockEditor from "@/components/editor/JsonBlockEditor";
import RoleGuard from "@/components/auth/RoleGuard";

export default function EditorPage() {
  return <RoleGuard allowedRoles={["USER", "MODERATOR", "ADMIN"]} requiredPermission="drafts.manage_own">
    <JsonBlockEditor />
  </RoleGuard>;
}
