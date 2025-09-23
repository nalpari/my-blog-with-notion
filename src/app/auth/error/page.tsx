import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const message = params.message || 'An authentication error occurred'

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>{decodeURIComponent(message)}</AlertDescription>
      </Alert>

      <div className="mt-6 flex flex-col gap-4">
        <Button asChild className="w-full">
          <Link href="/">
            Return to Home
          </Link>
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>Common causes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Google account permissions denied</li>
            <li>Pop-up blocker preventing authentication</li>
            <li>Session expired or invalid</li>
          </ul>
        </div>
      </div>
    </div>
  )
}