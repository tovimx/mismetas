import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | MisMetas",
  description: "Track and manage your goals"
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and manage your goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
          <div className="text-3xl font-bold">0</div>
          <p className="text-muted-foreground text-sm mt-2">
            You haven't created any goals yet
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

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Create Your First Goal</h2>
        <p className="mb-4">
          Start by creating a goal and tracking your progress towards it.
        </p>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
          Create Goal
        </button>
      </div>
    </div>
  );
} 