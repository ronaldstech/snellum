import DiscoveryFiltersPanel from './DiscoveryFiltersPanel';
import '../../styles/filters.css';

export default function DiscoveryFiltersSidebar({ onOpenPremium }) {
  return (
    <aside className="discovery-filter-pane" aria-label="Discovery filters sidebar">
      <div className="discovery-filters-sidebar">
        <DiscoveryFiltersPanel onOpenPremium={onOpenPremium} mode="sidebar" />
      </div>
    </aside>
  );
}