import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">LENS</h3>
            <p className="text-muted-foreground">
              Professional photography services capturing your special moments with artistic vision.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-muted-foreground">
              <p>123 Photography Lane</p>
              <p>New York, NY 10001</p>
              <p className="mt-2">contact@lensphotography.com</p>
              <p>(123) 456-7890</p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center text-muted-foreground">
          <p>&copy; {currentYear} LENS Photography. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
