"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect } from "react"

export function HeroSection() {
    useEffect(() => {
        // Unicorn Studio Script Loader
        const loadUnicornScript = () => {
            if (typeof window === 'undefined') return;

            // Check if already loaded/initialized
            if (window.UnicornStudio?.isInitialized) {
                // If the library provides a re-init method, we might call it here if needed.
                // For now, assume it handles itself or we rely on the initial load.
                // Some libraries need explicit init on re-mounts.
                if (typeof window.UnicornStudio.init === 'function') {
                    window.UnicornStudio.init();
                }
                return;
            }

            if (!window.UnicornStudio) {
                window.UnicornStudio = { isInitialized: false, init: () => { } };
            }

            const scriptId = 'unicorn-studio-script';
            if (document.getElementById(scriptId)) return;

            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js";
            script.onload = function () {
                if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
                    window.UnicornStudio.init();
                    window.UnicornStudio.isInitialized = true;
                }
            };
            document.head.appendChild(script);
        };

        loadUnicornScript();

        // Cleanup not strictly necessary for a global script, 
        // but good to keep in mind if we need to destroy the instance.
    }, [])

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Unicorn Studio Background - Made more visible */}
            <div
                data-us-project="igp6pVvQBexHU1oK7UpY"
                className="absolute inset-0 -z-30 w-full h-full"
                style={{ opacity: 0.8 }}
            />

            {/* Overlay Gradient/Grid - Reduced opacity to let Unicorn shine through */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-background/5 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <div className="absolute top-0 z-[-10] h-screen w-screen bg-background/20 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4 max-w-3xl"
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                            Sharing thoughts on <br />
                            <span className="text-primary block mt-2">Design & Development</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                            Explore the latest insights, tutorials, and trends in modern web development.
                            Built with Next.js, optimized for performance.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Button size="lg" className="h-12 px-8 rounded-full text-base" asChild>
                            <Link href="/posts">
                                Start Reading <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 rounded-full text-base bg-background/50 backdrop-blur-sm" asChild>
                            <Link href="/tags">
                                Browse Tags
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
