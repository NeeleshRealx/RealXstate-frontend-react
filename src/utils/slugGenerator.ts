export const generateSlug = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

export const validateSlugAvailability = async (slug: string): Promise<boolean> => {
  // Simulate API call to check slug availability
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock some taken slugs
      const takenSlugs = ['mcdonalds', 'starbucks', 'subway', 'test'];
      resolve(!takenSlugs.includes(slug.toLowerCase()));
    }, 500);
  });
};