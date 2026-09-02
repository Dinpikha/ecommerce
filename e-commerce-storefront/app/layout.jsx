import '../src/styles.css'

export const metadata = {
  title: 'northstar — Objects with a point of view',
  description: 'A considered collection for the way you move through the world.',
}

export default function RootLayout({ children }) {
  return <html lang="en" className="bg-background"><body>{children}</body></html>
}
