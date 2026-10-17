import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/users/all");
      setUsers(response.data?.users ?? []);
    } catch (requestError) {
      console.error("Error fetching users:", requestError);
      setError("Unable to load user accounts from backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/users/all")
      .then((response) => {
        if (isMounted) setUsers(response.data?.users ?? []);
      })
      .catch((requestError) => {
        console.error("Error fetching users:", requestError);
        if (isMounted) setError("Unable to load user accounts from backend server.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50/70 p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Link to="/admin" className="hover:text-slate-900">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-900">User Directory</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Registered Accounts & Roles
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              View registered customer records and role assignments ({users.length} total users).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              &larr; Admin Home
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              🔍
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {filteredUsers.length} accounts found
          </span>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorState title="User Directory" message={error} onRetry={fetchUsers} />
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No registered users match the search filter.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const role = (u.role || "user").toLowerCase();
                  const isAdmin = role === "admin";

                  return (
                    <tr key={u._id || u.id || u.email} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-bold text-white text-xs">
                            {(u.name || "U")[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{u.name || "Unnamed"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {u.email || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                            isAdmin
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isAdmin ? "Administrator" : "Customer"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                        {u._id || u.id || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
