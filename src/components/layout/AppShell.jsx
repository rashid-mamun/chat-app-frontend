import useUiStore from '../../store/uiStore';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import InfoPanel from './InfoPanel';
import './AppShell.css';

export default function AppShell() {
  const { isSidebarOpen, isInfoPanelOpen, closeSidebar } = useUiStore();

  return (
    <div className="app-shell surface-primary">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="app-shell__overlay lg:hidden" 
          onClick={closeSidebar} 
          aria-hidden="true" 
        />
      )}

      {/* Left Panel: Sidebar */}
      <aside className={`app-shell__sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <Sidebar />
      </aside>

      {/* Center Panel: Main Chat Area */}
      <main className="app-shell__main">
        <ChatWindow />
      </main>

      {/* Right Panel: Group / User Info */}
      <aside className={`app-shell__info ${isInfoPanelOpen ? 'is-open' : ''}`}>
        <InfoPanel />
      </aside>
    </div>
  );
}
