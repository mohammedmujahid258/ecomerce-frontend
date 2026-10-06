import { useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyProfile = { name: "", email: "", phone: "", image: "" };

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem("profile") || "null");
      return storedProfile ? { ...emptyProfile, ...storedProfile } : emptyProfile;
    } catch {
      return emptyProfile;
    }
  });
  const [saved, setSaved] = useState(false);

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updateProfile("image", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = (event) => {
    event.preventDefault();
    localStorage.setItem("profile", JSON.stringify(profile));
    setSaved(true);
  };

  const initials = profile.name
    ? profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <main className="min-h-screen bg-[#fff7d6] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Back
        </button>

        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgb(32_32_22/14%)]">
          <div className="bg-gradient-to-r from-[#ffe88a] via-[#e7b900] to-[#fff7d6] px-6 py-8 sm:px-10">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#514810]">My account</p>
            <h1 className="mt-2 text-3xl font-black text-[#202016]">Profile</h1>
            <p className="mt-1 text-sm text-[#514810]">Keep your contact details up to date.</p>
          </div>

          <form onSubmit={handleSave} className="grid gap-8 p-6 sm:grid-cols-[180px_1fr] sm:p-10">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-[#e7b900] bg-[#fff7d6] text-4xl font-black text-[#a48500]">
                {profile.image ? <img src={profile.image} alt="Profile" className="h-full w-full object-cover" /> : initials}
              </div>
              <label className="cursor-pointer rounded-full bg-[#202016] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016]">
                Add profile image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-sm font-bold text-[#202016]">Full name</label>
                <input id="profile-name" value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]" />
              </div>
              <div>
                <label htmlFor="profile-email" className="mb-1.5 block text-sm font-bold text-[#202016]">Email</label>
                <input id="profile-email" type="email" value={profile.email} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500" />
              </div>
              <div>
                <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-bold text-[#202016]">Mobile number</label>
                <input id="profile-phone" type="tel" value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} placeholder="Enter your mobile number" className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]" />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="rounded-lg bg-[#e7b900] px-6 py-3 text-sm font-black text-[#202016] transition hover:bg-[#202016] hover:text-white">Save profile</button>
                {saved && <span className="text-sm font-semibold text-emerald-600">Profile saved.</span>}
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Profile;
