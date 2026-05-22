import JobChecklist from "@/components/JobChecklist";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black p-8">
      <main className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Job Search Tracker</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Keep track of your applications and progress.</p>
        </header>
        
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <JobChecklist />
        </div>
      </main>
    </div>
  );
}
