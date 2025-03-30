import Link from "next/link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center bg-[#f9f9f9] py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="Zalora Logo"
            className="h-8 mx-auto mb-6"
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
