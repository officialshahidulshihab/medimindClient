'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Clock, Calendar, Tag, ArrowLeft, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  readTime?: number;
  publishedAt: string;
  tags?: string[];
}

export default function BlogDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const res = await api.get(`/blog/${slug}`);
      return res.data.data as BlogPost;
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <BookOpen className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Post Not Found</h1>
        <p className="text-[#64748B] mb-6">The blog post you are looking for does not exist.</p>
        <Link href="/blog" className="text-[#0EA5A0] hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/blog" className="inline-flex items-center text-[#64748B] hover:text-[#0EA5A0] transition-colors mb-8 text-sm">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
      </Link>

      {post.coverImage && (
        <div className="rounded-xl overflow-hidden mb-8 h-64 w-full">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {post.category && <Badge variant="default">{post.category}</Badge>}
        {post.readTime && (
          <span className="text-xs text-[#64748B] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTime} min read
          </span>
        )}
        <span className="text-xs text-[#64748B] flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-6">{post.title}</h1>

      <div className="prose prose-invert max-w-none text-[#64748B] leading-relaxed whitespace-pre-wrap mb-8">
        {post.content}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t border-[#64748B]/20">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-[#64748B]" />
            {post.tags.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
