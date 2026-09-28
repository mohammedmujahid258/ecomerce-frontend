function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome, Admin 👋
      </p>

     <div className="mt-8 grid gap-6 md:grid-cols-3">

  <div className="rounded-xl bg-white p-6 shadow">
    <h2 className="text-xl font-bold">Products</h2>
    <p className="mt-2 text-gray-600">
      Manage your products
    </p>
  </div>

  <div className="rounded-xl bg-white p-6 shadow">
    <h2 className="text-xl font-bold">Orders</h2>
    <p className="mt-2 text-gray-600">
      Manage customer orders
    </p>
  </div>

  <div className="rounded-xl bg-white p-6 shadow">
    <h2 className="text-xl font-bold">Users</h2>
    <p className="mt-2 text-gray-600">
      View registered users
    </p>
  </div>

</div>
    </div>
  );
}

export default AdminDashboard;