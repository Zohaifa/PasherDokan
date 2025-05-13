export const normalizeShopData = (shopData: any) => {
  // If the shop data is already in the expected format, return it
  if (shopData && shopData.location && 
      typeof shopData.location.latitude === 'number' && 
      typeof shopData.location.longitude === 'number') {
    return {
      ...shopData,
      shopType: shopData.shopType || shopData.type // Handle both property names
    };
  }
  
  // Convert from MongoDB GeoJSON format
  if (shopData && shopData.location && 
      shopData.location.type === 'Point' && 
      Array.isArray(shopData.location.coordinates)) {
    return {
      _id: shopData._id,
      name: shopData.name,
      shopType: shopData.type || shopData.shopType,
      location: {
        longitude: shopData.location.coordinates[0],
        latitude: shopData.location.coordinates[1]
      }
    };
  }
  
  // If neither format matches, return original data with warning
  console.warn('Unknown shop data format:', shopData);
  return shopData;
};