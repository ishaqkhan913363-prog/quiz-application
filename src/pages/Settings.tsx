import { useState } from 'react';
import { useAuth } from '../App';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  LogOut, 
  ChevronRight, 
  Camera,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Settings() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile Information', icon: User, value: profile?.displayName },
        { label: 'Email Address', icon: Globe, value: profile?.email },
        { label: 'Security & Password', icon: Shield, value: 'Last changed 3mo ago' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notifications', icon: Bell, value: 'Enabled' },
        { label: 'Dark Mode', icon: isDarkMode ? Moon : Sun, value: isDarkMode ? 'On' : 'Off', toggle: true },
        { label: 'Language', icon: Globe, value: 'English (US)' },
      ]
    }
  ];

  return (
    <Layout>
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Settings</h2>
        <p className="text-on-surface-variant font-medium">Manage your account preferences and system settings.</p>
      </motion.section>

      <div className="max-w-4xl space-y-12">
        {/* Profile Header */}
        <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <img 
              src={profile?.photoURL || 'https://picsum.photos/seed/user/200/200'} 
              alt="Profile" 
              className="w-32 h-32 rounded-full border-4 border-primary/10 object-cover"
              referrerPolicy="no-referrer"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:scale-110 transition-all">
              <Camera size={18} />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-headline font-black text-on-surface mb-1">{profile?.displayName}</h3>
            <p className="text-on-surface-variant font-medium mb-4">{profile?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="bg-primary/10 text-primary px-6 py-2 rounded-xl font-bold text-sm hover:bg-primary hover:text-on-primary transition-all">
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="bg-error/10 text-error px-6 py-2 rounded-xl font-bold text-sm hover:bg-error hover:text-on-primary transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Settings Sections */}
        {sections.map((section, i) => (
          <section key={i} className="space-y-4">
            <h4 className="font-headline font-bold text-xl px-2">{section.title}</h4>
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
              {section.items.map((item, j) => (
                <button 
                  key={j}
                  onClick={() => item.toggle && setIsDarkMode(!isDarkMode)}
                  className="w-full flex items-center justify-between p-6 hover:bg-surface-container-low transition-all border-b border-outline-variant/10 last:border-0 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{item.value}</p>
                    </div>
                  </div>
                  {item.toggle ? (
                    <div className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-primary' : 'bg-outline-variant/40'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                    </div>
                  ) : (
                    <ChevronRight size={20} className="text-outline group-hover:text-primary transition-all group-hover:translate-x-1" />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="flex justify-end pt-8">
          <button 
            onClick={() => toast.success("Settings saved successfully!")}
            className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-headline font-extrabold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </Layout>
  );
}
