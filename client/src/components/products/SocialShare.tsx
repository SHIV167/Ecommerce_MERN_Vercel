import React from "react";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaLinkedinIn } from "react-icons/fa";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

export default function SocialShare({ url, title, description, image }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || "");
  const encodedImage = encodeURIComponent(image || "");

  const shareLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF size={24} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: <FaTwitter size={24} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={24} />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn size={24} />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}&source=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex gap-4 mt-4">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${link.name}`}
          className="text-primary hover:text-primary-dark"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
