import ProfilePanel from './ProfilePanel';
import '../../styles/profile.css';

export default function ProfileScreen({ onOpenPremium }) {
  return (
    <div className="profile-container animate-fade-in">
      <ProfilePanel mode="page" onOpenPremium={onOpenPremium} />
    </div>
  );
}