import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const QRRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the scanner ID from URL params
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScannerData = async () => {
      try {
        const response = await axios.get(`/api/scanners/${id}`);
        const { data, couponCode, productId } = response.data;

        // If there's a coupon code, store it in localStorage to apply it later
        if (couponCode) {
          localStorage.setItem('scannedCouponCode', couponCode);
          toast.success(`Coupon code ${couponCode} applied!`);
        }

        // Redirect to the product page if productId exists, otherwise redirect to a default page
        if (productId) {
          history.push(`/product/${productId}`);
        } else {
          history.push('/');
        }
      } catch (error) {
        console.error('Error fetching scanner data:', error);
        toast.error('Invalid QR code or error occurred.');
        history.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchScannerData();
  }, [id, history]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return null; // This component only handles redirection
};

export default QRRedirect;
