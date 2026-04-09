import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">

      <body>

        <nav className="flex justify-between p-4 border-b">

          <h1 className="font-bold">
            Workspace Manager
          </h1>

          <div className="flex gap-4">

            <a href="/login">Login</a>

            <a href="/register">Register</a>
            

          </div>

        </nav>

        <main className="p-6">
          {children}
        </main>

      </body>

    </html>
  )
}