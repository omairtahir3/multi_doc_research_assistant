import './globals.css'

export const metadata = {
  title: 'Multi-Doc Research Assistant',
  description: 'Ask questions about your PDF documents using AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 antialiased">{children}</body>
    </html>
  )
}