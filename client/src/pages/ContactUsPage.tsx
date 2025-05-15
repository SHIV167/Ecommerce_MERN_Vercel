import React, { useState, FormEvent } from 'react';
import { Link } from 'wouter';
import { FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [mobile, setMobile] = useState('');
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState('');
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, country, mobile, comments }),
      });
      if (res.ok) {
        setStatus('Thank you for contacting us!');
        setName(''); setEmail(''); setCountry(''); setMobile(''); setComments('');
      } else throw new Error();
    } catch {
      setStatus('Submission failed. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-5xl bg-white border border-gray-200 p-8">
        <h1 className="text-3xl font-serif font-bold text-center mb-2 tracking-wide">Contact us</h1>
        <p className="text-center text-gray-500 text-sm mb-6 font-normal">Kama Ayurveda Private Limited<br />Registered Office: 3K, Jangpura Extension, Commercial Circle, New Delhi 110014<br />CIN: U24233DL2001PTC112006<br />Business Hours - 10 AM - 7 PM IST (All Days)<br />For Grievances, please contact Mr. Rajat Anand.</p>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-10 w-full">
          {/* Call */}
          <div className="flex-1 flex flex-col items-center bg-white border border-gray-200 p-8 mx-2 min-w-[180px] max-w-[260px]">
            <FiPhone className="text-5xl text-[#c05a36] mb-3" />
            <div className="font-bold text-base mb-2 font-sans">18001232031</div>
            <a href="tel:18001232031" className="w-full"><button className="w-full bg-black text-white py-2 text-base font-bold mt-2 transition-none rounded-none">Call</button></a>
          </div>
          {/* Email */}
          <div className="flex-1 flex flex-col items-center bg-white border border-gray-200 p-8 mx-2 min-w-[180px] max-w-[260px]">
            <FiMail className="text-5xl text-[#c05a36] mb-3" />
            <div className="font-bold text-base mb-2 font-sans">Care@Kamaayurveda.In</div>
            <a href="mailto:care@kamaayurveda.in" className="w-full"><button className="w-full bg-black text-white py-2 text-base font-bold mt-2 transition-none rounded-none">Email</button></a>
          </div>
          {/* Chat */}
          <div className="flex-1 flex flex-col items-center bg-white border border-gray-200 p-8 mx-2 min-w-[180px] max-w-[260px]">
            <FiMessageCircle className="text-5xl text-[#c05a36] mb-3" />
            <div className="font-bold text-base mb-2 font-sans">Chat With Us</div>
            <Link href="/chat" className="w-full"><button className="w-full bg-black text-white py-2 text-base font-bold mt-2 transition-none rounded-none">Chat</button></Link>
          </div>
          {/* WhatsApp */}
          <div className="flex-1 flex flex-col items-center bg-white border border-gray-200 p-8 mx-2 min-w-[180px] max-w-[260px]">
            <FaWhatsapp className="text-5xl text-[#c05a36] mb-3" />
            <div className="font-bold text-base mb-2 font-sans">Reach Out On WhatsApp</div>
            <a href="https://wa.me/918001232031" target="_blank" rel="noopener noreferrer" className="w-full"><button className="w-full bg-black text-white py-2 text-base font-bold mt-2 transition-none rounded-none">Whatsapp</button></a>
          </div>
        </div>
        <div className="border-t border-gray-200 my-8"></div>
        <div>
          <h2 className="text-lg font-serif font-bold mb-2">For product related & other queries</h2>
          <p className="text-gray-500 text-sm mb-4 font-normal">Please submit your question below and we will respond within 48hrs</p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 font-sans">Name*</label>
              <input value={name} onChange={e=>setName(e.target.value)} type="text" required className="border p-2 rounded-none w-full focus:outline-none focus:ring-2 focus:ring-primary font-sans" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 font-sans">Registered Email ID*</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="border p-2 rounded-none w-full focus:outline-none focus:ring-2 focus:ring-primary font-sans" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 font-sans">Country*</label>
              <select value={country} onChange={e=>setCountry(e.target.value)} required className="border p-2 rounded-none w-full focus:outline-none focus:ring-2 focus:ring-primary font-sans">
                <option value="">Select Country*</option>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                {/* add more countries as needed */}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 font-sans">Mobile Number*</label>
              <div className="flex">
                <span className="inline-flex items-center px-2 bg-gray-100 border border-r-0 border-gray-300 rounded-none">+91</span>
                <input value={mobile} onChange={e=>setMobile(e.target.value)} type="tel" required className="border p-2 rounded-none w-full focus:outline-none focus:ring-2 focus:ring-primary font-sans" />
              </div>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 font-medium text-gray-700 font-sans">Comments/queries*</label>
              <textarea value={comments} onChange={e=>setComments(e.target.value)} required className="border p-2 rounded-none w-full h-24 focus:outline-none focus:ring-2 focus:ring-primary font-sans" />
            </div>
            <div className="md:col-span-2 flex flex-col items-center">
              <button type="submit" className="bg-black text-white px-8 py-2 rounded-none mt-2 text-lg font-bold transition-none w-full md:w-1/2">Submit</button>
              {status && <p className="mt-2 text-green-600 font-sans">{status}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
