import { Component } from 'solid-js';
import Calendar from './components/Calendar';
import Header from './components/Header';

const App: Component = () => {
  return (
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <Header />
      <main class="pt-4">
        <div class="grid grid-cols-1 md:grid-cols-[auto_min(320px)]">
          {/*<div>*/}
          <Calendar />
          {/*<TasksView />*/}
        </div>
      </main>
    </div>
  );
};

export default App;
