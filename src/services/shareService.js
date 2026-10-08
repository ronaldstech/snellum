/**
 * Web Share API, Deep Linking & Referral System
 */

export const shareService = {
  /**
   * Native Web Share API with graceful fallback detection
   */
  async shareContent({ title, text, url }) {
    const fullUrl = url || window.location.href;
    const shareData = {
      title: title || 'Snellum Dating',
      text: text || 'Discover meaningful connections on Snellum.',
      url: fullUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, aborted: true };
        }
        // Fallback to clipboard if sharing threw an error
      }
    }

    // Fallback: Copy to clipboard
    const copied = await this.copyToClipboard(fullUrl);
    return { success: copied, method: 'clipboard' };
  },

  /**
   * Clipboard Copy Helper
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  },

  /**
   * Generate Direct Social Sharing URLs
   */
  getSocialShareUrls({ title, text, url }) {
    const encodedUrl = encodeURIComponent(url || window.location.href);
    const encodedText = encodeURIComponent(`${text || title}\n\n${url}`);
    const encodedTitle = encodeURIComponent(title || 'Snellum Dating');

    return {
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=Snellum,Dating,Malawi`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      sms: `sms:?&body=${encodedText}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
    };
  },

  /**
   * Get or generate user's unique referral code
   */
  getUserReferralCode(user) {
    if (!user) return 'SNELLUM-VIP';
    const cleanId = (user.uid || user.id || 'MEM').replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();
    return `SNELLUM-${cleanId}`;
  },

  /**
   * Generate full invite / referral deep link
   */
  getReferralLink(user) {
    const origin = window.location.origin;
    const code = this.getUserReferralCode(user);
    return `${origin}/?ref=${code}`;
  },

  /**
   * Generate Public Profile deep link
   */
  getProfileShareLink(profileId, referralCode = null) {
    const origin = window.location.origin;
    const refParam = referralCode ? `&ref=${referralCode}` : '';
    return `${origin}/?profile=${profileId}${refParam}`;
  },

  /**
   * Generate Dating Event deep link
   */
  getEventShareLink(eventId, referralCode = null) {
    const origin = window.location.origin;
    const refParam = referralCode ? `&ref=${referralCode}` : '';
    return `${origin}/?event=${eventId}${refParam}`;
  },

  /**
   * Generate Blog Article deep link
   */
  getArticleShareLink(slug) {
    const origin = window.location.origin;
    return `${origin}/?article=${slug}`;
  },
};
