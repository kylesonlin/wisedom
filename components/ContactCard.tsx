import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Conversation {
  id: string;
  timestamp: string;
  content: string;
  type: 'email' | 'call' | 'meeting' | 'message';
  sentiment?: 'positive' | 'neutral' | 'negative';
  followUpAction?: string;
}

interface ContactCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  imageUrl?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function isDate(val: unknown): val is Date {
  return val instanceof Date && !isNaN(val.getTime());
}

const ContactCard: React.FC<ContactCardProps> = ({
  id,
  name,
  email,
  phone,
  company,
  position,
  imageUrl,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('contact_id', id)
          .order('timestamp', { ascending: false })
          .limit(5);

        if (error) throw error;
        setConversations(
          (data || []).map(convo => ({
            ...convo,
            timestamp: convo.timestamp ? new Date(convo.timestamp) : undefined,
          }))
        );
      } catch (err) {
        setError('Failed to fetch conversation history');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [id]);

  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
    }
  };

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'call':
        return '📞';
      case 'meeting':
        return '📅';
      case 'message':
        return '💬';
      default:
        return '📝';
    }
  };

  return (
    <div className="contact-card">
      <div className="contact-card__header">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`${name}'s profile`}
            className="contact-card__image"
          />
        )}
        <h2 className="contact-card__name">{name}</h2>
        {position && <p className="contact-card__position">{position}</p>}
        {company && <p className="contact-card__company">{company}</p>}
      </div>
      
      <div className="contact-card__details">
        <p className="contact-card__email">
          <span className="contact-card__label">Email:</span> {email}
        </p>
        {phone && (
          <p className="contact-card__phone">
            <span className="contact-card__label">Phone:</span> {phone}
          </p>
        )}
      </div>

      <div className="contact-card__conversations">
        <h3 className="contact-card__conversations-title">Recent Interactions</h3>
        {loading ? (
          <p>Loading conversations...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : conversations.length === 0 ? (
          <p>No recent conversations</p>
        ) : (
          <ul className="contact-card__conversations-list">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="contact-card__conversation-item">
                <div className="contact-card__conversation-header">
                  <span className="contact-card__conversation-type">
                    {getConversationTypeIcon(conversation.type)}
                  </span>
                  <span className="contact-card__conversation-date">
                    {isDate(conversation.timestamp) ? conversation.timestamp.toLocaleDateString() : ''}
                  </span>
                  {conversation.sentiment && (
                    <span className="contact-card__conversation-sentiment">
                      {getSentimentEmoji(conversation.sentiment)}
                    </span>
                  )}
                </div>
                <p className="contact-card__conversation-content">
                  {conversation.content}
                </p>
                {conversation.followUpAction && (
                  <div className="contact-card__follow-up">
                    <span className="contact-card__follow-up-label">Follow-up:</span>
                    <span className="contact-card__follow-up-action">
                      {conversation.followUpAction}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .contact-card {
          border: 1px solid #e1e1e1;
          border-radius: 8px;
          padding: 20px;
          max-width: 400px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background-color: white;
        }

        .contact-card__header {
          text-align: center;
          margin-bottom: 20px;
        }

        .contact-card__image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
        }

        .contact-card__name {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .contact-card__position,
        .contact-card__company {
          margin: 5px 0;
          color: #666;
          font-size: 0.9rem;
        }

        .contact-card__details {
          border-top: 1px solid #e1e1e1;
          padding-top: 15px;
          margin-bottom: 20px;
        }

        .contact-card__email,
        .contact-card__phone {
          margin: 5px 0;
          color: #444;
        }

        .contact-card__label {
          font-weight: bold;
          color: #333;
        }

        .contact-card__conversations {
          border-top: 1px solid #e1e1e1;
          padding-top: 15px;
        }

        .contact-card__conversations-title {
          font-size: 1.2rem;
          margin-bottom: 10px;
          color: #333;
        }

        .contact-card__conversations-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .contact-card__conversation-item {
          padding: 10px;
          border-bottom: 1px solid #f0f0f0;
        }

        .contact-card__conversation-item:last-child {
          border-bottom: none;
        }

        .contact-card__conversation-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }

        .contact-card__conversation-type {
          font-size: 1.2rem;
        }

        .contact-card__conversation-date {
          color: #666;
          font-size: 0.9rem;
        }

        .contact-card__conversation-content {
          margin: 5px 0;
          color: #444;
          font-size: 0.95rem;
        }

        .contact-card__follow-up {
          margin-top: 5px;
          padding: 5px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .contact-card__follow-up-label {
          font-weight: bold;
          color: #333;
          margin-right: 5px;
        }

        .contact-card__follow-up-action {
          color: #666;
        }

        .error {
          color: #dc3545;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default ContactCard; 