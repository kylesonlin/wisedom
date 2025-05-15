export const imageConfig = {
  // Default image sizes for responsive images
  sizes: {
    thumbnail: {
      width: 150,
      height: 150,
      quality: 80,
    },
    medium: {
      width: 400,
      height: 400,
      quality: 85,
    },
    large: {
      width: 800,
      height: 800,
      quality: 90,
    },
  },
  
  // Image formats to generate
  formats: ['webp', 'avif', 'jpeg'] as const,
  
  // Default loading strategy
  loading: 'lazy' as const,
  
  // Default placeholder strategy
  placeholder: 'blur' as const,
  
  // Cache duration in seconds
  cacheDuration: 60 * 60 * 24 * 7, // 1 week
  
  // Maximum image size in bytes
  maxSize: 1024 * 1024 * 5, // 5MB
}; 