import { useState } from 'react';
import Sidebar from '@/react-app/components/Sidebar';
import Today from '@/react-app/pages/Today';
import Tasks from '@/react-app/pages/Tasks';
import Goals from '@/react-app/pages/Goals';
import Notes from '@/react-app/pages/Notes';
import Habits from '@/react-app/pages/Habits';
import WeeklyReview from '@/react-app/pages/WeeklyReview';
import Settings from '@/react-app/pages/Settings';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('today');

  const renderPage = () => {
    switch (currentPage) {
      case 'today':
        return <Today />;
      case 'tasks':
        return <Tasks />;
      case 'goals':
        return <Goals />;
      case 'notes':
        return <Notes />;
      case 'habits':
        return <Habits />;
      case 'review':
        return <WeeklyReview />;
      case 'settings':
        return <Settings />;
      default:
        return <Today />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}
