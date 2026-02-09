import Header from "@/src/components/ui/common/layout/Header"
import Footer from "@/src/components/ui/common/layout/Footer"

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
