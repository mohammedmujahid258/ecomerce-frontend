import { useEffect, useState } from "react";
import { api } from "../api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // The backend currently exposes the authenticated user profile,
        // but not a GET /users list endpoint.
        const response = await api.get("/users/all");
        setUsers(response.data.users)
      } catch (requestError) {
        console.error("Error fetching users:", requestError);
        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p className="p-8 text-lg text-gray-600">Loading users...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">Manage Users</h1>

      {error && <p className="text-red-600">{error}</p>}

      {!error && users.length === 0 && (
        <p className="text-gray-600">No users found.</p>
      )}

      {!error && users.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id || user.id || user.email} className="border-t">
                  <td className="p-4">{user.name || "-"}</td>
                  <td className="p-4">{user.email || "-"}</td>
                  <td className="p-4">{user.role || "user"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AdminUsers;
