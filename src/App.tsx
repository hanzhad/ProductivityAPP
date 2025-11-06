import { Component } from 'solid-js';
import Calendar from './components/Calendar';
import Header from './components/Header';
import TasksView from './components/TasksView';

const App: Component = () => {
  return (
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <Header />
      <main class="pt-4">
        <div class="grid grid-cols-1 md:grid-cols-[auto_min(320px)] gap-4 px-4">
          <Calendar />
          <TasksView />
        </div>
      </main>
    </div>
  );
};

export default App;
