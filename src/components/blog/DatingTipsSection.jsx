import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  Tag,
  Share2,
} from 'lucide-react';
import { DATING_TIPS } from '../../data/datingTipsData';
import ArticleModal from './ArticleModal';
import '../../styles/blog.css';

export default function DatingTipsSection({ onNavigateAuth }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = ['All', 'First Dates', 'Profile Optimization', 'Safety & Trust', 'Conversation Starters'];

  const filteredArticles =
    selectedCategory === 'All'
      ? DATING_TIPS
      : DATING_TIPS.filter((a) => a.category === selectedCategory);

  return (
    <section id="blog" className="dating-tips-section">
      <div className="tips-container">
        {/* Section Header */}
        <div className="section-head-center">
          <div className="section-kicker">
            <BookOpen size={14} color="#FF4D85" />
            <span>Discoverable Dating Guides & Expert Advice</span>
          </div>
          <h2 className="section-heading">Smart Dating Insights for Meaningful Romance</h2>
          <p className="section-subtext">
            Actionable strategies from verified relationship coaches and real members to help you
            build confidence, craft magnetic profiles, and date safely.
          </p>
        </div>

        {/* Category Pills */}
        <div className="blog-category-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="articles-cards-grid">
          {filteredArticles.map((article) => (
            <article
              key={article.slug}
              className="article-card"
              onClick={() => setActiveArticle(article)}
            >
              <div className="article-card-thumb">
                <img src={article.image} alt={article.title} loading="lazy" />
                <span className="article-badge">{article.category}</span>
              </div>

              <div className="article-card-body">
                <div className="article-meta-row">
                  <div className="author-micro">
                    <img src={article.author.avatar} alt={article.author.name} />
                    <span>{article.author.name}</span>
                  </div>
                  <div className="read-time-micro">
                    <Clock size={12} />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.summary}</p>

                <div className="article-card-footer">
                  <span className="read-more-link">
                    Read Article <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full Article Modal */}
      <ArticleModal
        isOpen={!!activeArticle}
        onClose={() => setActiveArticle(null)}
        article={activeArticle}
        onJoinAction={onNavigateAuth}
      />
    </section>
  );
}
