import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Calendar,
  Share2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Heart,
} from 'lucide-react';
import { shareService } from '../../services/shareService';
import { updateSeoMeta } from '../../utils/seo';
import ShareModal from '../common/ShareModal';
import '../../styles/blog.css';

export default function ArticleModal({ isOpen, onClose, article, onJoinAction }) {
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (isOpen && article) {
      updateSeoMeta({
        title: `${article.title} - Snellum Dating Advice & Tips`,
        description: article.summary,
        image: article.image,
        type: 'article',
        url: shareService.getArticleShareLink(article.slug),
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.title,
          image: [article.image],
          datePublished: '2026-10-08T08:00:00+02:00',
          author: {
            '@type': 'Person',
            name: article.author?.name || 'Snellum Team',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Snellum Dating',
            logo: {
              '@type': 'ImageObject',
              url: 'https://snellum.web.app/newlogo.png',
            },
          },
          description: article.summary,
        },
      });
    }
  }, [isOpen, article]);

  if (!isOpen || !article) return null;

  const articleLink = shareService.getArticleShareLink(article.slug);

  const handleShare = async () => {
    const res = await shareService.shareContent({
      title: article.title,
      text: `Read "${article.title}" on Snellum Dating Tips:`,
      url: articleLink,
    });
    if (!res.success || res.method === 'clipboard') {
      setShareOpen(true);
    }
  };

  return (
    <>
      <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
        <div className="article-modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Header Bar */}
          <div className="article-modal-header">
            <div className="article-category-badge">{article.category}</div>
            <div className="article-header-actions">
              <button
                type="button"
                className="btn-article-share"
                onClick={handleShare}
                title="Share this guide"
              >
                <Share2 size={16} />
                <span>Share Guide</span>
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={onClose}
                aria-label="Close article"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Article Hero */}
          <div className="article-modal-hero">
            <h1>{article.title}</h1>
            <p className="article-lead">{article.summary}</p>

            <div className="article-author-row">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="author-avatar"
              />
              <div className="author-info">
                <strong>{article.author.name}</strong>
                <span>{article.author.role}</span>
              </div>
              <div className="article-meta-divider" />
              <div className="article-time-badge">
                <Clock size={13} />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="article-hero-img-wrap">
            <img src={article.image} alt={article.title} />
          </div>

          {/* Article Content */}
          <div className="article-content-body">
            {article.sections?.map((sec, idx) => (
              <div key={idx} className="article-content-section">
                <h2>{sec.heading}</h2>
                <div className="article-paragraphs">
                  {sec.content.split('\n').map((line, pIdx) => (
                    <p key={pIdx}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Bottom Call to Action */}
            <div className="article-cta-box">
              <div className="cta-icon-wrap">
                <Heart size={24} color="#FF4D85" />
              </div>
              <h3>Ready to Spark Genuine Chemistry?</h3>
              <p>
                Apply these dating strategies with verified singles in Malawi today.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onClose();
                  if (onJoinAction) onJoinAction();
                }}
              >
                <span>Join Snellum Free</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={article.title}
        text={`Helpful dating guide from Snellum: "${article.title}"`}
        url={articleLink}
      />
    </>
  );
}
