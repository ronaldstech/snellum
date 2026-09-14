import { X, Sparkles, Zap } from 'lucide-react';
import '../../styles/chat.css';

const GIFTS = [
  { id: 'rose', name: 'Rose', icon: '🌹', cost: 50, color: '#EF4444' },
  { id: 'heart', name: 'Love Heart', icon: '💖', cost: 100, color: '#EC4899' },
  { id: 'teddy', name: 'Teddy Bear', icon: '🧸', cost: 150, color: '#F59E0B' },
  { id: 'champagne', name: 'Champagne', icon: '🍾', cost: 200, color: '#10B981' },
  { id: 'diamond', name: 'Diamond Ring', icon: '💍', cost: 300, color: '#3B82F6' },
  { id: 'castle', name: 'Dream Castle', icon: '🏰', cost: 500, color: '#8B5CF6' },
];

export default function GiftSelectorModal({ onSelect, onClose, balance = 0 }) {
  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="gift-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="gift-modal-header">
          <div className="gift-modal-title">
            <Sparkles size={20} color="var(--primary)" />
            <h3>Send a Virtual Gift</h3>
          </div>
          <div className="gift-balance-pill">
            <Zap size={13} color="#F59E0B" />
            <span>{balance}</span>
          </div>
        </div>

        <div className="gift-grid">
          {GIFTS.map((g) => {
            const canAfford = balance >= g.cost;
            return (
              <div
                key={g.id}
                className={`gift-card-item ${canAfford ? '' : 'unaffordable'}`}
                onClick={() => canAfford && onSelect(g)}
                title={canAfford ? `Send ${g.name}` : 'Not enough sparks'}
                style={{ opacity: canAfford ? 1 : 0.45 }}
              >
                <div className="gift-emoji">{g.icon}</div>
                <span className="gift-name">{g.name}</span>
                <span className="gift-price">{g.cost} Sparks</span>
                {!canAfford && <span className="gift-locked">Locked</span>}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="btn-icon gift-modal-close"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}