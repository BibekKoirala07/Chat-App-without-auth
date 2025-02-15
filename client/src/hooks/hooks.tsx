import { useEffect, useState } from "react";
import { useSocket } from "../store/SocketContext";
import backendURL from "../utils/apiRoutes";
import { useLocation } from "react-router-dom";

const backendUrl =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

export const useFetchMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data.data);
      setLoading(false);
    };
    fetchMessages();
  }, []);

  return { messages, loading };
};

export const useFetchUser = (userId: string | undefined) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  // console.log("userId", userId);

  // console.log("user", user);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${backendURL}/api/users/getUser/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        // console.log("data in fetchUser", data);
        setUser(data.data);
        setUserLoading(false);
      } catch (err: any) {
        setUserError(err.message || "Something went wrong");
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, userLoading, userError };
};

export const useFetchUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSocket();

  useEffect(() => {
    if (!user?._id) return;
    const fetchUsers = async () => {
      const url = `${backendUrl}/api/users/getAllUsers/${user?._id}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setUsers(data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  return { users, loading, error };
};

export const useFetchGroups = () => {
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setLoading] = useState(true);
  const [groupError, setError] = useState(null);
  const { user } = useSocket();

  useEffect(() => {
    if (!user?._id) return;
    const fetchUsers = async () => {
      const url = `${backendUrl}/api/chats/getAllChats/${user?._id}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setGroups(data.data);

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?._id]);

  return { groupError, groupsLoading, groups, setGroups };
};

export const useFetchGroup = (groupId: string | undefined) => {
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return null;
      try {
        if (!groupId) return;
        const response = await fetch(
          `${backendURL}/api/chats/getChat/${groupId}`
        );
        const data = await response.json();

        console.log("data in fetchGroup", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch group");
        }

        setGroup(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  return { group, loading, error };
};

export const useLayoutLogic = () => {
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isGroupRoute = location.pathname.includes("/group/");
  const isMobile = windowWidth < 1024;
  const shouldHideUserList = isGroupRoute || isMobile;

  return {
    shouldHideUserList,
    getMainClassName: () =>
      `col-span-7 ${!shouldHideUserList ? "lg:col-span-4" : ""} min-h-screen`,
  };
};
