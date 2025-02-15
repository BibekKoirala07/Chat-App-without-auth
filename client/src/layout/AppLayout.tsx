import { Outlet, useLocation } from "react-router-dom";
import UserList from "../components/UserList";
import { useFetchGroups, useFetchUsers } from "../hooks/hooks";
import { useEffect, useState } from "react";

const AppLayout = () => {
  const { users } = useFetchUsers();
  const { groups, setGroups } = useFetchGroups();

  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldHideUserList =
    (location.pathname.includes("group") && windowWidth < 768) ||
    (location.pathname.includes("chat") && windowWidth < 768);

  return (
    <div className="grid grid-cols-7 min-h-screen">
      {!shouldHideUserList && (
        <div
          className={`col-span-7 md:col-span-3  pt-6 ${
            location.pathname.includes("chat") && "hidden md:block"
          }`}
        >
          <UserList users={users} groups={groups} setGroups={setGroups} />
        </div>
      )}
      <main className="col-span-7 md:col-span-4 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
