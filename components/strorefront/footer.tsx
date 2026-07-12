import Link from "next/link";
import {
  MessageCircle,
  MapPin,
  ShieldCheck,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP ?? "#";
  const location = process.env.NEXT_PUBLIC_SHOP_LOCATION ?? "Assam, India";
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? "Smart Deal";

  const maps = process.env.NEXT_PUBLIC_GOOGLE_MAPS;
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM;
  const youtube = process.env.NEXT_PUBLIC_YOUTUBE;
  const twitter = process.env.NEXT_PUBLIC_X;

  return (
    <footer className="mt-14 border-t border-black/5 bg-[#E8DDD0] text-ink">
      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="text-ink font-bold text-lg tracking-tight">
            Smart<span className="text-accent">Deal</span>
          </h3>

          <p className="mt-2 text-sm text-ink-muted leading-relaxed">
            SmartDeal is a trust-first marketplace for certified second-hand
            phones, laptops, tablets and accessories. Every listing is
            inspected, graded, and backed by warranty.
          </p>
        </div>

        {/* Shop
        <div>
          <h4 className="text-ink font-semibold mb-3">Shop</h4>

          <ul className="space-y-2 text-sm text-ink-muted">
            <li>
              <Link
                href="/"
                className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                href="/product"
                className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
              >
                All Products
              </Link>
            </li>

            <li>
              <Link
                href="/cart"
                className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
              >
                Cart
              </Link>
            </li>
          </ul>
        </div> */}

        <div>
          <h4 className="text-ink font-semibold mb-3">Follow Us</h4>

          <ul className="space-y-3 text-sm">
            {facebook && (
              <li>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <FaFacebook className="text-[#1877F2]" size={20} />
                  <span className="text-ink-muted">Facebook</span>
                </a>
              </li>
            )}

            {instagram && (
              <li>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <FaInstagram className="text-[#E4405F]" size={20} />
                  <span className="text-ink-muted">Instagram</span>
                </a>
              </li>
            )}

            {youtube && (
              <li>
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <FaYoutube className="text-[#FF0000]" size={20} />
                  <span className="text-ink-muted">YouTube</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-ink font-semibold mb-3">Support</h4>

          <ul className="space-y-2 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent" />
              <Link
                href="/warranty"
                className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
              >
                Warranty
              </Link>
            </li>

            <li className="flex items-center gap-2">
              <RotateCcw size={14} className="text-accent" />
              <Link
                href="/returns"
                className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
              >
                Returns
              </Link>
            </li>

            <li className="flex items-center gap-2">
              <HelpCircle size={14} className="text-accent" />
              <Link
                href="/faq"
                className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
              >
                FAQ
              </Link>
            </li>

            <li className="flex items-center gap-2">
              <MessageCircle size={14} className="text-accent" />
              <Link
                href="/contact"
                className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Get in touch */}
        <div>
          <h4 className="text-ink font-semibold mb-3">Get in touch</h4>

          <ul className="space-y-3 text-sm text-ink-muted">
            {/* WhatsApp */}
            <li className="flex items-center gap-2">
              <FaWhatsapp size={16} className="text-green-600" />

              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                {whatsapp}
              </a>
            </li>

            {/* Google Maps */}
            {maps && (
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />

                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink transition-colors"
                >
                  {location}
                </a>
              </li>
            )}

            <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.966139458724!2d91.81103929999999!3d26.132647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a5932ff743577%3A0xa614662cb2da45db!2sSmart%20Deal!5e0!3m2!1sen!2sin!4v1783874900567!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-black/5 text-center py-4 text-xs text-ink-muted">
        © {new Date().getFullYear()} {shopName}. All rights reserved.
      </div>
    </footer>
  );
}
