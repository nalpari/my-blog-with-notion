/**
 * @fileoverview Footer Component
 */

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Blog</h3>
            <p className="text-sm text-user-select-none text-muted-foreground leading-relaxed">
              Sharing insights on web development, design systems, and modern tech stacks.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/posts" className="hover:text-foreground transition-colors">Posts</Link></li>
              <li><Link href="/tags" className="hover:text-foreground transition-colors">Tags</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a></li>
              <li><a href="mailto:hello@example.com" className="hover:text-foreground transition-colors">Email</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} My Blog. All rights reserved.</p>
          <p>Powered by Next.js & Notion</p>
        </div>
      </div>
    </footer>
  )
}
