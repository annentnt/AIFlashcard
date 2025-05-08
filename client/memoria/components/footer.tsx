import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <Image
                src="/icon.png"
                alt="Memoria logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">Memoria</h3>
              <p className="text-xs text-green-200">Fun learning - Smart memory - Excellent results!</p>
            </div>
          </div>

          <div className="text-sm space-y-1 text-green-100">
            <p>MEMMORIA EDUCATION CO. LTD</p>
            <p>Business Registration No: 0000000</p>
            <p>Address: 127 Nguyen Van CU St, Street, 7 District,</p>
            <p>Ho Chi Minh City</p>
            <p>Email: contact@memoria.edu.vn</p>
            <p>Hotline: +1800-0000</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">For Students</h3>
          <ul className="space-y-2 text-green-100">
            <li>
              <Link href="#" className="hover:text-white">
                High school exam prep
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Flashcards
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Pronunciation
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Download and check
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Online edu.vn
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">App & Social Media</h3>
          <p className="text-green-100 mb-2">Download the app</p>
          <div className="flex gap-2 mb-4">
            <Link href="#" className="block">
              <Image
                src="/google.png"
                alt="Play Store"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <Link href="#" className="block">
              <Image
                src="/appstore.png"
                alt="App Store"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <p className="text-green-100 mb-2">Follow us</p>
          <div className="flex gap-3">
            <Link href="#" className="text-white hover:text-green-200">
              <Facebook size={24} />
            </Link>
            <Link href="#" className="text-white hover:text-green-200">
              <Twitter size={24} />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Privacy Policy</h3>
          <ul className="space-y-2 text-green-100">
            <li>
              <Link href="#" className="hover:text-white">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                All rights reserved
              </Link>
            </li>
          </ul>

          <div className="mt-4">
            <Link href="#">
              <Image
                src="/flashcard_illustration.png"
                alt="Verified"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
