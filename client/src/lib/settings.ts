// Settings and configuration for the EcommercePro application

// Valid pincodes for delivery
export const VALID_PINCODES = [
    '400001', '400002', '400003', '400004', '400005', '400006', '400007', '400008', '400009', '400010',
    '500001', '500002', '500003', '500004', '500005', '500006', '500007', '500008', '500009', '500010',
    '600001', '600002', '600003', '600004', '600005', '600006', '600007', '600008', '600009', '600010',
    '700001', '700002', '700003', '700004', '700005', '700006', '700007', '700008', '700009', '700010'
  ];
  
  // Delivery estimation settings
  export const DELIVERY_ESTIMATION_DAYS = {
    SAME_DAY_CUTOFF_HOUR: 14, // 2 PM cutoff for same day processing
    STANDARD_DAYS: 3, // Standard delivery estimation
    FAST_DAYS: 1 // Fast delivery for certain pincodes
  };
  