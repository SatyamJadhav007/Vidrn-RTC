import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false, disableScroll = false }) => {
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Navbar />

          <main
            className={`flex-1 ${disableScroll ? "overflow-hidden" : "overflow-y-auto"}`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
