import "../globals.css";
import Navbar from "@/components/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white">
      <Navbar />
      {children}
    </div>
  );
}
