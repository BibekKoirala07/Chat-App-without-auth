import { Outlet } from "react-router-dom";
import UserList from "../components/UserList";
import { useFetchGroups, useFetchUsers } from "../hooks/hooks";

const AppLayout = () => {
  // const location = useLocation();

  const { users } = useFetchUsers(); // Use the hook here
  const { groups, setGroups } = useFetchGroups();

  // console.log("groups", groups);

  // const shouldHideUserList =
  //   location.pathname.includes("chat") || location.pathname.includes("group");

  return (
    <div className="grid grid-cols-7 min-h-screen">
      {
        <div className="col-span-7 lg:col-span-3">
          <UserList users={users} groups={groups} setGroups={setGroups} />
        </div>
      }
      <main className="col-span-7 lg:col-span-4 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
