// src/pages/GlobalCafe.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Heart, MessageCircle, Send, Plus, MoreHorizontal, Coffee } from 'lucide-react';
import { format } from 'date-fns';

const PostCard = ({ post, onLike, onComment, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isLiked = post.likes?.some(like => like.userId === currentUser.id);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post._id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      await onComment(post._id, commentText.trim());
      setCommentText('');
      setShowComments(true);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 card-hover">
      <div className="card-body p-4">
        {/* Post Header */}
        <div className="flex items-start gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full border-2 border-base-300">
              <img src={post.avatarUrl} alt={post.username} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">{post.username}</h4>
                <p className="text-xs text-base-content/60">
                  {format(new Date(post.timestamp), 'MMM d, h:mm a')}
                  {post.isEdited && ' • edited'}
                </p>
              </div>
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-32 border border-base-300">
                  <li><a className="text-sm">Report</a></li>
                </ul>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="mt-3">
              <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
            </div>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-base-300">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 btn btn-ghost btn-sm ${isLiked ? 'text-error' : 'text-base-content/60'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likesCount}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 btn btn-ghost btn-sm text-base-content/60"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{commentsCount}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-base-300 space-y-3">
            {/* Existing Comments */}
            {post.comments?.map((comment) => (
              <div key={comment._id} className="flex items-start gap-2">
                <div className="avatar">
                  <div className="w-6 h-6 rounded-full">
                    <img src={comment.avatarUrl} alt={comment.username} />
                  </div>
                </div>
                <div className="flex-1 bg-base-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{comment.username}</span>
                    <span className="text-xs text-base-content/50">
                      {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm mt-1 break-words">{comment.content}</p>
                </div>
              </div>
            ))}

            {/* Add Comment Form */}
            <form onSubmit={handleComment} className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-6 h-6 rounded-full">
                  <img src={currentUser.avatarUrl} alt={currentUser.username} />
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="input input-sm input-bordered flex-1"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isCommenting}
                  className="btn btn-primary btn-sm btn-circle"
                >
                  {isCommenting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat/posts', {
        content: content.trim(),
        user
      });
      
      toast.success('Post created successfully!');
      onSuccess(response.data);
      setContent('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create a new post</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full border-2 border-base-300">
                <img src={user?.avatarUrl} alt={user?.username} />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                className="textarea textarea-bordered w-full h-32 resize-none"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={1000}
                required
              />
              <div className="text-right text-xs text-base-content/50 mt-1">
                {content.length}/1000
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={!content.trim() || isLoading}
            >
              {isLoading && <span className="loading loading-spinner loading-sm"></span>}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GlobalCafe = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const bottomRef = useRef(null);

  // Load posts
  const loadPosts = async (pageNum = 1, reset = false) => {
    try {
      const response = await axios.get('/api/chat/posts', {
        params: { page: pageNum, limit: 10 }
      });
      
      const newPosts = response.data.posts || [];
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1, true);
  }, []);

  // Socket connection for real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('joinGlobalCafe', user);

      socket.on('newPost', (post) => {
        setPosts(prev => [post, ...prev]);
      });

      socket.on('postLiked', (updatedPost) => {
        setPosts(prev => prev.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        ));
      });

      socket.on('postCommented', (updatedPost) => {
        setPosts(prev => prev.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        ));
      });

      return () => {
        socket.off('newPost');
        socket.off('postLiked');
        socket.off('postCommented');
      };
    }
  }, [socket, isConnected, user]);

  const handleCreatePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    // Emit to socket for real-time updates to other users
    if (socket) {
      socket.emit('newPost', newPost);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/chat/posts/${postId}/like`, { user });
      const updatedPost = response.data;
      
      setPosts(prev => prev.map(post => 
        post._id === postId ? updatedPost : post
      ));

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('postLiked', updatedPost);
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await axios.post(`/api/chat/posts/${postId}/comment`, {
        content,
        user
      });
      const updatedPost = response.data;
      
      setPosts(prev => prev.map(post => 
        post._id === postId ? updatedPost : post
      ));

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('postCommented', updatedPost);
      }
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1, false);
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/60">Loading Global Cafe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Global Cafe</h1>
          <p className="text-base-content/60">Share your thoughts with the community</p>
        </div>

        {/* Create Post Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          >
            <Plus className="w-4 h-4" />
            What's on your mind?
          </button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <Coffee className="w-16 h-16 text-base-content/20 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-base-content/60 mb-2">
                No posts yet
              </h3>
              <p className="text-base-content/40 mb-4">
                Be the first to share something with the community!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Post
              </button>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  currentUser={user}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={loadMorePosts}
                    className="btn btn-outline"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Load More Posts'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreatePost}
      />
    </div>
  );
};

export default GlobalCafe;