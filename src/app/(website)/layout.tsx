import AuthContext from 'app/AuthContext'

import { Libre_Bodoni } from '@next/font/google'
import 'styles/tailwind.css'
import 'focus-visible'
import { Header } from 'components/Header'
import { Footer } from 'components/Footer'
import { AnalyticsWrapper } from 'components/Analytics'

type AppProps = {
  children: React.ReactNode
}

const font = Libre_Bodoni({ subsets: ['latin'] })

export default function RootLayout({ children }: AppProps) {
  return (
    <html lang="en">
      <body className={font.className}>
        <div className="fixed inset-0 flex justify-center sm:px-8">
          <div className="flex w-full max-w-7xl lg:px-8">
            <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
          </div>
        </div>

        <AuthContext>
          <div className="relative">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </AuthContext>
        <AnalyticsWrapper />
      </body>
    </html>
  )
}
