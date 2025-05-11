import Image from "next/image";
import { Button } from "../components/Button";

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center">
        {/* Actual logo */}
        <div className="mb-6">
          <Image src="/logo.png" alt="Wisedom.ai logo" width={128} height={128} className="mx-auto rounded-full" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Wisedom.ai</h1>
        <p className="text-xl mb-8 font-medium">Transform Your Network into a Strategic Advantage</p>
        <Button asChild size="lg" className="px-8 py-4 text-lg">
          <a href="https://app.wisedom.ai">Launch App</a>
        </Button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted">
        <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">AI-Driven Insights</h3>
            <p>Leverage artificial intelligence to uncover hidden opportunities and strengthen your relationships.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Contact Management</h3>
            <p>Organize, search, and visualize your network with powerful contact and relationship management tools.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Task Management</h3>
            <p>Stay productive with integrated task tracking, reminders, and project management features.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Boost Productivity</h3>
            <p>Streamline your workflow and focus on what matters most with smart automation and insights.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Strengthen Relationships</h3>
            <p>Build deeper, more meaningful connections with data-driven recommendations and reminders.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Make Informed Decisions</h3>
            <p>Access actionable analytics to guide your networking and business strategies.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-muted">
        <h2 className="text-2xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card p-6 rounded-lg shadow">
            <p className="italic mb-2">“Wisedom.ai helped me reconnect with key contacts and close more deals than ever before.”</p>
            <span className="font-semibold">– Alex, Sales Leader</span>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <p className="italic mb-2">“The AI insights are a game changer for my networking and business growth.”</p>
            <span className="font-semibold">– Jamie, Entrepreneur</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to unlock your network's full potential?</h2>
        <Button asChild size="lg" className="px-8 py-4 text-lg">
          <a href="https://app.wisedom.ai">Launch App</a>
        </Button>
      </section>
    </div>
  );
}
