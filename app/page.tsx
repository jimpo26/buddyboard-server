import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Star } from "lucide-react"
import { MobileAppButton } from "@/components/mobile-app-buttons"
import Image from "next/image"

export default function LandingPage() {
    const APKUrl = process.env.APK_URL!
    const IOSUrl = process.env.IOS_URL!
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
            <section className="py-2 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 relative overflow-hidden m-auto">
                <Image src="/logo.png" width={200} height={100} alt="BuddyBoard Logo" className="m-auto" />
            </section>
            {/* Hero Section */}
            <section className="relative overflow-hidden px-4 py-16 md:py-24">
                <div className="absolute inset-0 pointer-events-none">
                    <Star className="absolute top-20 left-10 w-6 h-6 text-emerald-400 animate-pulse" />
                    <Star className="absolute top-32 right-16 w-4 h-4 text-emerald-300 animate-bounce" />
                    <Star className="absolute bottom-40 left-20 w-5 h-5 text-emerald-500 animate-pulse" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="mb-8">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mb-4 px-4 py-2 text-sm font-medium">
                            🎯 Track Together, Achieve More
                        </Badge>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                        Your Activity Journey
                        <br />
                        <span className="relative inline-block">
                            <span className="relative z-10">Gets Better</span>
                            {/* Wavy highlight behind text */}
                            <svg className="absolute inset-0 w-full h-full -z-0" viewBox="0 0 300 60" fill="none">
                                <path
                                    d="M10 30 Q75 10 150 30 T290 30"
                                    stroke="rgb(16 185 129)"
                                    strokeWidth="8"
                                    fill="none"
                                    opacity="0.3"
                                />
                            </svg>
                        </span>
                        <br />
                        <span className="text-primary">With Friends!</span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                        Join groups, track any activity together, stay motivated, and
                        <span className="relative inline-block mx-2">
                            <span className="relative z-10 font-semibold text-primary">analyze your progress</span>
                            {/* Squiggly underline */}
                            <svg className="absolute bottom-0 left-0 w-full h-3" viewBox="0 0 100 10" fill="none">
                                <path d="M2 6 Q25 2 50 6 T98 6" stroke="rgb(52 211 153)" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                        like never before.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12" id="download">
                        <MobileAppButton iosUrl={IOSUrl} apkUrl={APKUrl} />
                        <Button
                            size="lg"
                            className="hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            📱 Get the App
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="hidden border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
                        >
                            🎥 Watch Demo
                        </Button>
                    </div>

                    {/* Phone mockup */}
                    <div className="relative mx-auto w-fit h-96 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-3xl p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                            <Image
                                src="/example.PNG"
                                alt="Activity Tracker App Interface"
                                className="h-full object-cover"
                                width={190}
                                height={100}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Why Choose
                            <span className="relative inline-block ml-2">
                                <span className="relative z-10 text-primary">BuddyBoard?</span>
                                {/* Curved highlight */}
                                <svg className="absolute inset-0 w-full h-full -z-0" viewBox="0 0 200 40" fill="none">
                                    <ellipse cx="100" cy="20" rx="90" ry="15" fill="rgb(16 185 129)" opacity="0.2" />
                                </svg>
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Transform any activity into a social experience with smart tracking and group motivation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="relative overflow-hidden border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg group">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Track Together</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Create and join groups to track activities with friends, family, or teammates in real-time.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg group">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Stay Motivated</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Get inspired by your group&apos;s achievements. Friendly competition and support keep you pushing forward
                                    every day.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg group">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Analyze Progress</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Smart insights and beautiful charts help you understand your activity patterns and optimize your
                                    performance.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-emerald-50 to-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Our
                            <span className="relative inline-block ml-2">
                                <span className="relative z-10 text-primary">Roadmap</span>
                                {/* Curved highlight */}
                                <svg className="absolute inset-0 w-full h-full -z-0" viewBox="0 0 200 40" fill="none">
                                    <ellipse cx="100" cy="20" rx="90" ry="15" fill="rgb(16 185 129)" opacity="0.2" />
                                </svg>
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Exciting features coming soon to make your activity tracking experience even better
                        </p>
                    </div>

                    {/* Timeline roadmap with connecting line */}
                    <div className="relative">
                        {/* Central connecting line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-emerald-500 to-emerald-300 rounded-full hidden md:block"></div>

                        {/* Timeline Item 1 - Left */}
                        <div className="flex flex-col md:flex-row items-center mb-16 md:mb-24 relative">
                            <div className="md:w-1/2 md:pr-12 md:text-right mb-8 md:mb-0">
                                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl">
                                    <div className="inline-block p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full text-white mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">Advanced Analytics</h3>
                                    <p className="text-muted-foreground">
                                        Beautiful interactive charts to visualize your personal and group statistics, with deep insights into your progress and patterns.
                                    </p>
                                    <Badge className="mt-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Coming Q3 2025</Badge>
                                </div>
                            </div>

                            {/* Circle marker on timeline */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 md:flex items-center justify-center hidden">
                                <div className="w-8 h-8 bg-white rounded-full border-4 border-emerald-500 z-10"></div>
                            </div>

                            {/* Empty right side */}
                            <div className="md:w-1/2 md:pl-12"></div>
                        </div>

                        {/* Timeline Item 2 - Right */}
                        <div className="flex flex-col md:flex-row items-center mb-16 md:mb-24 relative">
                            {/* Empty left side */}
                            <div className="md:w-1/2 md:pr-12"></div>

                            {/* Circle marker on timeline */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 md:flex items-center justify-center hidden">
                                <div className="w-8 h-8 bg-white rounded-full border-4 border-emerald-500 z-10"></div>
                            </div>

                            <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
                                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl">
                                    <div className="inline-block p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full text-white mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">Achievements System</h3>
                                    <p className="text-muted-foreground">
                                        Earn special badges and rewards by using the app regularly and completing your activities, unlocking new milestones on your journey.
                                    </p>
                                    <Badge className="mt-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Coming Q3 2025</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Item 3 - Left */}
                        <div className="flex flex-col md:flex-row items-center relative">
                            <div className="md:w-1/2 md:pr-12 md:text-right mb-8 md:mb-0">
                                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl">
                                    <div className="inline-block p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full text-white mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">Smart Reminders</h3>
                                    <p className="text-muted-foreground">
                                        Personalized notification system that learns your habits and sends timely reminders to keep you on track with your group activities.
                                    </p>
                                    <Badge className="mt-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Coming Q4 2025</Badge>
                                </div>
                            </div>

                            {/* Circle marker on timeline */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 md:flex items-center justify-center hidden">
                                <div className="w-8 h-8 bg-white rounded-full border-4 border-emerald-500 z-10"></div>
                            </div>

                            {/* Empty right side */}
                            <div className="md:w-1/2 md:pl-12"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <Star className="absolute top-10 left-10 w-8 h-8 text-emerald-300 animate-spin" />
                    <Star className="absolute bottom-10 right-10 w-6 h-6 text-emerald-300 animate-pulse" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your
                        <span className="relative inline-block ml-2">
                            <span className="relative z-10">Activity Journey?</span>
                            {/* Wavy underline */}
                            <svg className="absolute bottom-0 left-0 w-full h-3" viewBox="0 0 200 12" fill="none">
                                <path d="M5 8 Q50 4 100 8 T195 8" stroke="white" strokeWidth="3" fill="none" opacity="0.7" />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of users who are already crushing their activity goals together!
                    </p>
                    <Link href="#download">
                        <Button
                            size="lg"
                            className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            🚀 Download Now - It&apos;s Free!
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 bg-gray-50 text-center">
                <p className="text-muted-foreground">
                    © {new Date().getFullYear()} BuddyBoard. Made with ❤️ by <Link target="_blank" href="https://github.com/jimpo26"><Button variant="link" style={{ padding: 0 }} className="text-emerald-700">jimpo26</Button></Link>.
                </p>
            </footer>
        </div>
    )
}
