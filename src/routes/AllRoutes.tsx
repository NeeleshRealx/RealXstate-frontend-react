import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContextRealxstate";
import { publicRoutes, authProtectedRoutes } from "./routeConfig";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const AllRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('AllRoutes - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  console.log('AllRoutes - publicRoutes:', publicRoutes);
  console.log('AllRoutes - authProtectedRoutes:', authProtectedRoutes);
  
  if (isLoading) {
    console.log('AllRoutes - showing loading spinner');
    return <LoadingSpinner />;
  }
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Root route with redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/settings" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Routes */}
        {publicRoutes.map((route, idx) => (
          <Route key={idx} path={route.path} element={<route.component />} />
        ))}

        {/* Authenticated Routes - Wrapped in AuthenticatedLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          {authProtectedRoutes
            .map((route, idx) => (
              <Route key={idx} path={route.path} element={<route.component />} />
            ))}
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AllRoutes;
