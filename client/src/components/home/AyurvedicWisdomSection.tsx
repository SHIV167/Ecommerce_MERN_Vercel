import React from 'react';

const AyurvedicWisdomSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#FCFCF7]" style={{ overflowX: 'hidden' }}>
      <div className="container mx-auto px-4">
        <h2 className="text-center mb-10">
          <span className="font-heading text-2xl text-primary">The Power of Ancient </span>
          <span className="font-heading text-2xl text-primary font-bold">Ayurvedic Wisdom</span>
        </h2>
        
        {/* Feature 01 */}
        <div className="rounded-lg overflow-hidden bg-[#F2F2F2] mb-8 relative" style={{ maxHeight: '400px' }}>
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-2/3">
              <div className="flex items-start mb-4">
                <span className="font-heading text-4xl text-[#3C8D3F] font-bold mr-4">01</span>
                <h3 className="font-heading text-xl text-gray-900 font-bold">Supported By Science, Curated For Perfection</h3>
              </div>
              <p className="text-gray-700">
                At Sheopal's, we believe that modern problems need modern solutions. Thus, 
                we refine Ayurveda with scientific research with the help of leading Ayurvedic 
                practitioners and scientists. All products are made under a license issued by 
                the State Drug Authority by AYUSH, strict quality checking, and supported by 
                science.
              </p>
            </div>
            <div className="md:w-1/3 relative overflow-hidden" style={{ minHeight: '300px' }}>
              <div className="absolute inset-0 flex items-center justify-end">
                <img 
                  src="/uploads/sections/herbs_01.png" 
                  alt="Ayurvedic herbs" 
                  className="h-[400px] w-auto object-contain"
                  style={{ marginRight: '-40px' }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature 02 */}
        <div className="rounded-lg overflow-hidden bg-[#F9F8E8] mb-8 relative" style={{ maxHeight: '400px' }}>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 relative order-2 md:order-1 overflow-hidden" style={{ minHeight: '300px' }}>
              <div className="absolute inset-0 flex items-center justify-start">
                <img 
                  src="/uploads/sections/herbs_02.png" 
                  alt="Natural ingredients" 
                  className="h-[400px] w-auto object-contain"
                  style={{ marginLeft: '-40px' }}
                />
              </div>
            </div>
            <div className="p-8 md:p-12 md:w-2/3 order-1 md:order-2">
              <div className="flex items-start mb-4 justify-end">
                <h3 className="font-heading text-xl text-gray-900 font-bold mr-4 text-right">Not Just Ingredients— We Source The Best of Nature for Ayurvedic Potency</h3>
                <span className="font-heading text-4xl text-[#3C8D3F] font-bold">02</span>
              </div>
              <p className="text-gray-700 text-right">
                Our commitments to purity and potency motivate us to select every herb, not 
                only for its popularity but also for its active benefits and effectiveness. Best 
                source natural herbs and sun-dried and then grinded with traditional grinding 
                method to bring you the best products. All the products are produced under 
                GMP-certified facilities and free from any harmful chemicals.
              </p>
            </div>
          </div>
        </div>
        
        {/* Feature 03 */}
        <div className="rounded-lg overflow-hidden bg-[#B8D8B9] mb-8 relative" style={{ maxHeight: '400px' }}>
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-2/3">
              <div className="flex items-start mb-4">
                <span className="font-heading text-4xl text-[#3C8D3F] font-bold mr-4">03</span>
                <h3 className="font-heading text-xl text-gray-900 font-bold">Ayurveda is Not Just a Medicine, It's a Way of Living</h3>
              </div>
              <p className="text-gray-700">
                Get expert advice, curated fitness plan according to your body type with 
                personalized diet and guided wellness practice to enhance the effectiveness of 
                Ayurveda. Ayurveda takes 90 days to transform your health.
              </p>
            </div>
            <div className="md:w-1/3 relative overflow-hidden" style={{ minHeight: '300px' }}>
              <div className="absolute inset-0 flex items-center justify-end">
                <img 
                  src="/uploads/sections/herbs_03.png" 
                  alt="Ayurvedic lifestyle" 
                  className="h-[400px] w-auto object-contain"
                  style={{ marginRight: '-40px' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <h3 className="font-heading text-xl text-primary mb-4">Sheopal's— Where Ayurvedic Excellence Meets Scientific Assistance</h3>
          <p className="text-gray-700 max-w-3xl mx-auto">
            At Sheopal's, we put your health as our top priority and believe that wellness starts with nature; thus, our Ayurvedic formulations are designed to harmonize mind, body, and soul, delivering the best-sourced natural benefits to your doorsteps. Experts at Sheopal's work day and night to combine centuries-old Ayurvedic excellence with modern science to create the best of Ayurveda, which is safe, gentle, effective, and rooted in the ancient wisdom of traditional medicine.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AyurvedicWisdomSection;
