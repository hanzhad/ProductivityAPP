/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import { I18nProvider } from './utils/i18n';
import './index.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

render(
  () => (
    <I18nProvider>
      <App />
    </I18nProvider>
  ),
  root!
);
