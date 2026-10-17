import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import AdminLayout from "../Components/AdminLayout";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";
import { notifyToast } from "../utils/cartWishlistEvents";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/users/all");
      setUsers(response.data?.users ?? []);
    } catch (requestError) {
      console.error("Error fetching users:", requestError);
      setError("Unable to load user accounts from backend server.");
      notifyToast("Failed to fetch user directory", "error");
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
        if (isMounted) {
          setError("Unable to load user accounts from backend server.");
          notifyToast("Failed to fetch user directory", "error");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Summary counts
  const adminCount = useMemo(() => {
    return users.filter((u) => (u.role || "").toLowerCase() === "admin").length;
  }, [users]);

  const customerCount = useMemo(() => {
    return users.filter((u) => (u.role || "").toLowerCase() !== "admin").length;
  }, [users]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const role = (u.role || "user").toLowerCase();

      // Role filter
      if (roleFilter === "admin" && role !== "admin") return false;
      if (roleFilter === "customer" && role === "admin") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (u.name || "").toLowerCase().includes(q);
        const matchesEmail = (u.email || "").toLowerCase().includes(q);
        const matchesId = (u._id || u.id || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId) return false;
      }

      return true;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <AdminLayout
      title="User Directory & Accounts"
      subtitle="Inspect registered customer records, verified email profiles, and role assignments"
      breadcrumbs={["Users"]}
      actions={
        <button
          type="button"
          onClick={fetchUsers}
          className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
        >
          ↻ Refresh Directory
        </button>
      }
    >
      <div className="space-y-6">
        {/* Metric summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Total Accounts
            </span>
            <p className="font-editorial text-2xl font-bold text-stone-900 mt-1">
              {users.length}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Across all security tiers</p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Administrators
            </span>
            <p className="font-editorial text-2xl font-bold text-stone-900 mt-1">
              {adminCount}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Full console privileges</p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Customer Accounts
            </span>
            <p className="font-editorial text-2xl font-bold text-stone-900 mt-1">
              {customerCount}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Storefront buyers</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, email, or user ID..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-xs text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All Users" },
                { key: "admin", label: "Admins" },
                { key: "customer", label: "Customers" },
              ].map(({ key, label }) => {
                const active = roleFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRoleFilter(key)}
                    className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-stone-900 text-white shadow-xs"
                        : "bg-stone-50 border border-stone-200/80 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing <strong className="text-stone-900">{filteredUsers.length}</strong> of{" "}
              <strong>{users.length}</strong> registered accounts
            </span>
            {(searchQuery || roleFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
                className="font-semibold text-stone-700 hover:text-stone-900 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-xs">
            <ErrorState title="User Directory" message={error} onRetry={fetchUsers} />
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Retrieving account directory..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/90 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-2xl text-stone-500 mb-3">
              👥
            </div>
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              No matching accounts
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              {searchQuery || roleFilter !== "all"
                ? "Try searching with a different name or email."
                : "No registered accounts found in the database."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-stone-200/90 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/80 font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-6 py-4">Account Holder</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Access Role</th>
                  <th className="px-6 py-4">Database Identifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => {
                  const role = (u.role || "user").toLowerCase();
                  const isAdmin = role === "admin";
                  const initial = (u.name || u.email || "U")[0].toUpperCase();

                  return (
                    <tr key={u._id || u.id || u.email} className="hover:bg-stone-50/50 transition">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900 font-bold text-white text-xs">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block">
                              {u.name || "Unnamed User"}
                            </span>
                            {u.createdAt && (
                              <span className="text-[11px] text-stone-400 block">
                                Joined {new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <a
                          href={`mailto:${u.email}`}
                          className="font-medium text-stone-700 hover:text-stone-900 hover:underline"
                        >
                          {u.email || "-"}
                        </a>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[11px] font-bold ${
                            isAdmin
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-stone-50 text-stone-700 border-stone-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isAdmin ? "bg-amber-500" : "bg-stone-400"
                            }`}
                          />
                          {isAdmin ? "Administrator" : "Customer"}
                        </span>
                      </td>

                      {/* User ID */}
                      <td className="px-6 py-4 font-mono text-[11px] text-stone-400">
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
    </AdminLayout>
  );
}
