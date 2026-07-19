import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-[64px]">{children}</main>
      <Footer />
    </>
  );
}
