"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  
  // While the session is loading, show a simple loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      {session?.user?.email && (
        <div className="mb-4 text-sm text-muted-foreground">
          Signed in as {session.user.email}
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and manage your goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
          <div className="text-3xl font-bold">3</div>
          <p className="text-muted-foreground text-sm mt-2">
            Goals you're currently working on
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          <div className="text-3xl font-bold">0</div>
          <p className="text-muted-foreground text-sm mt-2">
            Goals you've accomplished
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Collaborators</h2>
          <div className="text-3xl font-bold">0</div>
          <p className="text-muted-foreground text-sm mt-2">
            People you're working with
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Goals</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">Learn Next.js</h3>
                <p className="text-muted-foreground mt-1">Complete a Next.js course and build a project</p>
              </div>
              <div className="text-sm font-medium">40%</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "40%" }}></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">Exercise regularly</h3>
                <p className="text-muted-foreground mt-1">Exercise at least 3 times per week</p>
              </div>
              <div className="text-sm font-medium">60%</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">Read more books</h3>
                <p className="text-muted-foreground mt-1">Read at least 12 books this year</p>
              </div>
              <div className="text-sm font-medium">3/12</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "25%" }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
          Create New Goal
        </button>
      </div>
    </div>
  );
} 