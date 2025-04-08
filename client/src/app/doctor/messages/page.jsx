"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import ChatRequestsList from "@/components/chat/ChatRequestsList";

export default function DoctorMessages() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading  } = useAuth();
  const { pendingRequests, fetchPendingRequests } = useChat();

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch pending requests when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor") {
      fetchPendingRequests();
    }
  }, [isAuthenticated, fetchPendingRequests]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
          <div className="animate-pulse h-[calc(100vh-12rem)] bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Patient Messages</h1>

        {/* Show chat requests if there are any */}
        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <ChatRequestsList />
          </div>
        )}

        <ChatInterface />
      </div>
    </DashboardLayout>
  );
}
