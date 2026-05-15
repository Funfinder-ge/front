// Base URL for images
export const IMAGE_BASE_URL = "https://base.funfinder.ge/uploads/service_images/";

// Default image for activities without images
export const DEFAULT_ACTIVITY_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80";

/**
 * Helper function to get full image URL from any image data source.
 * Handles null, undefined, literal "undefined" string, absolute URLs, and relative paths.
 * 
 * @param {string|null|undefined} image - The image URL or filename
 * @param {string} fallback - Optional custom fallback image URL
 * @returns {string} The resolved image URL
 */
export const getImageUrl = (image, fallback = DEFAULT_ACTIVITY_IMAGE) => {
  // Handle falsy values and literal 'undefined' or 'null' strings
  if (!image || image === "undefined" || image === "null") {
    return fallback;
  }

  // Convert to string if it's an object or other type
  const imageStr = typeof image === "string" ? image : String(image);

  // Still check for stringified 'undefined'/'null' after conversion
  if (imageStr === "undefined" || imageStr === "null") {
    return fallback;
  }

  // If it's already a full URL (starts with http:// or https://), return as is
  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
    return imageStr;
  }

  // If it starts with '/', use the domain + path
  if (imageStr.startsWith("/")) {
    return "https://base.funfinder.ge" + imageStr;
  }

  // Otherwise, prepend the base URL
  return IMAGE_BASE_URL + imageStr;
};
