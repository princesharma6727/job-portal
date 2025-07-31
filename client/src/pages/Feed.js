import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Send,
  TrendingUp,
  Users,
  Briefcase,
  Globe
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState('all'); // all, career, advice, updates

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/feed?filter=${filter}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);
    try {
      const response = await axios.post('/api/feed', {
        content: newPost,
        type: 'update'
      });
      
      setPosts([response.data.post, ...posts]);
      setNewPost('');
      toast.success('Post published successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to publish post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`/api/feed/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: (post.likes || 0) + 1, isLiked: true }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleShare = async (postId) => {
    try {
      await axios.post(`/api/feed/${postId}/share`);
      toast.success('Post shared!');
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share post');
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPostIcon = (type) => {
    switch (type) {
      case 'career':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'advice':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'update':
        return <Globe className="h-5 w-5 text-purple-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">Professional Feed</h1>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Posts</option>
                <option value="career">Career Updates</option>
                <option value="advice">Career Advice</option>
                <option value="updates">General Updates</option>
              </select>
            </div>
          </div>
          
          <p className="text-gray-600">
            Share your career journey, insights, and connect with professionals in your field.
          </p>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <form onSubmit={handlePostSubmit}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your career update, advice, or insights..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">
                    {newPost.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={posting || !newPost.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {posting ? 'Publishing...' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share your career insights!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {post.author?.name || 'Anonymous'}
                        </span>
                        {post.author?.company && (
                          <span className="text-sm text-gray-500">
                            at {post.author.company}
                          </span>
                        )}
                        {getPostIcon(post.type)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-4">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center space-x-1 text-sm ${
                            post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes || 0}</span>
                        </button>
                        <button
                          onClick={() => handleShare(post._id)}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                      
                      {post.comments > 0 && (
                        <span className="text-sm text-gray-500">
                          {post.comments} comment{post.comments !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed; 