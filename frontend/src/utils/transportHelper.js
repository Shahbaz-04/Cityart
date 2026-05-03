const transportData = {
  bihar: {
    stateName: 'Bihar',
    days: '5-7',
    charge: 50,
    transports: [
      { id: 'delhivery-bih', name: 'Delhivery', icon: '📦', contact: '+91-7070777770' },
      { id: 'bluedart-bih', name: 'Blue Dart', icon: '🚚', contact: '+91-9711222333' },
      { id: 'fedex-bih', name: 'FedEx India', icon: '🚁', contact: '+91-8527771111' },
      { id: 'shiprocket-bih', name: 'ShipRocket', icon: '📮', contact: '+91-8448444422' },
    ],
  },
  jharkhand: {
    stateName: 'Jharkhand',
    days: '5-7',
    charge: 60,
    transports: [
      { id: 'delhivery-jk', name: 'Delhivery', icon: '📦', contact: '+91-7070777770' },
      { id: 'allcargo-jk', name: 'Allcargo Gati', icon: '🚚', contact: '+91-9555444222' },
      { id: 'ecom-jk', name: 'Ecom Express', icon: '📮', contact: '+91-9611222444' },
      { id: 'xpressbees-jk', name: 'XpressBees', icon: '🚁', contact: '+91-7022999222' },
    ],
  },
};

export const getTransportData = (pincode) => {
  if (!pincode || typeof pincode !== 'string') return null;
  const cleaned = pincode.trim();
  if (!/^[0-9]{6}$/.test(cleaned)) return null;
  const first2 = parseInt(cleaned.substring(0, 2), 10);

  if (first2 >= 80 && first2 <= 85) {
    return transportData.bihar;
  }
  if (first2 >= 81 && first2 <= 83) {
    return transportData.jharkhand;
  }
  return null;
};
