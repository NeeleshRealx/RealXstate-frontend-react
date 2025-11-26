# 🚀 **Complete API Integration Guide**

This guide documents the complete integration of the frontend with all backend APIs for the Serv-AI application.

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Business Management APIs](#business-management-apis)
4. [Menu Management APIs](#menu-management-apis)
5. [Table Management APIs](#table-management-apis)
6. [Settings & Configuration APIs](#settings--configuration-apis)
7. [Error Handling & Fallbacks](#error-handling--fallbacks)
8. [Type Safety & Data Conversion](#type-safety--data-conversion)
9. [Testing & Development](#testing--development)

## 🌟 **Overview**

The frontend now fully integrates with all backend APIs, providing:
- **Real-time data synchronization** with the backend
- **Type-safe API calls** with proper error handling
- **Automatic data conversion** between API and UI formats
- **Comprehensive fallback mechanisms** for offline scenarios
- **User-friendly feedback** with toast notifications

## 🔐 **Authentication & Authorization**

### **Service:** `authService.ts`
- **Login:** `POST /public/business/login`
- **Signup:** `POST /public/business/signup`
- **Profile:** `GET /user/me`
- **Logout:** `POST /business/user/logout`
- **Token Refresh:** `POST /business/user/refresh`

### **Features:**
- Cookie-based token storage
- Automatic token refresh
- Development mode with hardcoded token
- Persistent login state

## 🏢 **Business Management APIs**

### **Service:** `businessProfileService.ts`
- **Get Profile:** `GET /business/settings/business-profile`
- **Update Profile:** `PUT /business/settings/business-profile`
- **Logo Upload:** `POST /business/settings/business-profile/logo`
- **Logo Delete:** `DELETE /business/settings/business-profile/logo`

### **Service:** `branchService.ts`
- **List Branches:** `GET /business/settings/branches`
- **Create Branch:** `POST /business/settings/branches`
- **Get Branch:** `GET /business/settings/branches/{id}`
- **Update Branch:** `PUT /business/settings/branches/{id}`
- **Delete Branch:** `DELETE /business/settings/branches/{id}`
- **Get Timezones:** `GET /business/settings/branches/timezones`

### **Features:**
- Full CRUD operations for branches
- Timezone management
- Manager assignment
- Status tracking (active/inactive)

## 🍽️ **Menu Management APIs**

### **Service:** `menuService.ts`
- **Categories:**
  - `GET /business/menu/branches/{branch}/categories`
  - `POST /business/menu/branches/{branch}/categories`
  - `PUT /business/menu/branches/{branch}/categories/{id}`
  - `DELETE /business/menu/branches/{branch}/categories/{id}`
  - `PUT /business/menu/branches/{branch}/categories/reorder`

- **Menu Items:**
  - `GET /business/menu/branches/{branch}/items`
  - `POST /business/menu/branches/{branch}/items`
  - `PUT /business/menu/branches/{branch}/items/{id}`
  - `DELETE /business/menu/branches/{branch}/items/{id}`
  - `GET /business/menu/branches/{branch}/items/search`
  - `GET /business/menu/branches/{branch}/items/stats`
  - `PUT /business/menu/branches/{branch}/items/reorder`
  - `POST /business/menu/branches/{branch}/items/{id}/image`

- **Tags:**
  - `GET /business/menu/branches/{branch}/tags`
  - `POST /business/menu/branches/{branch}/tags`
  - `PUT /business/menu/branches/{branch}/tags/{id}`
  - `DELETE /business/menu/branches/{branch}/tags/{id}`

### **Features:**
- Category management with sorting
- Menu item CRUD with image uploads
- Search and filtering capabilities
- Tag management system
- Statistics and analytics

## 🪑 **Table Management APIs**

### **Service:** `tableService.ts`
- **Tables:**
  - `GET /business/settings/branches/{branch}/tables`
  - `POST /business/settings/branches/{branch}/tables`
  - `POST /business/settings/branches/{branch}/tables/bulk`
  - `GET /business/settings/branches/{branch}/tables/{id}`
  - `PUT /business/settings/branches/{branch}/tables/{id}`
  - `DELETE /business/settings/branches/{branch}/tables/{id}`
  - `GET /business/settings/branches/{branch}/tables/sections`
  - `POST /business/settings/branches/{branch}/tables/{id}/qr-code`

### **Features:**
- Individual and bulk table creation
- Section-based organization
- QR code generation
- Status management
- Branch-specific table management

## ⚙️ **Settings & Configuration APIs**

### **Service:** `openingHoursService.ts`
- **Opening Hours:**
  - `GET /business/settings/branches/{branch}/opening-hours`
  - `PUT /business/settings/branches/{branch}/opening-hours`

- **Special Hours:**
  - `GET /business/settings/branches/{branch}/special-hours`
  - `POST /business/settings/branches/{branch}/special-hours`
  - `POST /business/settings/branches/{branch}/special-hours/bulk`
  - `PUT /business/settings/branches/{branch}/special-hours/{id}`
  - `DELETE /business/settings/branches/{branch}/special-hours/{id}`

### **Service:** `settingsService.ts`
- **Settings Hub:** `GET /business/settings/hub`
- **Permissions:** `GET /business/settings/permissions`

### **Features:**
- Weekly schedule management
- Special hours for holidays/events
- Bulk operations support
- Permission-based access control

## 🛡️ **Error Handling & Fallbacks**

### **Error Types Handled:**
- **401 Unauthorized:** Automatic logout and redirect
- **403 Forbidden:** Permission denied messages
- **404 Not Found:** Resource not found handling
- **422 Validation Error:** Field-specific error messages
- **500 Server Error:** Graceful degradation
- **Network Errors:** Offline mode with cached data

### **Fallback Mechanisms:**
- **Local Storage:** Cached data for offline use
- **Default Values:** Predefined fallback data
- **Retry Logic:** Automatic retry for failed requests
- **User Feedback:** Clear error messages and suggestions

## 🔒 **Type Safety & Data Conversion**

### **Type Conversion System:**
- **API → UI:** Backend data converted to component format
- **UI → API:** Component data converted to backend format
- **Interface Alignment:** Consistent type definitions
- **Validation:** Runtime type checking and validation

### **Example Conversions:**

#### **Branch Data:**
```typescript
// API Format
{
  id: "123",
  name: "Main Branch",
  is_active: true,
  manager: { id: "456", name: "John Doe" }
}

// UI Format
{
  id: "123",
  name: "Main Branch",
  status: "active",
  manager: "John Doe"
}
```

#### **Opening Hours:**
```typescript
// API Format
{
  monday: { is_open: true, time_slots: [{ open: "09:00", close: "17:00" }] }
}

// UI Format
{
  monday: { isOpen: true, slots: [{ start: "09:00", end: "17:00", label: "" }] }
}
```

## 🧪 **Testing & Development**

### **Development Features:**
- **JWT Token Generation:** `php artisan jwt:generate-test`
- **API Testing Utilities:** `ApiTestUtils` class
- **Mock Data Services:** Fallback data for development
- **Error Simulation:** Test error handling scenarios

### **Testing Endpoints:**
- **Auth Test:** `/auth-test` - Authentication system testing
- **Timezone Demo:** `/timezone-demo` - Timezone functionality
- **API Test Utils:** Programmatic API testing

## 📱 **Component Integration Status**

### **✅ Fully Integrated:**
- **Settings.tsx** - Complete API integration
- **MenuCategories.tsx** - Full CRUD operations
- **MenuItems.tsx** - Complete menu management
- **TableSetup.tsx** - Table management with API
- **BusinessProfilePage.tsx** - Profile management
- **OpeningHoursPage.tsx** - Schedule management
- **BranchesPage.tsx** - Branch management

### **🔄 Partially Integrated:**
- **Dashboard.tsx** - Basic integration
- **Profile.tsx** - User profile management

### **📋 Ready for Integration:**
- **Analytics.tsx** - Statistics and reporting
- **NotificationsPage.tsx** - Notification system
- **IntegrationsPage.tsx** - Third-party integrations

## 🚀 **Performance Optimizations**

### **Caching Strategies:**
- **API Response Caching:** 24-hour cache for static data
- **Local State Management:** React state for UI data
- **Optimistic Updates:** Immediate UI feedback
- **Background Sync:** Periodic data refresh

### **Loading States:**
- **Skeleton Loaders:** Placeholder content while loading
- **Progress Indicators:** Visual feedback for operations
- **Lazy Loading:** Component-level code splitting
- **Error Boundaries:** Graceful error handling

## 🔧 **Configuration & Environment**

### **Environment Variables:**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_DEV_ACCESS_TOKEN=your-dev-token

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_DEBUG_MODE=true
```

### **Service Configuration:**
- **Base URL:** Configurable API endpoint
- **Timeout Settings:** Request timeout configuration
- **Retry Logic:** Automatic retry configuration
- **Rate Limiting:** API rate limit handling

## 📊 **Monitoring & Analytics**

### **API Monitoring:**
- **Request/Response Logging:** Detailed API call tracking
- **Error Rate Monitoring:** Failed request tracking
- **Performance Metrics:** Response time measurement
- **Usage Analytics:** API endpoint usage statistics

### **User Experience Metrics:**
- **Loading Times:** Page and component load times
- **Error Rates:** User-facing error frequency
- **Success Rates:** Operation completion rates
- **User Feedback:** Toast notification analytics

## 🔮 **Future Enhancements**

### **Planned Features:**
- **Real-time Updates:** WebSocket integration
- **Offline Mode:** Service worker implementation
- **Advanced Caching:** Redis-based caching
- **API Versioning:** Backward compatibility support

### **Scalability Improvements:**
- **Microservice Architecture:** Service decomposition
- **Load Balancing:** Multiple API endpoint support
- **CDN Integration:** Static asset optimization
- **Database Optimization:** Query performance improvements

## 📚 **Additional Resources**

### **Documentation:**
- [Backend API Documentation](./README-API.md)
- [Timezone Integration Guide](./TIMEZONE_INTEGRATION.md)
- [UUID Conversion Guide](../serv-ai-backend/UUID_TO_INTEGER_CONVERSION.md)

### **Code Examples:**
- [Service Implementation Examples](./src/services/)
- [Component Integration Examples](./src/pages/)
- [Type Definition Examples](./src/types/)

---

## 🎯 **Quick Start**

1. **Setup Environment:** Configure API endpoints and tokens
2. **Install Dependencies:** `npm install`
3. **Start Development:** `npm run dev`
4. **Test APIs:** Use the provided testing utilities
5. **Monitor Integration:** Check console for API call logs

## 🆘 **Support & Troubleshooting**

### **Common Issues:**
- **CORS Errors:** Check backend CORS configuration
- **Authentication Failures:** Verify JWT token validity
- **Type Errors:** Ensure type definitions match backend
- **Network Issues:** Check API endpoint availability

### **Debug Tools:**
- **Browser DevTools:** Network and console monitoring
- **API Test Utils:** Programmatic API testing
- **Error Boundaries:** React error boundary components
- **Toast Notifications:** User feedback system

---

**🎉 The frontend is now fully integrated with all backend APIs, providing a robust, type-safe, and user-friendly experience!**
