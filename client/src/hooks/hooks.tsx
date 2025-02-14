import { useEffect, useState } from "react";
import { useSocket } from "../store/SocketContext";
import backendURL from "../utils/apiRoutes";

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

export const useFetchUser = (userId: string) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
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
  }, []);

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
  }, []);

  return { groupError, groupsLoading, groups, setGroups };
};

export const useFetchGroup = (groupId: string) => {
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
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
