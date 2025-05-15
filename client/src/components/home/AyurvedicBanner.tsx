import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";

export default function AyurvedicBanner() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="bg-neutral-sand bg-opacity-50 p-8 md:p-12 rounded-md">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl text-primary mb-6">The Power of Ancient Ayurvedic Wisdom</h2>
            <p className="text-neutral-gray mb-8">
              Kama Ayurveda products are crafted with authentic ingredients using traditional methods that have been passed down through generations. Each formulation harnesses the natural power of plants to restore balance and enhance beauty.
            </p>
            <Button 
              asChild
              variant="outline"
              className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-3 px-8 font-medium text-sm transition-colors duration-300"
            >
              <Link href="/about-ayurveda">Discover Our Story</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
