import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { commentService } from '../services/commentService'
import toast from 'react-hot-toast'

const CommentsListPage = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchComments()
  }, [filter, page])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 20
      }
      
      if (filter !== 'all') {
        params.status = filter
      }

      const response = await commentService.getComments(params)
      setComments(response.data.comments || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      toast.error(error.response?.data?.message || 'Failed to load comments')
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (commentId) => {
    try {
      await commentService.approveComment(commentId)
      toast.success('Comment approved successfully')
      fetchComments()
    } catch (error) {
      console.error('Failed to approve comment:', error)
      toast.error(error.response?.data?.message || 'Failed to approve comment')
    }
  }

  const handleReject = async (commentId) => {
    try {
      await commentService.rejectComment(commentId)
      toast.success('Comment rejected successfully')
      fetchComments()
    } catch (error) {
      console.error('Failed to reject comment:', error)
      toast.error(error.response?.data?.message || 'Failed to reject comment')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200'
    }
    return badges[status] || badges.pending
  }

  const getStatusIcon = (status) => {
    if (status === 'approved') {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    } else if (status === 'rejected') {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusCounts = () => {
    return {
      all: pagination.total,
      pending: comments.filter(c => c.status === 'pending').length,
      approved: comments.filter(c => c.status === 'approved').length,
      rejected: comments.filter(c => c.status === 'rejected').length
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and moderate comments on your posts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={() => {
              setFilter('all')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>All ({getStatusCounts().all})</span>
          </button>
          <button
            onClick={() => {
              setFilter('pending')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pending ({getStatusCounts().pending})</span>
          </button>
          <button
            onClick={() => {
              setFilter('approved')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              filter === 'approved'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Approved ({getStatusCounts().approved})</span>
          </button>
          <button
            onClick={() => {
              setFilter('rejected')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              filter === 'rejected'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>Rejected ({getStatusCounts().rejected})</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'There are no comments yet.'
              : `There are no ${filter} comments.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div key={comment._id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Comment Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-lg">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 flex-wrap gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {comment.authorName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {comment.authorEmail}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center space-x-1 ${getStatusBadge(
                              comment.status
                            )}`}
                          >
                            {getStatusIcon(comment.status)}
                            <span>{comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed pl-12">
                      {comment.content}
                    </p>

                    {/* Comment Meta */}
                    <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500 pl-12">
                      <span className="flex items-center space-x-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Posted: {formatDate(comment.createdAt)}</span>
                      </span>
                      {comment.postId && (
                        <Link
                          to={`/posts/${comment.postId._id}/preview`}
                          className="text-primary-600 hover:text-primary-700 hover:underline font-medium flex items-center space-x-1"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Post: {comment.postId.title || 'Untitled'}</span>
                        </Link>
                      )}
                      {comment.moderatedBy && (
                        <span className="flex items-center space-x-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>
                            Moderated by {comment.moderatedBy.name} on {formatDate(comment.moderatedAt)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {comment.status === 'pending' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(comment._id)}
                        className="px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all flex items-center space-x-2"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(comment._id)}
                        className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all flex items-center space-x-2"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
              <span className="font-semibold">{pagination.pages}</span> ({pagination.total} total)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex items-center space-x-2"
              >
                <span>Next</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommentsListPage
