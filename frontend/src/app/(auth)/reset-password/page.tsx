import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { referrer: "no-referrer" as const };

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ""} />;
}
