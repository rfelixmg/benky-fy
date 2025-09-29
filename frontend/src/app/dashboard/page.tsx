import { cookies } from 'next/headers';

async function getFlashcardStats() {
  const cookieStore = cookies();
  const session = cookieStore.get('session');

  try {
    const response = await fetch('http://localhost:5000/api/flashcards/stats', {
      credentials: 'include',
      headers: {
        Cookie: `session=${session?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await getFlashcardStats();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Your Learning Dashboard</h2>
          
          {/* Flask API Integration Demo */}
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Flask Backend Integration
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-green-800 truncate">
                      API Status
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-900">
                      Connected
                    </dd>
                  </div>
                </div>
                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-blue-800 truncate">
                      Session Active
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-900">
                      Yes
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {stats && (
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Your Progress
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Cards
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stats.total_cards}
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stats.completed}
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Accuracy
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stats.accuracy}%
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
