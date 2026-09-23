import { createPortal } from 'react-dom';
import DiscoveryFiltersPanel from './DiscoveryFiltersPanel';

export default function DiscoveryFiltersModal({ onClose, onOpenPremium }) {
  return createPortal(
    <div className="modal-overlay filters-overlay" onClick={onClose}>
      <div
        className="discovery-filters-modal animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Discovery Filters"
      >
        <DiscoveryFiltersPanel onClose={onClose} onOpenPremium={onOpenPremium} mode="modal" />
      </div>
    </div>,
    document.body
  );
}