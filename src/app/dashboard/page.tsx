import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SignOutForm } from "@/components/auth/sign-out-form"

// Server-side function to fetch user goals using email as fallback
async function getUserGoals(userId: string, email: string) {
  // First try to find the user by ID 
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { goals: { orderBy: { updatedAt: 'desc' } } }
  });
  
  if (user) {
    return user.goals;
  }
  
  // If that fails, try to find by email
  if (email) {
    const userByEmail = await db.user.findUnique({
      where: { email },
      include: { goals: { orderBy: { updatedAt: 'desc' } } }
    });
    
    if (userByEmail) {
      return userByEmail.goals;
    }
  }
  
  // If both fail, return empty array
  return [];
}

export default async function DashboardPage() {
  // Server-side authentication check
  const session = await auth()
  
  if (!session || !session.user) {
    redirect("/login")
  }
  
  // Get user info from session
  const userId = session.user.id; // This might be undefined initially
  const email = session.user.email; // Email should always be available from Google
  
  if (!email) {
    redirect("/login")
  }
  
  // Fetch user goals on the server using both ID and email as fallback
  const goals = await getUserGoals(userId || '', email);
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {session.user.image && (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
              <img 
                src={session.user.image} 
                alt={`${session.user.name || 'User'}'s profile`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            {session.user.email && (
              <div className="text-sm text-muted-foreground mt-1">
                Signed in as {session.user.email}
              </div>
            )}
          </div>
        </div>
        
        <SignOutForm variant="ghost" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
          <div className="text-3xl font-bold">{goals.length}</div>
          <p className="text-muted-foreground text-sm mt-2">
            Goals you're currently working on
          </p>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Completed Goals</h2>
          <div className="text-3xl font-bold">
            {goals.filter(goal => goal.progress >= (goal.target || 100)).length}
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            Goals you've successfully achieved
          </p>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
          <div className="text-3xl font-bold">
            {goals.length > 0 
              ? Math.round(goals.reduce((acc, goal) => 
                  acc + (goal.progress / (goal.target || 100) * 100), 0) / goals.length)
              : 0}%
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            Your average completion rate
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Goals</h2>
        <div className="grid grid-cols-1 gap-4">
          {goals.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">You don't have any goals yet.</p>
              <button className="mt-4 text-primary hover:underline">Create your first goal</button>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {Math.min(100, Math.round(goal.progress / (goal.target || 100) * 100))}%
                  </span>
                </div>
                {goal.description && (
                  <p className="text-muted-foreground text-sm mt-2">{goal.description}</p>
                )}
                <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(100, Math.round(goal.progress / (goal.target || 100) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{goal.progress}</span>
                  <span>{goal.target || 100}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 