import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function SustainabilitySection() {
  return (
    <section className="py-12 bg-neutral-cream">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1592136957897-b2b6ca21e10d?ixlib=rb-4.0.3" 
                alt="Sustainable Ayurvedic ingredients" 
                className="w-full rounded-md"
              />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-primary mb-4">Our Commitment to Sustainability</h2>
              <p className="text-neutral-gray mb-4">
                At Kama Ayurveda, we believe in the power of nature and are committed to preserving it. 
                Our products are crafted using sustainably sourced ingredients, eco-friendly packaging, 
                and cruelty-free practices.
              </p>
              <p className="text-neutral-gray mb-6">
                We work directly with local farmers to ensure fair trade practices and support traditional 
                cultivation methods that respect the environment.
              </p>
              <Button 
                asChild
                variant="outline"
                className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-2 px-6 font-medium text-sm transition-colors duration-300"
              >
                <Link href="/sustainability">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
