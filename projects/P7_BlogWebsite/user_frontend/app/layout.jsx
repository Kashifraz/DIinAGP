import './globals.css'

export const metadata = {
  title: 'Blog Platform - Read, Discover, Learn',
  description: 'A modern blog platform with engaging content',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

